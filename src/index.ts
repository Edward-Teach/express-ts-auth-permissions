import * as dotenv from 'dotenv';
import express, { Express, Response } from 'express';
import RedisCache from "./cache/redisCache";
import Database from "./database/database";
import './listeners/userListener';
import { JobScheduler } from "./jobs/jobScheduler";
import { JobProcessor } from "./jobs/jobProcessor"; // Import the listener to register it
import { initializeI18n } from "./i18n.config";
import { getAWSCredentials, initializeSESClient } from "./aws.config";
import { createRateLimiter } from "./rateLimit.config";
import initializePassport from "./passport.config";
import { authRoutes } from "./routes/auth";
import { checkPermissionMiddleware } from "./middlewares/checkPermission.middleware";
import { roleRoutes } from "./routes/role";
import { permissionRoutes } from "./routes/permission";
import cors from 'cors';

dotenv.config();

export let jobScheduler: any;
export const sesClient = initializeSESClient();
export const i18n = initializeI18n();
export const passport = initializePassport();
const app: Express = express();
app.set('trust proxy', 1);

const router = express.Router();

// Initialize Redis once at application start
(async () => {
    await getAWSCredentials();
    await RedisCache.initialize();
    await Database.initialize();
    jobScheduler = new JobScheduler()
    new JobProcessor(jobScheduler, 5000)

    const limiter = createRateLimiter();
    // middlewares
    app.use(cors())
    app.use(express.json());
    app.use(i18n.init)
    app.use(limiter)
    app.use(passport.initialize());

    app.use((req: any, res: Response, next) => {
        const lang = req.headers['accept-language'];
        if ( lang ) {
            i18n.setLocale(lang);
        }
        next();
    });

    if ( passport ) {
        const ar = authRoutes(router, passport);
        app.use('/auth', ar);
        const r = roleRoutes(router, passport);
        app.use('/', r);
        const p = permissionRoutes(router, passport)
        app.use('/', p);

        app.get(
            '/profile',
            passport.authenticate('jwt', { session: false }),
            checkPermissionMiddleware('test-permission-1'),
            (req: any, res: Response) => {
                console.log('get profile')
                return res.status(200).send(req.user);
            });
    }

// Ensure the Redis client is closed when the process is terminated
    process.on('SIGINT', async () => {
        await Database.close();
        await RedisCache.close();
        process.exit(0);
    });


    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });


})()
    .catch((err: any) => {
        console.error('Initialization error:', err);
        process.exit(1);
    });


export const indexApp = app;
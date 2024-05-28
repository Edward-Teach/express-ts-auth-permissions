import { rateLimit } from 'express-rate-limit'
import { RedisStore } from 'rate-limit-redis'
import RedisCache from "./cache/redisCache";
import {NextFunction} from "express";


export const createRateLimiter = () => {
    return rateLimit({
        windowMs: 60*1000, // 1 minute
        limit: 20, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
        standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
        legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
        store: new RedisStore({
            sendCommand: (...args: string[]) => RedisCache.client.sendCommand(args),
        }),
        handler: (req: any, res: any, next: NextFunction, options) => {
            return res.status(options.statusCode).json({
                message: "Too many requests, please try again later.",
                statusCode: options.statusCode
            });
        }
    })
}
// config/passportConfig.ts
import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from "./models/User";
import * as dotenv from "dotenv";
import RedisCache from "./cache/redisCache";

dotenv.config();

const secret = process.env.JWT_SECRET!;
console.info('JWT Secret:', secret); // Debugging statement

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: secret,
    // opts.issuer = 'accounts.examplesoft.com'; TODO
    // opts.audience = 'yoursite.net';
};

const initializePassport = () => {
    passport.use(
        new JwtStrategy(opts, async (jwt_payload, done) => {
            console.log('jwt_payload', jwt_payload)
            try {

                const cachedUser = await RedisCache.get(`user:${jwt_payload.id}`);
                if ( cachedUser ) {
                    return done(null, JSON.parse(cachedUser));
                }

                // TODO PERMISSIONS AND CACHE
                // TODO update permissions or role => remember to clear the cache
                // Also fire an event "roleOrPermissionUpdated"
                // => this could trigger a websocket or similar strategy to update the user's permissions client-side'

                const user = await User.findByPk(jwt_payload.id);
                if ( user ) {
                    await RedisCache.set(`user:${jwt_payload.id}`, JSON.stringify(user), 60*10); // Cache for 10 minutes
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            } catch ( err ) {
                return done(err, false);
            }
        })
    );
    return passport
}


export default initializePassport;

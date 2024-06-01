// config/passportConfig.ts
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';
import { User } from "./models/User";
import * as dotenv from "dotenv";
import RedisCache from "./cache/redisCache";
import { Role } from "./models/Role";
import { Permission } from "./models/Permission";

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
                const user: any = (await User.findByPk(jwt_payload.id, {
                    include: [
                        {
                            model: Role
                        },
                        {
                            model: Permission
                        }
                    ]
                }))?.dataValues;
                if ( user ) {
                    const userPermissions = user.permissions.map((p: any) => p.dataValues.name);
                    const userRoles = user.roles.map((p: any) => p.dataValues.name);
                    const rolePermissions = user.roles.flatMap((p: any) => p.dataValues.permissions.map((p: any) => p.dataValues.name));
                    user.permissions = Array.from(new Set([...userPermissions, ...rolePermissions]))
                    user.roles = userRoles;
                    await RedisCache.set(`user:${jwt_payload.id}`, JSON.stringify(user), 60 * 10); // Cache for 10 minutes
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

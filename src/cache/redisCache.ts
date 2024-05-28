import { createClient, RedisClientType } from 'redis';

class RedisCache {
    private static _client: RedisClientType;

    private constructor() {}


    static get client(): RedisClientType {
        if (!this._client) {
            throw new Error("Redis client is not initialized. Call RedisCache.initialize() first.");
        }
        return this._client;
    }

    public static async initialize() {
        if (!this._client) {
            this._client = createClient({
                url: process.env.REDIS_URL
            });

            this._client.on('error', (err) => console.error('Redis Client Error', err));

            await this._client.connect();
            console.log('Redis client connected');
        }
    }

    public static async set(key: string, value: string, expiration: number): Promise<void> {
        await this._client.set(key, value, {EX: expiration});
    }

    public static async get(key: string): Promise<string | null> {
        return await this._client.get(key);
    }

    public static async delete(key: string): Promise<number> {
        return await this._client.del(key);
    }

    public static async close(): Promise<void> {
        if (this._client) {
            await this._client.disconnect();
            console.log('Redis client disconnected');
        }
    }
}

export default RedisCache;
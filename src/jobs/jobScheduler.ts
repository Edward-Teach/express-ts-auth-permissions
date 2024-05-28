import { createClient, RedisClientType } from 'redis';
import {IJob} from "../interfaces/IJob";
import RedisCache from "../cache/redisCache";


export class JobScheduler {
    private client: RedisClientType;

    constructor() {
        this.client = RedisCache.client;
    }

    async scheduleJob(job: IJob): Promise<void> {
        await this.client.zAdd('jobs', {
            score: job.timestamp,
            value: JSON.stringify(job),
        });
    }

    async getDueJobs(): Promise<IJob[]> {
        const now = Date.now();
        const jobs = await this.client.zRangeByScore('jobs', 0, now);
        return jobs.map((jobString) => JSON.parse(jobString));
    }

    async removeJob(job: IJob): Promise<void> {
        await this.client.zRem('jobs', JSON.stringify(job));
    }
}

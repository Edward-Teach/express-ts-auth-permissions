import {JobScheduler} from "./jobScheduler";
import {sendVerificationEmailJob} from "./sendVerificationEmailJob";


export class JobProcessor {
    private readonly interval: number;
    private jobScheduler: JobScheduler;

    constructor(jobScheduler: JobScheduler, interval: number = 5000) { // default interval of 5 seconds
        this.interval = interval;
        this.jobScheduler = jobScheduler;
        this.startProcessing();
    }

    private async processJobs(): Promise<void> {
        const dueJobs = await this.jobScheduler.getDueJobs();
        for (const job of dueJobs) {
            // Process the job
            console.info(`Processing job ${job.id}`);
            switch (job.type){
                case 'sendVerificationEmailJob':
                    await sendVerificationEmailJob(job.payload)
                    break
            }

            // Remove job from the queue
            await this.jobScheduler.removeJob(job);
        }
    }

    private startProcessing(): void {
        setInterval(() => this.processJobs(), this.interval);
    }
}



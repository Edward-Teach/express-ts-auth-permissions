import { JobScheduler } from "./jobScheduler";
import { sendVerificationEmailJob } from "./sendVerificationEmailJob";


export class JobProcessor {
    private readonly interval: number;
    private jobScheduler: JobScheduler;

    constructor(jobScheduler: JobScheduler, interval: number = 5000) { // default interval of 5 seconds
        this.interval = interval;
        this.jobScheduler = jobScheduler;
        this.startProcessing();
    }

    /**
     * Processes due jobs from the job scheduler.
     *
     * @remarks
     * This method retrieves due jobs from the job scheduler, processes them, and removes them from the queue.
     * The processing of each job is based on its type, and the corresponding job function is called.
     *
     * @returns {Promise<void>} - A promise that resolves when all due jobs have been processed and removed.
     */
    private async processJobs(): Promise<void> {
        // Retrieve due jobs from the job scheduler
        const dueJobs = await this.jobScheduler.getDueJobs();

        // Process each due job
        for ( const job of dueJobs ) {
            // Determine the type of job and process it accordingly
            switch ( job.type ) {
                case 'endVerificationEmailJob':
                    // Call the sendVerificationEmailJob function with the job payload
                    await sendVerificationEmailJob(job.payload);
                    break;
                // Add more cases for other job types as needed
            }

            // Remove the processed job from the job scheduler
            await this.jobScheduler.removeJob(job);
        }
    }

    private startProcessing(): void {
        setInterval(() => this.processJobs(), this.interval);
    }
}



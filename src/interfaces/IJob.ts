export interface IJob {
    id: string;
    timestamp: number; // Time when the job is supposed to run
    type: any;
    payload: any; // Job payload
}

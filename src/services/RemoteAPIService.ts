import { createQueue, DoneCallback, Queue } from 'kue';
import * as request from 'request';

export class RemoteAPIService {

    // The queue used to process the https requests
    protected static queue: Queue;

    protected static workers: number;

    protected static init(): void {

        // Create a Queue, or get the singleton reference if it already exists
        RemoteAPIService.queue = createQueue({
            prefix: 'q',
            redis: {
                port: process.env.REDIS_PORT,
                host: 'redis',
            },
        });
    }

    public static get(options: any, done: DoneCallback): void {

        request({
            followAllRedirects: true,
            url: options.path,
            baseUrl: `https://${options.host}`,
            headers: options.headers,
        },  (error, response, body) => {

            if (response && response.statusCode === 200) {
                done(error, JSON.parse(body));
            } else if (!error) {
                done(new Error(`Status: ${response.statusCode} (${response.statusMessage})`));
            } else {
                done(error);
            }
        });

    }

    protected static async getWithPromise(jobName: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {

            const job = RemoteAPIService.queue.create(jobName, data);
            job.on('complete', (result) => {
                resolve(result);

            }).on('failed', (errorMessage) => {
                reject(errorMessage);
            }).save();
        });
    }
}

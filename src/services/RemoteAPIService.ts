import { createQueue, DoneCallback, Queue } from 'kue';
import * as request from 'request';

export class RemoteAPIService {

    // The queue used to process the https requests
    protected static queue: Queue;
    // The number of workers used to process the queue
    protected static workers: number;

    /**
     * Init the queue
     */
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

    /**
     * Send a GET request to a given URL
     */
    public static get(options: any, done: DoneCallback): void {

        request(
            {
                followAllRedirects: true,
                url: options.path,
                baseUrl: `https://${options.host}`,
                headers: options.headers,
            },
            (error, response, body) => {

                if (response && response.statusCode === 200) {
                    done(error, JSON.parse(body));
                } else if (!error) {
                    done(new Error(`${response.statusCode}`));
                } else {
                    done(new Error('500'));
                }
            });

    }

    /**
     * A help method to enclose a job call in a promise
     */
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

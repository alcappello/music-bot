import * as http from 'http';
import { createQueue, DoneCallback, Job, ProcessCallback, Queue, Worker } from 'kue';


export class RemoteAPIService {

    // The queue used to process the http requests
    protected static queue: Queue;

    protected static init() {

        // Create a Queue, or get the singleton reference if it already exists
        RemoteAPIService.queue = createQueue({
            prefix: 'q',
            redis: {
                port: process.env.REDIS_PORT,
                host: 'redis',
            },
        });
    }

    public static get(options: object, done: DoneCallback) {

        http.get(options, (res) => {

            const {statusCode} = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (typeof contentType === 'string' && !/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
            }
            if (error) {
                // consume response data to free up memory
                res.resume();
                done(error);
            }

            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    done(undefined, parsedData);
                } catch (e) {
                    done(e.message);
                }
            });
        }).on('error', (e) => {
            done(new Error(`Got error: ${e.message}`));
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

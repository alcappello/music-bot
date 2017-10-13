import { RemoteAPIService } from './RemoteAPIService';

export class CoverArtService extends RemoteAPIService {

    private static jobName = 'CoverArt';

    public static init() {
        super.init();
        this.workers = +process.env.COVERART_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
        });
    }

    public static async getImage(mbid: string): Promise<any> {

        const data = {
            options: {
                host: 'coverartarchive.org',
                path: `/release-group/${mbid}`,
                headers: {
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                },
            },
        };

        return this.getWithPromise(this.jobName, data);
    }
}

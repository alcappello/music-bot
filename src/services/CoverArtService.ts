import { RemoteAPIService } from './RemoteAPIService';

/**
 * CoverArtArchive retrieval service
 */
export class CoverArtService extends RemoteAPIService {

    private static jobName = 'CoverArt';

    /**
     * Init the queue with the number of workers and a specific job
     */
    public static init(): void {
        super.init();
        this.workers = +process.env.COVERART_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
        });
    }

    /**
     * Retrieve an image from CoverArtArchive, based on the mbid of the album
     */
    public static async getImage(mbid: string): Promise<any> {

        const data = {
            options: {
                host: 'coverartarchive.org',
                path: `/release-group/${mbid}`,
                headers: {
                    accept: 'application/json',
                },
            },
        };

        return this.getWithPromise(this.jobName, data);
    }
}

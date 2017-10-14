import { RemoteAPIService } from './RemoteAPIService';

/**
 * MusicBrainz retrieval service
 */
export class MusicBrainzService extends RemoteAPIService {

    private static jobName = 'MusicBrainz';

    /**
     * Init the queue with the number of workers and a specific job
     */
    public static init() {
        super.init();
        this.workers = +process.env.MUSICBRAINZ_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
        });
    }

    /**
     * Get a specific artist from MusicBrainz, based on its MBID
     */
    public static async getArtist(mbid: string): Promise<any> {

        const data = {
            options: {
                host: 'musicbrainz.org',
                path: `/ws/2/artist/${mbid}?&fmt=json&inc=url-rels+release-groups`,
                headers: {'user-agent': 'music-api'},
            },
        };

        return this.getWithPromise(this.jobName, data);
    }
}

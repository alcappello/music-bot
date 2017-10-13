import { RemoteAPIService } from './RemoteAPIService';

export class MusicBrainzService extends RemoteAPIService {

    private static jobName = 'MusicBrainz';

    public static init() {
        super.init();
        this.workers = +process.env.MUSICBRAINZ_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
        });
    }

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

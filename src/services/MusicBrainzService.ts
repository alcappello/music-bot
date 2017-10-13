import { RemoteAPIService } from './RemoteAPIService';

export class MusicBrainzService extends RemoteAPIService {

    static requestLimit = process.env.MUSICBRAINZ_REQUEST_LIMIT;

    private static jobName = 'MusicBrainz';

    public static init() {
        super.init();

        // Register the queue's processing behaviour
        MusicBrainzService.queue.process(MusicBrainzService.jobName, (job, done) => {
            // Fire a request
            MusicBrainzService.get(job.data.options, done);
            // TODO: wait before the next request
        });
    }

    public static async getArtist(mbid: string): Promise<any> {

        const data = {
            options: {
                host: 'musicbrainz.org',
                path: `/ws/2/artist/${mbid}?&fmt=json&inc=url-rels+release-groups`,
                headers: {'user-agent': 'music-api'},
            },
            waitFor: MusicBrainzService.requestLimit,
        };

        return MusicBrainzService.getWithPromise(MusicBrainzService.jobName, data);
    }
}

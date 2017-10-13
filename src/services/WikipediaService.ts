import { RemoteAPIService } from './RemoteAPIService';

export class WikipediaService extends RemoteAPIService {

    static requestLimit = process.env.WIKIPEDIA_REQUEST_LIMIT;

    private static jobName = 'Wikipedia';

    public static init() {
        super.init();

        // Register the queue's processing behaviour
        WikipediaService.queue.process(WikipediaService.jobName, (job, done) => {
            // Fire a request
            WikipediaService.get(job.data, done);
            // TODO: wait before the next request
        });
    }

    public static async getArtist(mbid: string): Promise<any> {

        const data = {
            options: {
                host: 'en.wikipedia.org',
                path: `/ws/2/artist/${mbid}?&fmt=json&inc=url-rels+release-groups`,
                headers: {'user-agent': 'music-api (alessandro@cappello.se)'},
            },
            waitFor: WikipediaService.requestLimit,
        };

        return WikipediaService.getWithPromise(WikipediaService.jobName, data);
    }
}

import { RemoteAPIService } from './RemoteAPIService';

export class WikipediaService extends RemoteAPIService {

    private static requestLimit = process.env.WIKIPEDIA_REQUEST_LIMIT;

    private static jobName = 'Wikipedia';

    public static init() {
        super.init();

        // Register the queue's processing behaviour
        WikipediaService.queue.process(WikipediaService.jobName, (job, done) => {
            // Fire a request
            WikipediaService.get(job.data.options, done);
        });
    }

    public static async getArtist(name: string): Promise<any> {

        const data = {
            options: {
                host: 'en.wikipedia.org',
                path: `/w/api.php?action=query&format=json&prop=extracts&exintro=true&redirects=true&titles=${name}`,
                headers: {'user-agent': 'music-api (alessandro@cappello.se)'},
            },
        };

        return WikipediaService.getWithPromise(WikipediaService.jobName, data);
    }
}

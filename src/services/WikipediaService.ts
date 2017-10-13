import { RemoteAPIService } from './RemoteAPIService';

export class WikipediaService extends RemoteAPIService {

    private static jobName = 'Wikipedia';

    public static init() {
        super.init();
        this.workers = +process.env.WIKIPEDIA_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
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

        return this.getWithPromise(this.jobName, data);
    }
}

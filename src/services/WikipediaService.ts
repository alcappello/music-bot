import { RemoteAPIService } from './RemoteAPIService';

/**
 * Wikipedia retrieval service
 */
export class WikipediaService extends RemoteAPIService {

    private static jobName = 'Wikipedia';

    /**
     * Init the queue with the number of workers and a specific job
     */
    public static init() {
        super.init();
        this.workers = +process.env.WIKIPEDIA_WORKERS;

        // Register the queue's processing behaviour
        this.queue.process(this.jobName, this.workers, (job, done) => {
            // Fire a request
            this.get(job.data.options, done);
        });
    }

    /**
     * Get a glimpse of the artist's Wikipedia page
     */
    public static async getArtist(name: string): Promise<any> {

        const data = {
            options: {
                host: 'en.wikipedia.org',
                path: `/w/api.php?action=query&format=json&prop=extracts&exintro=true&redirects=true&titles=${name}`,
                headers: {'user-agent': 'music-api (https://github.com/alcappello/music-api; alessandro@cappello.se)'},
            },
        };

        return this.getWithPromise(this.jobName, data);
    }
}

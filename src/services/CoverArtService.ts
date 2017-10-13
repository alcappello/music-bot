import { RemoteAPIService } from './RemoteAPIService';

export class CoverArtService extends RemoteAPIService {

    private static requestLimit = process.env.COVERART_REQUEST_LIMIT;

    private static jobName = 'CoverArt';

    public static init() {
        super.init();

        // Register the queue's processing behaviour
        CoverArtService.queue.process(CoverArtService.jobName, 100, (job, done) => {
            // Fire a request
            CoverArtService.get(job.data.options, done);
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

        return CoverArtService.getWithPromise(CoverArtService.jobName, data);
    }
}

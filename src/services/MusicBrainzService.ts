import { RemoteAPIService } from './RemoteAPIService';

export class MusicBrainzService extends RemoteAPIService {

    public static async getArtist(mbid: string): Promise<any> {

        const options = {
            host: 'musicbrainz.org',
            path: `/ws/2/artist/${mbid}?&fmt=json&inc=url-rels+release-groups`,
            headers: {'user-agent': 'music-api'},
        };

        return new Promise((resolve, reject) => {

            MusicBrainzService.get(options, (error, result) => {

                if (error !== undefined) {
                    reject(error);
                } else {
                    resolve(result);
                }
            });
        });
    }
}

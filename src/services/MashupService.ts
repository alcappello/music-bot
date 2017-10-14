import * as Q from 'q';

import { CoverArtService } from './CoverArtService';
import { MusicBrainzService } from './MusicBrainzService';
import { WikipediaService } from './WikipediaService';

/**
 * Mash up service that combines the output from different API calls
 */
export class MashupService {

    /**
     * Fetch the required info and return an object with all the data from the APIs
     */
    public static async fetchArtistData(mbid: string): Promise<any> {

        return new Promise(async (resolve, reject) => {

            let artist: any;
            let promises: Array<Promise<any>>;

            // MusicBrainz;
            try {
                artist = await MusicBrainzService.getArtist (mbid);
            } catch (e) {
                reject({code: e, description: 'Error within the MusicBrainz API call.'});
            }

            // Wikipedia
            try {
                const wikiRecord = artist.relations.find((x: any) => x.type === 'wikipedia');
                const wikiName = wikiRecord.url.resource.replace('https://en.wikipedia.org/wiki/', '');
                artist.biography = await WikipediaService.getArtist(wikiName);
            } catch (e) {
                reject({code: e, description: 'Error within the Wikipedia API call.'});
            }

            // CoverArtArchive
            try {
                promises = artist['release-groups'].map(async (album: any) => {
                    const promise = CoverArtService.getImage(album.id);

                    // sometimes CoverArtArchive doesn't have a cover for a specific album and replies with a 404,
                    // causing the promise to be rejected. In this case, the image is set to be empty.
                    try {
                        album.image = await promise;
                    } catch (e) {
                        album.image = '';
                    }

                    return promise;
                });
            } catch (e) {
                reject({code: e, description: 'Error within the CoverArtArchive API call.'});
            }

            // When all the images have been retrieved, resolve the promise and return the data.
            // Q.allSettled is fired when all the promises are either fulfilled or rejected.
            Q.allSettled(promises).then(() => {
                resolve(artist);
            });
        });
    }

    /**
     * Creates a well-formed JSON object from the raw data of fetchArtistData()
     */
    public static aggregate(artist: any): any {

        const wikiPages = artist.biography.query.pages;
        const biography = wikiPages[Object.keys(wikiPages)[0]].extract;
        const data = {
            mbid: artist.id,
            description: biography,
            albums: [] as any[],
        };

        artist['release-groups'].forEach((album: any) => {
            let image = '';
            if (album.image !== '' && album.image.images.length > 0) {
                image = album.image.images[0].image;
            }

            data.albums.push({
                id: album.id,
                title: album.title,
                image,
            });
        });

        return data;
    }
}

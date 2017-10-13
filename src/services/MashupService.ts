import * as Q from 'q';

import { CoverArtService } from './CoverArtService';
import { MusicBrainzService } from './MusicBrainzService';
import { WikipediaService } from './WikipediaService';

export class MashupService {

    public static async fetchArtistData(mbid: string): Promise<any> {

        return new Promise(async (resolve, reject) => {

            // MusicBrainz;
            const artist = await MusicBrainzService.getArtist (mbid);

            // Wikipedia
            const wikiRecord = artist.relations.find((x: any) => x.type === 'wikipedia');
            const wikiName = wikiRecord.url.resource.replace('https://en.wikipedia.org/wiki/', '');
            artist.biography = await WikipediaService.getArtist(wikiName);

            // CoverArtArchive
            const promises = artist['release-groups'].map(async (album: any) => {
                const promise =  CoverArtService.getImage(album.id);

                try {
                    album.image = await promise;
                } catch (e) {
                    album.image = '';
                }

                return promise;
            });

            Q.allSettled(promises).then(() => {
                resolve(artist);
            });
        });
    }

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

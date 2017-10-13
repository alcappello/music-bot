import { NextFunction, Request, Response, Router } from 'express';
import * as Q from 'q';

import { Cache } from '../services/Cache';
import { CoverArtService } from '../services/CoverArtService';
import { MusicBrainzService } from '../services/MusicBrainzService';
import { WikipediaService } from '../services/WikipediaService';

/**
 * / route
 *
 * @class User
 */
export class APIRoute {

    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */
    public static create(router: Router) {
        // Get artist by MBID
        router.get(
            '/api/artist/:id',
            Cache.checkCache(+process.env.CACHED_SECONDS),
            (req: Request, res: Response, next: NextFunction) => {
                APIRoute.getArtist(req, res, next).then();
            },
        );
    }

    /**
     * Retrieve info about an artist
     *
     * @class APIRoute
     * @method getArtist
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @param next {NextFunction} Execute the next method.
     */
    public static async getArtist(req: Request, res: Response, next: NextFunction) {
        try {
            const artist = await MusicBrainzService.getArtist(req.params.id);
            const wikiRecord = artist.relations.find((x: any) => x.type === 'wikipedia');
            const wikiName = wikiRecord.url.resource.replace('https://en.wikipedia.org/wiki/', '');
            artist.biography = await WikipediaService.getArtist(wikiName);
            const promises: Array<Promise<{}>> = [];

            for (const album of artist['release-groups']) {

                const promise = new Promise(async (resolve, reject) => {
                    try {
                        album.image = await CoverArtService.getImage(album.id);
                        resolve(album.image);
                    } catch (e) {
                        album.image = '';
                        reject(e);
                    }
                });

                promises.push(promise);
            }

            // const promises = artist['release-groups'].map((album: any) => {
            //     return CoverArtService.getImage(album.id);
            // });

            Q.allSettled(promises).then((results) => {
                const content = results.map((user: any) => {
                    return user.body;
                });
                console.log(results);
                res.send(artist);
            });

        } catch (e) {
            res.send('ERROR!: ' + e);
        }
    }
}

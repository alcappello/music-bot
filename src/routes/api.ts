import { NextFunction, Request, Response, Router } from 'express';

import { Cache } from '../services/Cache';
import { MashupService } from '../services/MashupService';

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
                APIRoute.getArtist(req, res, next);
            },
        );
    }

    /**
     * Retrieve some info about a given artist
     *
     * @class APIRoute
     * @method getArtist
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @param next {NextFunction} Execute the next method.
     */
    public static async getArtist(req: Request, res: Response, next: NextFunction) {
        try {
            MashupService.fetchArtistData(req.params.id)
                .then((artist) => {
                    res.send(MashupService.aggregate(artist));
                });

        } catch (e) {
            res.send('ERROR!: ' + e);
        }
    }
}

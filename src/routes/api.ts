import { Request, Response, Router } from 'express';

import { Cache } from '../services/Cache';
import { MashupService } from '../services/MashupService';

/**
 * APIRoute handles the api requests
 */
export class APIRoute {

    /**
     * Create the routes.
     */
    public static create(router: Router) {
        // Get artist by MBID
        router.get(
            '/api/artist/:id',
            // Cache.checkCache(+process.env.CACHED_SECONDS),
            (req: Request, res: Response) => {
                APIRoute.getArtist(req, res).then(/* do nothing */);
            },
        );
    }

    /**
     * Retrieve some info about a given artist
     */
    public static async getArtist(req: Request, res: Response) {

        MashupService.fetchArtistData(req.params.id)
            .then((artist) => {
                res.send(MashupService.aggregate(artist));
            })
            .catch((e) => {
                res.status(e.code || 500);
                res.send(e);
            });
    }
}

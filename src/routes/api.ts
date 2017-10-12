import {NextFunction, Request, Response, Router} from 'express';
import {MusicBrainzService} from '../services/MusicBrainzService';

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
        router.get('/api/artist/:id', (req: Request, res: Response, next: NextFunction) => {
            APIRoute.getArtist(req, res, next);
        });
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
    public static getArtist(req: Request, res: Response, next: NextFunction) {

        let artist = MusicBrainzService.getArtist('5b11f4ce-a62d-471e-81fc-a69a8278c7da');
        artist.then(data => {
            res.send(data);
        });
    }
}

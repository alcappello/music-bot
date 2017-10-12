import {NextFunction, Request, Response, Router} from 'express';

/**
 * Homepage Route
 *
 * @class User
 */
export class IndexRoute {

    /**
     * Create the routes.
     *
     * @class IndexRoute
     * @method create
     * @static
     */
    public static create(router: Router) {
        // add home page route
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            IndexRoute.index(req, res, next);
        });
    }

    /**
     * The home page route.
     *
     * @class IndexRoute
     * @method index
     * @param req {Request} The express Request object.
     * @param res {Response} The express Response object.
     * @param next {NextFunction} Execute the next method.
     */
    public static index(req: Request, res: Response, next: NextFunction) {

        res.send('Hello World!');
    }
}

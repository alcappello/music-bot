import { NextFunction, Request, Response, Router } from 'express';

/**
 * Homepage Route
 */
export class IndexRoute {

    /**
     * Create the routes.
     */
    public static create(router: Router) {
        router.get('/', (req: Request, res: Response, next: NextFunction) => {
            IndexRoute.index(req, res, next);
        });
    }

    /**
     * The home page route.
     */
    public static index(req: Request, res: Response, next: NextFunction) {

        res.send('Hello World!');
    }
}

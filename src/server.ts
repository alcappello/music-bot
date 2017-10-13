import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import * as express from 'express';
import * as logger from 'morgan';

// Routes
import { IndexRoute } from './routes';
import { APIRoute } from './routes/api';
import {RemoteAPIService} from './services/RemoteAPIService';
import {MusicBrainzService} from './services/MusicBrainzService';

/**
 * The server.
 *
 * @class Server
 */
export class Server {

    public app: express.Application;

    /**
     * Bootstrap the application.
     *
     * @class Server
     * @method bootstrap
     * @static
     * @return {Server} Returns the newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
     *
     * @class Server
     * @constructor
     */
    constructor() {
        // create Express.js application
        this.app = express();

        // configure application
        this.config();

        // add api
        this.api();

        // add routes
        this.routes();
    }

    /**
     * Create REST API routes
     *
     * @class Server
     * @method api
     */
    public api() {
        // Init the API queue
        MusicBrainzService.init();

        const router = express.Router();

        // API routes
        APIRoute.create(router);

        // use router middleware
        this.app.use(router);
    }

    /**
     * Configure application
     *
     * @class Server
     * @method config
     */
    public config() {
        // mount logger
        this.app.use(logger('dev'));

        // mount json form parser
        this.app.use(bodyParser.json());

        // mount query string parser
        this.app.use(bodyParser.urlencoded({extended: false}));

        // catch 404 and forward to error handler
        this.app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            err.status = 404;
            next(err);
        });

        // error handling
        this.app.use(errorHandler());
    }

    /**
     * Create and return Router.
     *
     * @class Server
     * @method config
     * @return void
     */
    private routes() {
        const router = express.Router();

        // IndexRoute
        IndexRoute.create(router);

        // use router middleware
        this.app.use(router);
    }

}

import * as bodyParser from 'body-parser';
import * as errorHandler from 'errorhandler';
import { EventEmitter } from 'events';
import * as express from 'express';
import * as logger from 'morgan';

// Routes
import { IndexRoute } from './routes';
import { APIRoute } from './routes/api';

// Services
import { CoverArtService } from './services/CoverArtService';
import { MusicBrainzService } from './services/MusicBrainzService';
import { WikipediaService } from './services/WikipediaService';

// Max emitters raised because of kue.Queue
EventEmitter.defaultMaxListeners = 200;

/**
 * The server.
 */
export class Server {

    public app: express.Application;

    /**
     * Bootstrap the application. Returns a newly created injector for this app.
     */
    public static bootstrap(): Server {
        return new Server();
    }

    /**
     * Constructor.
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
     * Create the API router and returns it
     */
    public api() {
        // Init the API queue and the requests
        MusicBrainzService.init();
        WikipediaService.init();
        CoverArtService.init();

        const router = express.Router();

        // API routes
        APIRoute.create(router);

        // use router middleware
        this.app.use(router);
    }

    /**
     * Configure application
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
     */
    private routes() {
        const router = express.Router();

        // IndexRoute
        IndexRoute.create(router);

        // use router middleware
        this.app.use(router);
    }

}

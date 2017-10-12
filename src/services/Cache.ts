import * as memcache from 'memory-cache';
import {Request, RequestHandler, Response, NextFunction, Send} from 'express';

interface CachedResponse extends Response {
    sendResponse: Send
}

export class Cache {

    private static memory = memcache;

    public static checkCache (duration: number): RequestHandler {

        return (req: Request, res: CachedResponse, next: NextFunction) => {
            let key = '__express__' + req.originalUrl || req.url;
            let cachedBody = Cache.memory.get(key);

            if (cachedBody) {
                res.send(cachedBody);
                return;

            } else {
                res.sendResponse = res.send;
                res.send = (body: any): Response => {
                    Cache.memory.put(key, body, duration * 1000);
                    return res.sendResponse(body);
                };
                next();
            }
        }
    }
}
import { NextFunction, Request, RequestHandler, Response, Send } from 'express';
import * as memcache from 'memory-cache';

interface ICachedResponse extends Response {
    sendResponse: Send;
}

/**
 * A simple in-memory cache to handle multiple requests to the same endpoint
 */
export class Cache {

    private static memory = memcache;

    public static checkCache(duration: number): RequestHandler {

        return (req: Request, res: ICachedResponse, next: NextFunction) => {
            // Build a key from the request address
            const key = '__express__' + req.originalUrl || req.url;
            const cachedBody = Cache.memory.get(key);

            // If the request is in cache, shoot it
            if (cachedBody) {
                res.status(200);
                res.send(cachedBody);
                return;
            // Otherwise generate it and store it in cache
            } else {
                res.sendResponse = res.send;
                res.send = (body: any): Response => {
                    Cache.memory.put(key, body, duration * 1000);
                    return res.sendResponse(body);
                };
                next();
            }
        };
    }
}

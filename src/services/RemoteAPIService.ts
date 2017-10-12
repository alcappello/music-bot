import * as http from 'http';

export class RemoteAPIService {

    public static get(options: object, done: (error?: Error, result?: any) => void) {

        http.get(options, (res) => {

            const {statusCode} = res;
            const contentType = res.headers['content-type'];

            let error;
            if (statusCode !== 200) {
                error = new Error('Request Failed.\n' +
                    `Status Code: ${statusCode}`);
            } else if (typeof contentType === 'string' && !/^application\/json/.test(contentType)) {
                error = new Error('Invalid content-type.\n' +
                    `Expected application/json but received ${contentType}`);
            }
            if (error) {
                // consume response data to free up memory
                res.resume();
                done(error);
            }

            let rawData = '';
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    done(undefined, parsedData);
                } catch (e) {
                    done(e.message);
                }
            });
        }).on('error', (e) => {
            done(new Error(`Got error: ${e.message}`));
        });
    }
}
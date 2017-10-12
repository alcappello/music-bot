import * as http from 'http';

export class MusicBrainzService {

    static getArtist (mbid: string) {

        return new Promise((resolve, reject) => {

            const options = {
                host: 'musicbrainz.org',
                path: `/ws/2/artist/${mbid}?&fmt=json&inc=url-rels+release-groups`,
                headers: { 'user-agent': 'music-api' }
            };

            http.get(options, (res) => {

                const { statusCode } = res;
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
                    console.error(error.message);
                    // consume response data to free up memory
                    res.resume();
                    return;
                }

                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        const parsedData = JSON.parse(rawData);
                        resolve(parsedData);
                    } catch (e) {
                        reject(e.message);
                    }
                });
            }).on('error', (e) => {
                reject(`Got error: ${e.message}`);
            });



        });

    }
}
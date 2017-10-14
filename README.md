# Music-api
This is a humble exercise in Node.js and TypeScript, where the main goal is to merge three different APIs into one and make an application that is fault tolerant and resilient to high traffic.  
The three external APIs are MusicBrainz, Wikipedia and CoverArtArchive. 

## How to install
- Clone this repository.
- Create a .env file on the project directory based on the .env-example template
- Run `docker-compose up -d` in order to build and run the Docker containers for this application.  

Note that .env contains, among other options, the exposed ports for the containers.  
When the containers are up & running, it would be possible to reach music-api at the address `http://localhost/api/artist/:mbid`.

## Data format
Music-api accepts a request at `/api/artist/:mbid` and returns a JSON object in the form:  

    {
        "mbid" : "5b11f4ce­a62d­471e­81fc­a69a8278c7da",
        "description"   : "<p><b>Nirvana</b> was an American rock band that was formed...etc...",
        "albums" : [
            {
                "title" : "Nevermind" ,
                "id" :  "1b022e01­4da6­387b­8658­8678046e4cef" ,
                "image" : "http://coverartarchive.org/release/a146429a­cedc­3ab0­9e41­1aaf5f6cdc2d/3012495605.jpg"
            }, 
            { ...more albums... }
        ]
    }
    

## Concurrency
Music-api is built to handle multiple concurrent requests and it implements two different solutions to mitigate possible high traffic issues.  
First of all, it has a simple in-memory cache that stores all the responses in a 10 minutes time-span and returns them without querying the external APIs again.  
Then, if a request is not already cached, it's inserted into a queue that is consumed in limited numbers: this prevents music-api to flood the external services in case of many concurrent and unique requests.

## Known issues and possible improvements

### Kue
[Kue](https://github.com/Automattic/kue) is the job queue library used by music-api. While it allows to [pause a worker](https://github.com/Automattic/kue#pause-processing) before the next job, its DefinitelyTyped definition does not.

It means that it's not possible to force music-api to wait 1 second between different unique requests to MusicBrainz, and this in turn means that when the number of unique requests per second is too high it might happen to exceed the MusicBrainz limit of requests per minute, leading the music-api to a temporary ban. All the requests during the ban are refused by music-api with a 503 status (temporary unavailable).  

Besides contributing to _@types/kue_, another solution could be to define a custom typing that extends _@types/kue_ with the pause feature, while writing a job queue service from scratches seems too much.

### Memory Cache
Caching on memory is quick and easy for a small API, but in a wider perspective with more endpoints and even a frontend it may be risky to clutch the memory with too much data. Storing the cache on disk would then be a better approach.
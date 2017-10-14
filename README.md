# Music-api
This is a humble exercise in Node.js and TypeScript, where the main goal is to merge three different APIs into one and make an application that is fault tolerant and resilient to high traffic.  
The three external APIs are MusicBrainz, Wikipedia and CoverArtArchive. 

## How to install
Simply clone this repository, create a .env file on the root directory based on the .env-example template and then run `docker-compose up -d` in order to build and run the Docker containers for this application. Note that .env contains, among other options, the exposed ports for the containers.  
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
    

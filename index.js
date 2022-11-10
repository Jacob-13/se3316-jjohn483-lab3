const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const Conf = require('conf');
const config = new Conf();

const { PassThrough } = require('stream');
const { type } = require('os');
const e = require('express');
const router = express.Router();

const port = 3000;

// Selects properties for mapping

function selectProperties(...properties) {
    return function(obj) {
        newObj = {};
        properties.forEach(prop => {
            newObj[prop] = obj[prop];
        });
        return newObj;
    }
}

// --------   Parsing   --------//

let genreData = [];
// Parse genre data
fs.createReadStream('lab3-data/genres.csv')
    .pipe(csv())
    .on('data', (data) => {
        genreData.push(data);
    }).on('end', () => {
        console.log('genreData success');
    });

let artistData = [];
// Parse artist data
fs.createReadStream('lab3-data/raw_artists.csv')
    .pipe(csv())
    .on('data', (data) => {
        artistData.push(data);
    }).on('end', () => {
        console.log('artistData success');
    });


let trackData = [];
// Parse track data
fs.createReadStream('lab3-data/raw_tracks.csv')
    .pipe(csv())
    .on('data', (data) => {
        trackData.push(data);
    })
    .on('end', () => {
        console.log('trackData success');
        map();
    })

// Filter the data properties
function map() {

    genreData = genreData.map(selectProperties('genre_id', 'parent', 'title'));
    console.log('genreData mapped');

    artistData = artistData.map(selectProperties('artist_id', 'artist_name', 'artist_members', 'artist_active_year_begin', 'artist_active_year_end', 'artist_contact', 'artist_donation_url', 'artist_favorites'));
    console.log('artistData mapped');

    trackData = trackData.map(selectProperties('track_id', 'album_id', 'album_title', 'artist_id', 'artist_name', 'tags', 'track_date_created', 'track_date_recorded', 'track_duration', 'track_genres', 'track_number', 'track_title'));
    console.log('trackData mapped');
}

// Setup serving front-end code
app.use('/', express.static('static'));

// Setup middleware to do logging
app.use((req, res, next) => {
    console.log(`${req.method} request for ${req.url}`);
    next();
});

// Parse data in body as JSON
router.use(express.json());
app.use(express.json());


// Backend functionality 1
app.get('/api/genres', (req, res) => {
    res.send(genreData);
});

// Backend functionality 2
app.get('/api/artist/:id', (req, res) => {
    
    let artistId = req.params.id;

    const artist = artistData.find(art => art.artist_id === artistId);
    
    if(artist){
        console.log(artist);
        res.send(artist);
    }
    else {
        res.status(404).send(`Artist id ${artistId} not found!`);
    }
});

// Backend functionality 3
app.get('/api/track/:id', (req, res) => {
    let trackId = req.params.id;
    let tempArr = trackId.split('%'); // when being sent spaces are changed to '%'. This changes back to spaces for proper searching
    trackId = tempArr.join(' ');

    const trackResult = trackData.find(track => track.track_id == trackId);
    
    if(trackResult){
        res.send(trackResult);
    } else {
        res.status(404).send(`Track ID ${trackId} not found!`)
    }
});

// Backend functionality 4
app.get('/api/tracks/:match', (req, res) => {
    
    let trackIds = [];

    const searchValue = req.params.match.toLowerCase();
    
    // looks for matches in both the track title and the ablum title with the corresponding search value
    const tracks = trackData.filter(t => t.track_title.toLowerCase().includes(searchValue) || t.album_title.toLowerCase().includes(searchValue));
    const trackIdProperties = tracks.map(selectProperties('track_id'));

    trackIdProperties.forEach(track => {
        trackIds.push(parseInt(track.track_id));
    })
    
    // limits tracks being sent to the front end to 10
    if(trackIds.length > 10){
        trackIds.length = 10;
        res.send(trackIds);
    }
    else if(trackIds.length < 1) {
        res.status(404).send('No tracks found!');
    }
    else{ // sends all track results if there is less than 10
        res.send(trackIds);
    }
});

// Backend functionality 5: matching artists name to the search, responding with list of artist ids
app.get('/api/artists/:match', (req, res) => {

    const artistSearch = req.params.match.toLowerCase();

    let artistIds = [];

    const artists = artistData.filter(artist => artist.artist_name.toLowerCase().includes(artistSearch));
    const artistProperties = artists.map(selectProperties('artist_id'));

    artistProperties.forEach(artist => {
        artistIds.push(artist.artist_id);
    });

        if(artistIds.length > 0) {
            res.send(artistIds);
        }
        else {
            res.status(404).send(`No artist matches were found!`);
        }
});

// Backend functionality 6

app.put('/api/lists/:name', (req, res) => {

    const listName = req.params.name;
    
    let tracks = req.body.track;
    console.log(tracks);


    if(config.has(listName)) {
        res.status(400).send(`${listName} already exists!`);
    }
    else {
        config.set(listName, tracks);
        res.send(config.get(listName));
    }
});

// Backend functionality 7: Updating tracks for a given list name
app.post('/api/lists/:name', (req, res) => {

    const listName = req.params.name;
    
    let tracks = req.body.track; 
    console.log(tracks);

    if(config.has(listName)){
        config.set(listName, tracks); 
        res.send(config.get(listName));
    }
    else { // if the playlist the user is updating doesnt exist, send 404 error.
        res.status(404).send(`Playlist ${listName} not found!`);
    }
});

// Backend functionality 8: Getting the track ids for a given list name
app.get('/api/lists/:name', (req, res) => {

    const listName = req.params.name;

    if(config.has(listName)){
        res.send(config.get(listName));
    }
    else {
        res.status(404).send(`Playlist ${listName} not found!`);
    }
});

// Backend functionality 9: Deleting a list
app.delete('/api/lists/:name', (req, res) => {
    
    const listName = req.params.name;

    if(config.has(listName)){
        config.delete(listName);
        res.send(`${listName} was deleted!`);
    }
    else {
        res.status(404).send(`Playlist ${listName} not found!`)
    }
});


// Backend functionality 10: 
app.get('/api/lists', (req, res) => {

    let allLists = [];

    // Retrieves the data from the config db
    var listData = fs.readFileSync(config.path, 'utf8'); //objects with key as name and tracks as value
    let list = JSON.parse(listData);

    // Obtains the names of all the lists
    let listNames = [];
    for(var key in list){
        listNames.push(key);
    };

    // The following nested operation creates an array of objects with properties for list name, num of tracks, and duration
    if(listNames.length != 0)
    {
        // For each playlist
        for(i = 0; i < listNames.length; i++)
        {
            let trackList = config.get(listNames[i]); // Retrieves the track list from a playlist
            let duration = 0;

            if(trackList.length != 0)
            {
                // For each track in a playlist
                for(j = 0; j < trackList.length; j++)
                {
                    for(k = 0; k < trackData.length; k++)
                    {
                        if(trackData[k].track_id == trackList[j])
                        {
                            trackDuration = trackData[k].track_duration;
                            duration += trackDuration;
                        };
                    };
                };
            };
            // New play list object is added to the array of all lists
            let newPlaylist = {
                name: listNames[i],
                num_of_tracks: trackList.length,
                length: duration
            };
            allLists.push(newPlaylist);
        };
        res.send(allLists);
    }
    else {
        res.status(400).send('No lists exist yet!');
    }
});

// Install the router at /api/lists
app.use('/api/test', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});

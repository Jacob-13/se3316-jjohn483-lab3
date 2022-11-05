const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const Conf = require('conf');
const config = new Conf();

const { PassThrough } = require('stream');
const { type } = require('os');
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
    next(); // Keep going
});

// Parse data in body as JSON
router.use(express.json());
app.use(express.json());


// Backend functionality 1
app.get('/api/genres', (req, res) => {
    res.send(genreData);
});

// Backend functionality 2
app.get('/api/artists', (req, res) => {
    res.send(artistData);
});

// Backend functionality 3
app.get('/api/tracks', (req, res) => {
    res.send(trackData);
});

// Backend functionality 4: Only thing is to choose how many matches to send back now
app.get('/api/tracks/:match', (req, res) => {
    const track = trackData.filter(t => t.track_title == req.params.match || t.album_title == req.params.match);
    track.length = 5;
        if(track) {
            res.send(track);
        }
        else {
            res.status(404).send(`Track ${req.params.match} was not found!`);
        }
});

// Backend functionality 5
app.get('/api/artists/:match', (req, res) => {
    const artist = artistData.filter(artist => artist.artist_name == req.params.match);
        if(artist) {
            res.send(artist);
        }
        else {
            res.status(404).send(`Artist ${req.params.match} was not found!`);
        }
});

// Backend functionality 6

/*
let playlists = [
    {
        name: 'Funk',
        tracks: [
            {
                id: 1
            },
            {
                id: 2
            }],
        totalTracks: 5,
        duration: 5 //could create a function that is called by the property
    },
    {
        name: 'Vibes',
        tracks: [
            {
                id: 1
            },
            {
                id: 2
            }],
        totalTracks: 5,
        duration: 5
    }
];*/
app.put('/api/lists/:name', (req, res) => {
//-----------------------------------------------------------------------------------------    
    /*const newList = req.body;
    console.log("List: ", newList);
    
    // id of new list will be the parameter in the url
    //newList.name = req.body.name;

    const listIndex = playlists.findIndex(l => l.name === newList.name);

    if(listIndex < 0) {
        console.log('Creating new list ... ');
        playlists.push(newList);
        res.send(newList);
    } 
    else {
        console.log('List already exists')
        res.status(400).send(`List ${newList.name} already exists!`);
    }*/
//-----------------------------------------------------------------------------------------

    const listName = req.params.name;
    
    if(config.has(listName)) {
        res.status(400).send(`${listName} already exists!`);
    }
    else {
        config.set(listName, []);
        res.send(config.get(listName));
        console.log('list in res');
    }

});


// Backend functionality 7
app.post('api/lists/:id', (req, res) => {

});

// Backend functionality 8
app.get('/api/lists/:name', (req, res) => {
    let listName = req.params.name;

    let listIndex = playlists.findIndex(l => l.name == listName);

    if(listIndex < 0) {
        res.status(404).send(`The list ${listName} was not found`);
    } 
    else {
        let track_ids = playlists[listIndex].tracks;
        res.send(track_ids);
    }

});

// Backend functionality 9
app.delete('/api/lists/:name', (req, res) => {
    let listName = req.params.name;

    let listIndex = playlists.findIndex(p => p.name == listName);

    console.log('here');
    
    if(listIndex < 0) {
        res.status(404).send(`List ${listName} was not found!`);
    }
    else {
        playlists.splice(listIndex, listIndex + 1);
        res.send(`List ${listName} deleted`);
    }
});


// Backend functionality 10
app.get('/api/lists', (req, res) => {

    var listData = fs.readFileSync(config.path, 'utf8'); //objects with key as name and tracks as value

    let list = JSON.parse(listData);
    console.log(list[1]);

    res.send(list);
});

// Install the router at /api/parts
app.use('/api/test', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
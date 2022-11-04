const express = require('express');
const app = express();
const fs = require('fs');
const csv = require('csv-parser');
const { PassThrough } = require('stream');
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


//-----------------------------------------------------------------------------------------------------------------
// Routes for /api/parts
router.route('/') // All the routes to the base prefix
    // get a list of parts
    .get((req, res) => {
        res.send(artistData);
    })
    
    // Create a part
    .post((req, res) => {
        const newpart = req.body;
        newpart.id = 100 + parts.length;
        if(newpart.name) {
            parts.push(newpart);
            res.send(newpart)
        }
        else {
            res.status(400).send('Missing name');
        }
    })

router.route('/:id') // All routes with a part ID
    // Get details for a given part
    .get((req, res) => {
        const part = parts.find(p => p.id === parseInt(req.params.id));
        if(part) {
            res.send(part);
        }
        else {
            res.status(404).send(`Part ${req.params.id} was not found!`);
        }
    })
    
    // Create/replace part data for a given ID
    .put((req, res) => {
        const newpart = req.body;
        console.log("Part: ", newpart);
        // Add ID field
        newpart.id = parseInt(req.params.id);
    
        // Replace the part with the new one
        const part = parts.findIndex(p => p.id === parseInt(newpart.id));
        if (part < 0) { // not found
            console.log('Creating new part');
            parts.push(newpart);
        } 
        else {
            console.log('Modifying part ', req.params,id);
            parts[part] = newpart;
        }
    
        res.send(newpart);
    })

    // Update stock level
    .post((req, res) => {
        router.post('/:id', (req, res) => {
            const newpart = req.body;
            console.log("Part: ", newpart);
        
            // Find the part
            const part = parts.findIndex(p => p.id === parseInt(req.params.id));
        
            if(part < 0) { // Not found
                res.status(404).send(`Part ${req.params.id} not found`);
            }
            else {
                console.log('Changing stock for ', req.params.id);
                parts[part].stock += parseInt(req.body.stock); // stock property must exist
                res.send(parts[part]);
            }
        })
    });

//-------------------------------------------------------------------------------------------------------------------

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
];
app.put('/api/lists/:name', (req, res) => {
    const newList = req.body;
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
    }
});


// Backend functionality 7
app.post('api/lists/:id', (req, res) => {

});

// Backend functionality 8
app.get('/api/lists/:name', (req, res) => {
    let listName = req.params.name;

    let listIndex = playlists.findIndex(l => l.name == listName);

    let track_ids = playlists[listIndex].tracks;
    res.send(track_ids);
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
    let lists = playlists.map(selectProperties('name'));
    res.send(lists);
});

// Install the router at /api/parts
app.use('/api/test', router)

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
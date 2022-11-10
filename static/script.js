document.getElementById('track-search').addEventListener('click', searchTracks);
document.getElementById('artist-search').addEventListener('click', searchArtists);
document.getElementById('album-search').addEventListener('click', searchTracks);
document.getElementById('new-track-search').addEventListener('click', newTracks);
document.getElementById('submitBtn').addEventListener('click', addSelectedTracks);
document.getElementById('createBtn').addEventListener('click', createPlaylist);
document.getElementById('modify-search').addEventListener('click', modifySearchResult);
document.getElementById('modify-submit').addEventListener('click', changeTracks);
document.getElementById('modifyBtn').addEventListener('click', replaceTracks)
const resultsList = document.getElementById('resultsList');
const playlists = document.getElementById('playlists');
const tracklist = document.getElementById('tracks');
let tempNewTracks = [];
let modifyTracks = [];

// Used by other functions to clear a list before dynamically populating it again
function listClear(list) {
    while(list.firstChild){
        list.firstChild.remove();
    }
}

// Called at the end of the script and at the end of some functions. Loads all previously created playlists into the list
function loadPlaylists(){

    listClear(playlists);

    // This request gets a list of all the available playlists (an array with objects {name: '', tracks: [], duration: ''})
    fetch('/api/lists')
    .then(res => res.json()
    .then(lists => {
        lists.forEach(lists => {
            // Create new list item for the playlist information
            const newItem = document.createElement('li');
            newItem.className = 'playlist-item';
            newItem.id = lists.name;
            newItem.addEventListener('click', displayPlaylist);
            newItem.appendChild(document.createTextNode(`${lists.name}: Total tracks ${lists.num_of_tracks} : duration ${lists.length}`));
            playlists.appendChild(newItem);

            // Create Delete button
            const newDelBtn = document.createElement('button');
            newDelBtn.id = lists.name + 1;
            newDelBtn.className = 'delete';
            newDelBtn.addEventListener('click', deletePlaylist);
            newDelBtn.appendChild(document.createTextNode('Delete'));
            playlists.appendChild(newDelBtn);
        });
    }));
}

// Populates the list where user selects tracks to add based on a search
function newTracks() {
    
    // Gets search value entered and fetches the routes for 
    const searchValue = document.getElementById('new-list-tracks').value;

    const route = '/api/tracks/' + searchValue;

    fetch(route)
    .then(res => res.json()
    .then(tracks => { // backend responds with the track ids of those that match the search (up to 10)
        tracks.forEach(trackId => {
            
            const idRoute = '/api/track/' + trackId;

            fetch(idRoute)
            .then(res => res.json()
            .then(selectedTrack => { // backend responds with the specific track related to the given track_id

                // create new list item and add a text node containing the track name
                const newItem = document.createElement('li');
                newItem.appendChild(document.createTextNode(selectedTrack.track_title));

                // add check box to each list item
                const checkBoxes = document.createElement('input');
                checkBoxes.type = 'checkbox';

                // id of check box = id of track
                checkBoxes.id = trackId;

                newItem.appendChild(checkBoxes);

                const orderedList = document.getElementById('new-results');
                orderedList.appendChild(newItem);
            }));

        });
    }));
}

// finds the selected tracks and adds them to a temp array, as well as the list containing added tracks
function addSelectedTracks(){

    const listOfTracks = document.getElementById('new-results');

    // iterates the list of tracks, finding the ones that are selected and pushing them to the tempNewTracks array
    for(i = 1; i < listOfTracks.childNodes.length; i++){
        let item = listOfTracks.childNodes[i];
        let itemId = item.lastChild.id;
        let id = parseInt(itemId);

        if(item.lastChild.checked){
            tempNewTracks.push(id);
        }
        
    }

    const createList = document.getElementById('new-tracks-list');

    // Takes the selected track ids and finds the track title. Adds the title to the creating list
    for(j = 0; j < tempNewTracks.length; j++){

        const trackId = tempNewTracks[j];
        const route = '/api/track/' + trackId;
        
        fetch(route)
        .then(res => res.json()
        .then( track => {

            const newItem = document.createElement('li');
            newItem.appendChild(document.createTextNode(track.track_title));
            
            createList.appendChild(newItem);
        }))
    }

    listClear(listOfTracks);

}

// Takes the track ids from the array and sends them in the body of a put request
function createPlaylist(){

    // converts integers to strings
    for(i = 0; i < tempNewTracks; i++){
        tempNewTracks[i] = tempNewTracks[i] + '';
    }

    const listName = document.getElementById('playlist-name').value;
    const route = '/api/lists/' + listName;

    const update = {
        'track': tempNewTracks
    };

    const options = {
        method: 'PUT',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(update)
    }

    // Sends playlist name as a parameter
    fetch(route, options)
    .then(res => res.json()
    .then(data => {             // backend responds with the array of track ids for the given list name
        console.log(data);
    }));
    
    loadPlaylists();
    listClear(document.getElementById('new-tracks-list'));
    trackArrReset();
}

function trackArrReset() {
    tempNewTracks = [];
}

// Searching by track title. Called on search button press
function searchTracks() {

    // Clears Previous Search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('track').value.toLowerCase();

    const route = '/api/tracks/' + searchValue;

    // This fetch will send the track name or album name as a parameter and a list of 10 or less tracks
    fetch(route)
    .then(res => res.json()
    .then(data => { //The data is a list of 10 or less tracks

        data.forEach(trackId => {

            const idRoute = '/api/track/' + trackId;

            // This fetch take puts the track id as a parameter in the route, then returns the corresponding track (with all properties)
            fetch(idRoute)
            .then(res => res.json()
            .then(data => { //track with all properties
                const newItem = document.createElement('li');
                newItem.appendChild(document.createTextNode(data.track_title));

                // li element is added to the results list
                resultsList.appendChild(newItem);
            }))
        })
    }));

    document.getElementById('track').value = null;
}


// Searching by artists name. Called on Search button press
function searchArtists() {

    // Clears previous search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('artist').value;
    fetch('/api/artists/' + searchValue)
    .then(res => res.json()
    .then(artists => {
        artists.forEach(artistId => {
            
            fetch('/api/artist/' + artistId)
            .then(res => res.json()
            .then(artist => {

                const listItem = document.createElement('li');
                listItem.appendChild(document.createTextNode(artist.artist_name));
                resultsList.appendChild(listItem);

            }))
        })
    }));
}

// When a playlist is clicked, this function is called
function displayPlaylist(list) {

    listClear(tracklist); // Clear the list of anything that might be currently displayed
    
    let playlistName = list.srcElement.id;
    let header = document.getElementById('playlist-header');

    listClear(header); // Clear header value to be updated

    header.appendChild(document.createTextNode(playlistName)); // Display the header as the playlist name

    const route = '/api/lists/' + playlistName;
    
    fetch(route) 
    .then(res => res.json()
    .then(tracks => { // backend responds with a list of track ids for the given playlist name

        for(i = 0; i < tracks.length; i++){
            const track = tracks[i];
            console.log(tracks[i]);

            const idRoute = '/api/track/' + track;

            fetch(idRoute)
            .then(res => res.json()
            .then(data => {
                const newItem = document.createElement('li');
                newItem.className = 'playlist-item';
                newItem.appendChild(document.createTextNode(`Song: ${data.track_title}, Artist: ${data.artist_name}, Album: ${data.album_title}, Playtime: ${data.track_duration}`));
                tracklist.appendChild(newItem);

            }));

        }
    }));
};
 
// called on search btn in modify div. Used to update the search results
function modifySearchResult(){

    const searchValue = document.getElementById('modify-track-search').value;

    const route = '/api/tracks/' + searchValue;

    fetch(route)
    .then(res => res.json()
    .then(tracks => {                   // backend responds with a list of track ids that correspond to the search value
        tracks.forEach(trackId => {
            
            const idRoute = '/api/track/' + trackId;

            fetch(idRoute)
            .then(res => res.json()
            .then(selectedTrack => {
                // create new list item and add a text node containing the track name
                const newItem = document.createElement('li');
                newItem.appendChild(document.createTextNode(selectedTrack.track_title));

                // add check box to each list item
                const checkBoxes = document.createElement('input');
                checkBoxes.type = 'checkbox';
                // id of check box = id of track
                checkBoxes.id = trackId;

                newItem.appendChild(checkBoxes);

                const orderedList = document.getElementById('modify-results');
                orderedList.appendChild(newItem);
            }));
        });
    }));
}

// Used to select the tracks wanted and add them to the selected list as well as the array
function changeTracks(){
    const listOfTracks = document.getElementById('modify-results');

    // iterates through the resulting tracks from the search. pushes selected ones to an array
    for(i = 1; i < listOfTracks.childNodes.length; i++){
        let item = listOfTracks.childNodes[i];
        let itemId = item.lastChild.id;
        let id = parseInt(itemId);

        if(item.lastChild.checked){
            modifyTracks.push(id);
        }
    }

    const modifyList = document.getElementById('modified-tracks-list');

    // add the selected items (from array) to the selection list
    for(j = 0; j < modifyTracks.length; j++){

        const trackId = modifyTracks[j];
        const route = '/api/track/' + trackId;
        
        fetch(route)
        .then(res => res.json()
        .then( track => {

            const newItem = document.createElement('li');
            newItem.appendChild(document.createTextNode(track.track_title));
            
            modifyList.appendChild(newItem);
        }))
    }

    listClear(listOfTracks);
}

function replaceTracks(){

    // changes ids to strings
    for(i = 0; i < modifyTracks; i++){
        modifyTracks[i] = modifyTracks[i] + '';
    }

    const listName = document.getElementById('modify-name').value;
    const route = '/api/lists/' + listName;

    const update = {
        'track': modifyTracks
    };

    const options = {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify(update)
    }

    fetch(route, options)
    .then(res => res.json()
    .then(updatedList => {  // res = the updated list of tracks
        loadPlaylists();
    }));
    
    listClear(document.getElementById('modified-tracks-list'));
    modifyTrackArrReset();
}

function modifyTrackArrReset(){
    modifyTracks = [];
}

function deletePlaylist(list) {

    let playlistName = list.srcElement.id;

    // Remove the 1 from the id on the button
    let tempArr = playlistName.split('');
    tempArr.splice(tempArr.length - 1, tempArr.length);
    playlistName = tempArr.join('');

    const route = '/api/lists/' + playlistName;

    fetch(route, {method: 'DELETE'})
    .then(res => res.json()
    .then(data => {
        console.log(data);
    }));

    loadPlaylists();
};

loadPlaylists();
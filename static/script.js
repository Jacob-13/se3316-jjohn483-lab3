document.getElementById('track-search').addEventListener('click', searchTracks);
document.getElementById('artist-search').addEventListener('click', searchArtists);
document.getElementById('album-search').addEventListener('click', searchTracks); // Need to change this? idek man
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

/*

    Add an 'add' button to each of the 10 search results on a list. green btn is cool?
    The add button opens a drop down menu to each of the playlist names.
    The playlist name selected will have that track added to the playlist.
    Update the 'Playlists' list.

*/

// Used by other functions to clear a list before dynamically populating it again
function listClear(list) {
    while(list.firstChild){
        list.firstChild.remove();
    }
}

// Called at the end of the script. Loads all previously created playlists into the list
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

function newTracks() {
    //listClear((document.getElementById('new-tracks-list')));
    
    const searchValue = document.getElementById('new-list-tracks').value;

    const route = '/api/tracks/' + searchValue;

    fetch(route)
    .then(res => res.json()
    .then(tracks => {
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

                const orderedList = document.getElementById('new-results');
                orderedList.appendChild(newItem);
            }));

        });
    }));
}

function addSelectedTracks(){
    const listOfTracks = document.getElementById('new-results');

    for(i = 1; i < listOfTracks.childNodes.length; i++){
        let item = listOfTracks.childNodes[i];
        let itemId = item.lastChild.id;
        let id = parseInt(itemId);

        if(item.lastChild.checked){
            tempNewTracks.push(id);
        }
        
    }

    const createList = document.getElementById('new-tracks-list');

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

function createPlaylist(){

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
    .then(data => {
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
/*
// Searching by album title. Called on search button press
function searchAlbums() {

    // Clears previous search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('album').value.toLowerCase();
    fetch('/api/tracks')
    .then(res => res.json()
    .then(data => {
        const tracks = data.filter(track => track.album_title.toLowerCase().includes(searchValue));
        tracks.forEach(track => {
            const newItem = document.createElement('li');
            newItem.appendChild(document.createTextNode(`${track.track_title}\n on ${track.album_title}\n by ${track.artist_name}`));
            resultsList.appendChild(newItem);
        })
    }));
}*/

// Called when the create button is pressed
/*function newPlaylist(){

    const searchValue = document.getElementById('playlist-name').value;
    const route = '/api/lists/' + searchValue;

    // Sends playlist name as a parameter
    fetch(route, {method: 'PUT'})
    .then(res => res.json()
    .then(data => {
        // re-loads the playlist name to display the new playlist in it
        loadPlaylists();
    }));
}*/

function displayPlaylist(list) {

    listClear(tracklist); // Clear the list of anything that might be currently displayed
    
    let playlistName = list.srcElement.id;
    let header = document.getElementById('playlist-header');

    listClear(header); // Clear header value to be updated

    header.appendChild(document.createTextNode(playlistName)); // Display the header as the playlist name

    const route = '/api/lists/' + playlistName;
    
    fetch(route) // /api/lists/playlistName
    .then(res => res.json()
    .then(tracks => { // data might be an array of track ids

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

                const newDelBtn = document.createElement('button');
                //newDelBtn.id = list.name + 1;
                newDelBtn.className = 'delete';
                //newDelBtn.addEventListener('click', deleteTrack);
                newDelBtn.appendChild(document.createTextNode('Delete'));
            }));

        }
    }));
};
 
// called on search btn in modify div
function modifySearchResult(){

    const searchValue = document.getElementById('modify-track-search').value;

    const route = '/api/tracks/' + searchValue;

    fetch(route)
    .then(res => res.json()
    .then(tracks => {
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

function changeTracks(){
    const listOfTracks = document.getElementById('modify-results');

    for(i = 1; i < listOfTracks.childNodes.length; i++){
        let item = listOfTracks.childNodes[i];
        let itemId = item.lastChild.id;
        let id = parseInt(itemId);

        if(item.lastChild.checked){
            modifyTracks.push(id);
        }
    }

    const modifyList = document.getElementById('modified-tracks-list');

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
        //console.log(updatedList);
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
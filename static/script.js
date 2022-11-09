document.getElementById('track-search').addEventListener('click', searchTracks);
//document.getElementById('artist-search').addEventListener('click', searchArtists);
document.getElementById('album-search').addEventListener('click', searchTracks); // Need to change this? idek man
document.getElementById('new-playlist').addEventListener('click', newPlaylist);
document.getElementById('text1').addEventListener('click', testFunction);
const resultsList = document.getElementById('resultsList');
const playlists = document.getElementById('playlists');
const tracklist = document.getElementById('tracks');

// Used by other functions to clear a list before dynamically populating it again
function listClear(list) {
    while(list.firstChild){
        list.firstChild.remove();
    }
}

//used on li testing text to check onclick attribute
function testFunction(string) {
    console.log(string.srcElement.id)
}

// Called at the end of the script. Loads all previously created playlists into the list
function loadPlaylists(){

    listClear(playlists);

    fetch('/api/lists')
    .then(res => res.json()
    .then(data => {
        data.forEach(list => {
            // Create new list item for the playlist information
            const newItem = document.createElement('li');
            newItem.className = 'playlist-item';
            newItem.id = list.name;
            newItem.addEventListener('click', displayPlaylist);
            newItem.appendChild(document.createTextNode(`${list.name}: Total tracks ${list.num_of_tracks} : duration ${list.length}`)); // Can maybe put this in a table with headers
            playlists.appendChild(newItem);

            // Create Delete button
            const newDelBtn = document.createElement('button');
            newDelBtn.id = list.name + 1;
            newDelBtn.className = 'delete';
            newDelBtn.addEventListener('click', deletePlaylist);
            newDelBtn.appendChild(document.createTextNode('Delete'));
            playlists.appendChild(newDelBtn);
        });
    }));
}

// Searching by track title. Called on search button press
function searchTracks() {

    // Clears Previous Search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('track').value.toLowerCase();

    const route = '/api/tracks/' + searchValue;

    fetch(route)
    .then(res => res.json()
    .then(data => {

        data.forEach(trackId => {

            const idRoute = '/api/track/' + trackId;

            fetch(idRoute)
            .then(res => res.json()
            .then(data => {
                const newItem = document.createElement('li');
                newItem.appendChild(document.createTextNode(data.track_title));
                resultsList.appendChild(newItem);
            }))

        })

    }));
}

/*
// Searching by artists name. Called on Search button press
function searchArtists() {

    // Clears previous search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('artist').value.toLowerCase();
    fetch('/api/tracks')
    .then(res => res.json()
    .then(data => {
        const tracks = data.filter(track => track.artist_name.toLowerCase().includes(searchValue));
        tracks.forEach(track => {
            const newItem = document.createElement('li');
            newItem.appendChild(document.createTextNode(`${track.track_title}\n on ${track.album_title}\n by ${track.artist_name}`));
            resultsList.appendChild(newItem);
        })
    }));
}

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
function newPlaylist(){

    const searchValue = document.getElementById('playlist-name').value;
    const route = '/api/lists/' + searchValue;

    fetch(route, {method: 'PUT'})
    .then(res => res.json()
    .then(data => {
        const listLength = data.length;
        const newItem = document.createElement('li');
        newItem.className = 'playlist-item';
        newItem.appendChild(document.createTextNode(`${searchValue}: Tracks: ${listLength}`));
        playlists.appendChild(newItem);
    }));
}

function displayPlaylist(list) {

    listClear(tracklist); // Clear the list of anything that might be currently displayed
    
    let playlistName = list.srcElement.id;
    let header = document.getElementById('playlist-header');

    listClear(header); // Clear header value to be updated

    header.appendChild(document.createTextNode(playlistName)); // Display the header as the playlist name

    const route = '/api/lists/' + playlistName;
    
    fetch(route) // /api/lists/playlistName
    .then(res => res.json()
    .then(data => { // data is an array of track ids
        data.forEach(track => {

            const idRoute = '/api/track/' + track;

            fetch(idRoute)
            .then(res => res.json()
            .then(data => {
                const newItem = document.createElement('li');
                newItem.className = 'playlist-item';
                newItem.appendChild(document.createTextNode(`Song: ${data.track_title}, Artist: ${data.artist_name}, Album: ${data.album_title}, Playtime: ${data.track_duration}`));
                tracklist.appendChild(newItem);
            }));
        });
    }));
};

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
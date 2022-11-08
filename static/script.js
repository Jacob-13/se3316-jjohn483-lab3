document.getElementById('track-search').addEventListener('click', searchTracks);
document.getElementById('artist-search').addEventListener('click', searchArtists);
document.getElementById('album-search').addEventListener('click', searchAlbums);
document.getElementById('new-playlist').addEventListener('click', newPlaylist);
const resultsList = document.getElementById('resultsList');
const playlists = document.getElementById('playlists');


function listClear(list) {
    while(list.firstChild){
        list.firstChild.remove();
    }
}

function loadPlaylists(){
    fetch('/api/lists')
    .then(res => res.json()
    .then(data => {
        data.forEach(list => {
            const newItem = document.createElement('li');
            newItem.className = 'playlist-item';
            newItem.appendChild(document.createTextNode(`${list.name}: Total tracks ${list.num_of_tracks} : duration ${list.length}`)); // Can maybe put this in a table with headers
            playlists.appendChild(newItem);
        });
    }));
}

// Searching by track title
function searchTracks() {

    // Clears Previous Search
    listClear(resultsList);

    // Accesses tracks from the backend and displays resulting tracks to the list
    const searchValue = document.getElementById('track').value.toLowerCase();
    fetch('/api/tracks')
    .then(res => res.json()
    .then(data => {
        const tracks = data.filter(track => track.track_title.toLowerCase().includes(searchValue));
        tracks.forEach(track => {
            const newItem = document.createElement('li');
            newItem.appendChild(document.createTextNode(`${track.track_title}\n on ${track.album_title}\n by ${track.artist_name}`));
            resultsList.appendChild(newItem);
        });
    }));
}

// Searching by artists name
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

// Searching by album title
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
}

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

loadPlaylists();
document.getElementById('track-search').addEventListener('click', searchTracks);
document.getElementById('artist-search').addEventListener('click', searchArtists);
document.getElementById('album-search').addEventListener('click', searchAlbums);
const resultsList = document.getElementById('resultsList');


function listClear(list) {
    while(list.firstChild){
        list.firstChild.remove();
    }
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
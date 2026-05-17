if(localStorage.getItem('isLoggedIn') !== 'true'){

    window.location.href = '/login.html';
}

let allSongs = [];

loadSongs();

function showPage(event,pageId){

    document.querySelectorAll('.page')
    .forEach(page => {
        page.classList.remove('active-page');
    });

    document.getElementById(pageId)
    .classList.add('active-page');

    document.querySelectorAll('.nav-btn')
    .forEach(btn => {
        btn.classList.remove('active');
    });

    event.target.classList.add('active');
}

async function loadSongs(){

    const response = await fetch('/api/songs');

    const songs = await response.json();

    allSongs = songs;

    renderSongs(songs);

    renderArtists(songs);

    renderGenres(songs);    

    renderRankings(songs);

    document.getElementById('songCount')
    .innerText = songs.length;

    const artistCount =
    new Set(
        songs.flatMap(song => song.artist_names || [])
    ).size;

    document.getElementById('artistCount')
    .innerText = artistCount;

    const genreCount =
    new Set(
        songs.map(song => song.genres)
    ).size;

    document.getElementById('genreCount')
    .innerText = genreCount;

    const totalStreams =
    songs.reduce((acc,song)=>
        acc + (song.estimated_streams_2025 || 0)
    ,0);

    document.getElementById('streamCount')
    .innerText =
    (totalStreams / 1000000000).toFixed(1) + 'B';

    loadCharts(songs);
}

function renderSongs(songs){

    const table =
    document.getElementById('songTable');

    table.innerHTML = '';

    songs.forEach(song => {

        table.innerHTML += `

        <tr>

            <td>${song.track_name}</td>

            <td>${song.artist_names?.join(', ') || '-'}</td>

            <td>${song.genres || '-'}</td>

            <td>${song.popularity}</td>

            <td>
                ${(
                    (song.estimated_streams_2025 || 0)
                    /1000000
                ).toFixed(0)}M
            </td>

            <td>
<div class="action-group">

    <button
    class="action-btn view-btn"
    onclick="viewSong('${song._id}')">

        View

    </button>

    <button
    class="action-btn delete-btn"
    onclick="deleteSong('${song._id}')">

        Delete

    </button>

</div>

            </td>

        </tr>

        `;
    });
}

function renderArtists(songs){

    const container =
    document.getElementById('artistContainer');

    container.innerHTML = '';

    const artists = {};

    songs.forEach(song => {

        (song.artist_names || [])
        .forEach(artist => {

            if(!artists[artist]){
                artists[artist] = [];
            }

            artists[artist].push(song.track_name);
        });
    });

    Object.entries(artists)
    .forEach(([artist,songList]) => {

        container.innerHTML += `

        <div
        class="artist-card"
        onclick="showArtistSongs('${artist}')">

            <h2>${artist}</h2>

            <p>${songList.length} Songs</p>


        </div>

        `;
    });
}

function renderGenres(songs){

    const container =
    document.getElementById('genreContainer');

    container.innerHTML = '';

    const genres = {};

    songs.forEach(song => {

        const genre =
        song.genres || 'Unknown';

        if(!genres[genre]){
            genres[genre] = [];
        }

        genres[genre].push(song.track_name);
    });

    Object.entries(genres)
    .forEach(([genre,songList]) => {

        container.innerHTML += `

        <div
        class="genre-item"
        onclick="showGenreSongs('${genre}')">

            <span>${genre}</span>

            <div class="bar">
                <div style="width:${songList.length * 10}%"></div>
            </div>

            <p>${songList.length} Songs</p>

        </div>

        `;
    });
}

function renderRankings(songs){

    const container =
    document.getElementById('rankingContainer');

    container.innerHTML = '';

    const sorted =
    [...songs]
    .sort((a,b)=>
        b.popularity - a.popularity
    );

    sorted.slice(0,5)
    .forEach((song,index)=>{

        container.innerHTML += `

        <div class="ranking-item">

            #${index+1}
            ${song.track_name}

        </div>

        `;
    });
}

function searchSongs(){

    const keyword =
    document.getElementById('searchInput')
    .value
    .toLowerCase();

    const filtered =
    allSongs.filter(song =>

        song.track_name
        .toLowerCase()
        .includes(keyword)

    );

    renderSongs(filtered);
}

async function addSong(){

    const track_name =
    document.getElementById('track_name').value.trim();

    const artist_name =
    document.getElementById('artist_name').value.trim();

    const genres =
    document.getElementById('genres').value.trim();

    const popularity =
    document.getElementById('popularity').value.trim();

    const streams =
    document.getElementById('streams').value.trim();

    console.log(
        track_name,
        artist_name,
        genres,
        popularity,
        streams
    );

    if(
        !track_name ||
        !artist_name ||
        !genres ||
        !popularity ||
        !streams
    ){
        alert('Please fill all fields');
        return;
    }

    try{

        const response = await fetch('/api/songs',{

            method:'POST',

            headers:{
                'Content-Type':'application/json'
            },

            body:JSON.stringify({

                track_name,
                artist_names:[artist_name],
                genres,
                popularity,
                estimated_streams_2025:streams

            })

        });

        if(response.ok){

            alert('Song added successfully 🎵');

            closeModal();

            loadSongs();

        }else{

            alert('Failed to add song');

        }

    }catch(err){

        console.log(err);

        alert('Server error');

    }
}

async function deleteSong(id){

    await fetch(`/api/songs/${id}`,{
        method:'DELETE'
    });

    loadSongs();
}

function openModal(){

    document.getElementById('modal')
    .style.display = 'flex';
}

function closeModal(){

    document.getElementById('modal')
    .style.display = 'none';
}

window.onclick = function(e){

    const modal =
    document.getElementById('modal');

    if(e.target == modal){

        closeModal();
    }
}

function loadCharts(songs){

    const topSongs =
    [...songs]
    .sort((a,b)=>
        b.popularity - a.popularity
    )
    .slice(0,5);

    new Chart(
    document.getElementById('streamChart'),
    {
        type:'bar',

        data:{
            labels:
            topSongs.map(
                s=>s.track_name
            ),

            datasets:[{

                label:'Popularity',

                data:
                topSongs.map(
                    s=>s.popularity
                ),

                borderRadius:14,
                borderSkipped:false
            }]
        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{

                y:{

                    min:80,
                    max:100,

                    ticks:{
                        stepSize:2,
                        color:'#9ca3af'
                    },

                    grid:{
                        color:'rgba(255,255,255,0.05)'
                    }
                },

                x:{

                    ticks:{
                        color:'#9ca3af'
                    },

                    grid:{
                        display:false
                    }
                }
            }
        }
    }
);

    new Chart(
        document.getElementById('moodChart'),
        {
            type:'doughnut',

            data:{
                labels:[
                    'Happy',
                    'Sad',
                    'Chill',
                    'Energetic'
                ],

                datasets:[{
                    data:[40,20,25,15]
                }]
            }
        }
    );
}

function viewSong(id){

    const song =
    allSongs.find(s => s._id === id);

    document.getElementById('detailTitle')
    .innerText = song.track_name;

    let html = `

        <p>
        <b>Artist:</b>
        ${song.artist_names?.join(', ') || '-'}
        </p>

        <p>
        <b>Genre:</b>
        ${song.genres || '-'}
        </p>

        <p>
        <b>Popularity:</b>
        ${song.popularity || 0}
        </p>

    `;

    if(song.album_name){

        html += `

        <p>
        <b>Album:</b>
        ${song.album_name}
        </p>

        `;
    }

    if(song.estimated_streams_2025){

        html += `

        <p>
        <b>Streams:</b>
        ${song.estimated_streams_2025}
        </p>

        `;
    }

    if(song.danceability){

        html += `

        <p>
        <b>Danceability:</b>
        ${song.danceability}
        </p>

        `;
    }

    if(song.energy){

        html += `

        <p>
        <b>Energy:</b>
        ${song.energy}
        </p>

        `;
    }

    if(song.valence){

        html += `

        <p>
        <b>Valence:</b>
        ${song.valence}
        </p>

        `;
    }

    if(song.tempo){

        html += `

        <p>
        <b>Tempo:</b>
        ${song.tempo}
        </p>

        `;
    }

    document.getElementById('detailContent')
    .innerHTML = html;

    document.getElementById('detailModal')
    .style.display = 'flex';
}

function closeDetail(){

    document.getElementById('detailModal')
    .style.display = 'none';
}

document
.getElementById('saveSong')
.addEventListener('click',()=>{

    const title =
    document.getElementById('songTitle').value;

    const artist =
    document.getElementById('songArtist').value;

    const genre =
    document.getElementById('songGenre').value;

    const popularity =
    document.getElementById('songPopularity').value;

    const streams =
    document.getElementById('songStreams').value;

    if(
    !title ||
    !artist ||
    !genre ||
    !popularity ||
    !streams
    ){
        alert('Please fill all fields');
        return;
    }

    const row =
    document.createElement('tr');

    row.innerHTML = `

    <td>${title}</td>

    <td>${artist}</td>

    <td>${genre}</td>

    <td>${popularity}</td>

    <td>${streams}</td>

    <td>

    <div class="action-group">

    <button class="action-btn view-btn">
    👁 View
    </button>

    <button class="action-btn delete-btn">
    🗑 Delete
    </button>

    </div>

    </td>
    `;

    document
    .getElementById('songTable')
    .appendChild(row);

    document
    .getElementById('songModal')
    .style.display='none';

});

function showArtistSongs(artist){

    const filtered =
    allSongs.filter(song =>
        song.artist_names?.includes(artist)
    );

    renderSongs(filtered);

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById('songs')
    .classList.add('active-page');
}

function showGenreSongs(genre){

    const filtered =
    allSongs.filter(song =>
        song.genres === genre
    );

    renderSongs(filtered);

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById('songs')
    .classList.add('active-page');
}

function filterMood(mood){

    let filtered = [];

    if(mood === 'Happy'){
        filtered =
        allSongs.filter(song =>
            song.valence > 0.6
        );
    }

    else if(mood === 'Sad'){
        filtered =
        allSongs.filter(song =>
            song.valence < 0.3
        );
    }

    else if(mood === 'Chill'){
        filtered =
        allSongs.filter(song =>
            song.energy < 0.5
        );
    }

    else if(mood === 'Energetic'){
        filtered =
        allSongs.filter(song =>
            song.energy > 0.7
        );
    }

    renderSongs(filtered);

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById('songs')
    .classList.add('active-page');
}

function logout(){

    localStorage.removeItem('loggedIn');

    window.location.href = 'login.html';
}

function goPage(pageId){

    document.querySelectorAll('.page')
    .forEach(page => {
        page.classList.remove('active-page');
    });

    document.getElementById(pageId)
    .classList.add('active-page');

    document.querySelectorAll('.nav-btn')
    .forEach(btn => {
        btn.classList.remove('active');
    });
}
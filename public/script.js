if(localStorage.getItem('isLoggedIn') !== 'true'){

    window.location.href = '/login.html';
}

let allSongs = [];

let previousPage = 'dashboard';

loadSongs();

function showPage(event,pageId){

    const activePage =
    document.querySelector('.active-page');

    if(activePage){

        previousPage =
        activePage.id;
    }

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

    renderAlbums(songs);

    renderLabels(songs);

    renderGenres(songs);

    renderMoods(songs); 

    renderRankings(songs);

    document.getElementById('songCount')
    .innerText = songs.length;

    const artistCount =
    new Set(
        songs.flatMap(song => song.artist_names || [])
    ).size;

    document.getElementById('artistCount')
    .innerText = artistCount;

    const albumCount =
new Set(
    songs.map(song => song.album_name || 'Unknown Album')
).size;

document.getElementById('albumCount')
.innerText = albumCount;

const labelCount =
new Set(
    songs.map(song => song.record_label || 'Unknown Label')
).size;

document.getElementById('labelCount')
.innerText = labelCount;

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

window.onclick = function(e){
    const detailModal = document.getElementById('detailModal');
    if(e.target == detailModal){
        closeDetail();
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

function showArtistSongs(artist){

    showPage(
        { target: document.querySelectorAll('.nav-btn')[1] },
        'songs'
    );

    const filtered =
    allSongs.filter(song =>
        (song.artist_names || [])
        .includes(artist)
    );

    renderSongs(filtered);
}
function showGenreSongs(genre){


    showPage(
        { target: document.querySelectorAll('.nav-btn')[1] },
        'songs'
    );

    const filtered =
    allSongs.filter(song =>
        song.genres === genre
    );

    renderSongs(filtered);
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

    document.querySelectorAll('.nav-btn')
    .forEach(btn=>{
        btn.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn')[1]
    .classList.add('active');
}

function renderMoods(songs){

    const container =
    document.getElementById('moodContainer');

    if(!container) return;

    container.innerHTML = '';

    const moods = [

        {
    name:'Happy',
    emoji:'☀️',
    class:'happy',
    filter:s=>s.valence > 0.6
},

{
    name:'Sad',
    emoji:'🌙',
    class:'sad',
    filter:s=>s.valence < 0.3
},

{
    name:'Chill',
    emoji:'🌊',
    class:'chill',
    filter:s=>s.energy < 0.5
},

{
    name:'Energetic',
    emoji:'⚡',
    class:'energetic',
    filter:s=>s.energy > 0.7
}
    ];

    moods.forEach(mood=>{

        const moodSongs =
        songs.filter(mood.filter);

        const topSong =
        moodSongs[0]?.track_name || '-';

        container.innerHTML += `

        <div
        class="mood-card ${mood.class}"
        onclick="filterMood('${mood.name}')">

            <div>

                <h2>
                    ${mood.emoji}
                    ${mood.name}
                </h2>

                <p>
                    ${moodSongs.length} Songs
                </p>

                <span>
                    Top: ${topSong}
                </span>

            </div>

        </div>

        `;
    });
}


function logout(){

    localStorage.removeItem('isLoggedIn');

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

function renderAlbums(songs){

    const container =
    document.getElementById('albumContainer');

    container.innerHTML = '';

    const albums = {};

    songs.forEach(song => {

        const album =
        song.album_name || 'Unknown Album';

        albums[album] =
        (albums[album] || 0) + 1;
    });

    Object.entries(albums)
    .forEach(([album,total]) => {

        container.innerHTML += `

        <div
        class="artist-card"
        onclick="searchByAlbum('${album}')">

            <h2>${album}</h2>

            <p>${total} Songs</p>

        </div>

        `;
    });
}

function renderLabels(songs){

    const container =
    document.getElementById('labelContainer');

    container.innerHTML = '';

    const labels = {};

    songs.forEach(song => {

        const label =
        song.record_label || 'Unknown Label';

        labels[label] =
        (labels[label] || 0) + 1;
    });

    Object.entries(labels)
    .forEach(([label,total]) => {

        container.innerHTML += `

        <div
        class="artist-card"
        onclick="showLabelSongs('${label}')">

            <h2>${label}</h2>

            <p>${total} Songs</p>

        </div>

        `;
    });
}

function searchByAlbum(albumName){

    showPage(
        { target: document.querySelectorAll('.nav-btn')[1] },
        'songs'
    );

    const filtered =
    allSongs.filter(song =>
        song.album_name === albumName
    );

    renderSongs(filtered);
}

function showLabelSongs(label){

    const filtered =
    allSongs.filter(song =>
        song.record_label === label
    );

    renderSongs(filtered);

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById('songs')
    .classList.add('active-page');

    document.querySelectorAll('.nav-btn')
    .forEach(btn=>{
        btn.classList.remove('active');
    });

    document.querySelectorAll('.nav-btn')[1]
    .classList.add('active');
}

function goBack(){

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById(previousPage)
    .classList.add('active-page');

    document.querySelectorAll('.nav-btn')
    .forEach(btn=>{
        btn.classList.remove('active');
    });

    const pageMap = {

        dashboard:0,
        songs:1,
        artists:2,
        albums:3,
        labels:4,
        genres:5,
        moods:6,
        rankings:7
    };

    const index =
    pageMap[previousPage];

    if(index !== undefined){

        document
        .querySelectorAll('.nav-btn')[index]
        .classList.add('active');
    }

    renderSongs(allSongs);
}

function goToPage(pageId){

    document.querySelectorAll('.page')
    .forEach(page=>{
        page.classList.remove('active-page');
    });

    document
    .getElementById(pageId)
    .classList.add('active-page');

    document.querySelectorAll('.nav-btn')
    .forEach(btn=>{
        btn.classList.remove('active');
    });

    const pageMap = {
        dashboard:0,
        songs:1,
        artists:2,
        albums:3,
        labels:4,
        genres:5,
        moods:6,
        rankings:7
    };

    const index = pageMap[pageId];

    if(index !== undefined){

        document
        .querySelectorAll('.nav-btn')[index]
        .classList.add('active');
    }
}
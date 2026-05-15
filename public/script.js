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

            artists[artist] =
            (artists[artist] || 0) + 1;
        });
    });

    Object.entries(artists)
    .forEach(([artist,total]) => {

        container.innerHTML += `

        <div class="artist-card">

            <h2>${artist}</h2>

            <p>${total} Songs</p>

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

        genres[genre] =
        (genres[genre] || 0) + 1;
    });

    Object.entries(genres)
    .forEach(([genre,total]) => {

        container.innerHTML += `

        <div class="genre-item">

            <span>${genre}</span>

            <div class="bar">

                <div style="width:${total * 20}%"></div>

            </div>

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

    const data = {

        id_track:
        document.getElementById('id_track').value,

        track_name:
        document.getElementById('track_name').value,

        album_name:
        document.getElementById('album_name').value,

        artist_names:[
            document.getElementById('artist_name').value
        ],

        genres:
        document.getElementById('genre').value,

        record_label:
        document.getElementById('record_label').value,

        popularity:
        Number(
            document.getElementById('popularity').value
        ),

        danceability:
        Number(
            document.getElementById('danceability').value
        ),

        energy:
        Number(
            document.getElementById('energy').value
        ),

        valence:
        Number(
            document.getElementById('valence').value
        ),

        tempo:
        Number(
            document.getElementById('tempo').value
        ),

        estimated_streams_2025:
        Number(
            document.getElementById('streams').value
        )
    };

    await fetch('/api/songs',{

        method:'POST',

        headers:{
            'Content-Type':'application/json'
        },

        body:JSON.stringify(data)
    });

    closeModal();

    loadSongs();
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
                    data:
                    topSongs.map(
                        s=>s.popularity
                    )
                }]
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
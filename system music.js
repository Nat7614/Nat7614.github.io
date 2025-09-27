// ------------------- Configuración -------------------
const BANKED_URL = "https://banked-music-production.up.railway.app";

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultList = document.getElementById('result-list');
const youtubePlayerDiv = document.getElementById('youtube-player');
const songTitleEl = document.getElementById('song-title');
const artistNameEl = document.getElementById('artist-name');
const playpauseButton = document.getElementById('playpause-button');
const seekBar = document.getElementById('seek-bar');
const currentTimeEl = document.getElementById('current-time');
const durationEl = document.getElementById('duration');
const warningMessageEl = document.getElementById('warning-message');

let audioPlayer = document.getElementById('audioPlayer');
if (!audioPlayer) {
    audioPlayer = document.createElement('audio');
    audioPlayer.id = 'audioPlayer';
    audioPlayer.style.display = 'none';
    document.body.appendChild(audioPlayer);
}

let currentTrack = null;
let updateInterval = null;

// ------------------- Funciones auxiliares -------------------
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function updateProgress() {
    if (!audioPlayer.duration) return;
    seekBar.max = Math.floor(audioPlayer.duration);
    seekBar.value = Math.floor(audioPlayer.currentTime);
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationEl.textContent = formatTime(audioPlayer.duration);
}

function showWarningMessage(msg) {
    if (!warningMessageEl) return;
    warningMessageEl.textContent = msg;
    warningMessageEl.style.display = 'block';
    setTimeout(() => {
        warningMessageEl.style.display = 'none';
    }, 4000);
}

function clearResults() {
    resultList.innerHTML = '';
}

function displayResults(tracks) {
    clearResults();
    tracks.forEach(track => {
        const li = document.createElement('li');
        li.className = 'result-item';
        li.innerHTML = `
            <div class="thumbnail"><img src="${track.thumbnail}" alt="${track.title}"></div>
            <div class="result-details">
                <h3 class="result-title">${track.title}</h3>
                <p class="result-artist">${track.author}</p>
                <p class="result-duration">Duración: ${formatTime(track.duration)}</p>
            </div>
        `;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => requestAudioFromNative(track));
        resultList.appendChild(li);
    });
}

// ------------------- Buscador vía Banked -------------------
async function searchSongs(query) {
    if (!query) return showWarningMessage('Por favor ingresa un término de búsqueda.');

    clearResults();
    resultList.innerHTML = '<p>Buscando...</p>';

    try {
        const res = await fetch(`${BANKED_URL}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Error en la búsqueda');
        const tracks = await res.json();
        if (!tracks.length) {
            clearResults();
            resultList.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }
        displayResults(tracks);
    } catch (error) {
        console.error(error);
        clearResults();
        resultList.innerHTML = '<p>Error al buscar canciones en Banked.</p>';
    }
}

// ------------------- Reproducción vía APK nativo -------------------
function requestAudioFromNative(track) {
    currentTrack = track;
    if (window.Android) {
        window.Android.getAudioURL(track.videoId);
    } else {
        showWarningMessage('Función no disponible fuera del APK.');
    }
}

// Función que recibe el URL de audio desde la app nativa
function playAudioFromNative(audioUrl) {
    if (!audioUrl) return showWarningMessage('No se recibió URL de audio.');

    audioPlayer.src = audioUrl;
    audioPlayer.loop = true;
    audioPlayer.play();

    songTitleEl.textContent = currentTrack.title;
    artistNameEl.textContent = currentTrack.author;
    youtubePlayerDiv.innerHTML = `<img src="${currentTrack.thumbnail}" alt="${currentTrack.title}" style="width:100%; height:100%; object-fit: cover; border-radius: 10px;">`;

    playpauseButton.querySelector('i').className = 'fas fa-pause';

    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgress, 500);
}

// ------------------- Controles -------------------
playpauseButton.addEventListener('click', () => {
    if (!audioPlayer.src) return showWarningMessage('No hay canción cargada.');
    if (audioPlayer.paused) {
        audioPlayer.play();
        playpauseButton.querySelector('i').className = 'fas fa-pause';
    } else {
        audioPlayer.pause();
        playpauseButton.querySelector('i').className = 'fas fa-play';
    }
});

seekBar.addEventListener('input', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = seekBar.value;
    updateProgress();
});

document.getElementById('next-button').addEventListener('click', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
    updateProgress();
});
document.getElementById('prev-button').addEventListener('click', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
    updateProgress();
});

// ------------------- Eventos de audio -------------------
audioPlayer.addEventListener('ended', () => {
    playpauseButton.querySelector('i').className = 'fas fa-play';
    seekBar.value = 0;
    currentTimeEl.textContent = '0:00';
});
audioPlayer.addEventListener('pause', () => {
    clearInterval(updateInterval);
    playpauseButton.querySelector('i').className = 'fas fa-play';
});
audioPlayer.addEventListener('play', () => {
    if(updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgress, 500);
});

// ------------------- Botón buscar -------------------
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    searchSongs(query);
});
searchInput.addEventListener('keydown', e => { if(e.key==='Enter') searchButton.click(); });

// ------------------- Función para recibir resultados desde APK -------------------
function displayResultsFromNative(tracksJson) {
    const tracks = JSON.parse(tracksJson);
    displayResults(tracks);
}

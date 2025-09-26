// ------------------- Configuración -------------------
const BACKEND_URL = "https://banked-music-production.up.railway.app";

const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultList = document.getElementById('result-list');
const playerContainer = document.getElementById('player');
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
const audioUrlCache = new Map();

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
        li.addEventListener('click', () => playTrackWithRetry(track));
        resultList.appendChild(li);
    });
}

// ------------------- Búsqueda de canciones -------------------
async function searchSongs(query) {
    if (!query) {
        showWarningMessage('Por favor ingresa un término de búsqueda.');
        return;
    }

    clearResults();
    resultList.innerHTML = '<p>Buscando...</p>';

    try {
        const res = await fetch(`${BACKEND_URL}/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Error en la búsqueda');
        const tracks = await res.json();

        if (!tracks.length) {
            clearResults();
            resultList.innerHTML = '<p>No se encontraron resultados.</p>';
            return;
        }

        displayResults(tracks);
    } catch (error) {
        clearResults();
        resultList.innerHTML = '<p>Error al buscar. Intenta de nuevo.</p>';
        console.error(error);
    }
}

// ------------------- Reproducción con reintentos -------------------
async function playTrackWithRetry(track, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            await playTrack(track);
            return;
        } catch (err) {
            console.warn(`Intento ${i+1} de reproducir "${track.title}" falló:`, err.message);
            if (i === retries - 1) {
                showWarningMessage(`No se pudo reproducir "${track.title}" después de ${retries} intentos.`);
            }
        }
    }
}

// ------------------- Reproduce la canción usando Banked -------------------
async function playTrack(track) {
    return new Promise(async (resolve, reject) => {
        try {
            let audioUrl = audioUrlCache.get(track.videoId);
            if (!audioUrl) {
                const res = await fetch(`${BACKEND_URL}/audio?id=${track.videoId}`);
                if (!res.ok) throw new Error('Error al obtener audio desde Banked');
                const data = await res.json();
                if (!data?.audioUrl) throw new Error('No se pudo obtener URL de audio');

                audioUrl = data.audioUrl;
                audioUrlCache.set(track.videoId, audioUrl);
            }

            audioPlayer.src = audioUrl;
            audioPlayer.loop = true;
            await audioPlayer.play();
            currentTrack = track;

            songTitleEl.textContent = track.title;
            artistNameEl.textContent = track.author;
            youtubePlayerDiv.innerHTML = `<img src="${track.thumbnail}" alt="${track.title}" style="width:100%; height:100%; object-fit: cover; border-radius: 10px;">`;

            const icon = playpauseButton.querySelector('i');
            if (icon) icon.className = 'fas fa-pause';

            if (updateInterval) clearInterval(updateInterval);
            updateInterval = setInterval(updateProgress, 500);

            resolve();
        } catch (error) {
            console.error(`[ERROR /playTrack] "${track.title}":`, error);
            reject(error);
        }
    });
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

// ------------------- Buscador -------------------
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) return showWarningMessage('Por favor ingresa un término de búsqueda.');
    searchSongs(query);
});
searchInput.addEventListener('keydown', e => { if(e.key==='Enter') searchButton.click(); });

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

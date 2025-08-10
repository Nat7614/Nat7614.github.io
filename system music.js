// Variables globales
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const resultList = document.getElementById('result-list');
const playerContainer = document.getElementById('player');
const youtubePlayerDiv = document.getElementById('youtube-player'); // Aquí pondremos la miniatura
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

// Formatea segundos a mm:ss
function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

// Actualiza la barra de progreso y tiempo actual
function updateProgress() {
    if (!audioPlayer.duration) return;
    seekBar.max = Math.floor(audioPlayer.duration);
    seekBar.value = Math.floor(audioPlayer.currentTime);
    currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
    durationEl.textContent = formatTime(audioPlayer.duration);
}

// Muestra mensaje de advertencia temporal
function showWarningMessage(msg) {
    if (!warningMessageEl) return;
    warningMessageEl.textContent = msg;
    warningMessageEl.style.display = 'block';
    setTimeout(() => {
        warningMessageEl.style.display = 'none';
    }, 4000);
}

// Limpia lista resultados
function clearResults() {
    resultList.innerHTML = '';
}

// Mostrar resultados en la lista sin botón, clic en todo el li
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
                <p class="result-duration">${track.duration}</p>
            </div>
        `;

        li.style.cursor = 'pointer';

        li.addEventListener('click', () => playTrack(track));

        resultList.appendChild(li);
    });
}

// Busca canciones en backend Banked
async function searchSongs(query) {
    if (!query) {
        showWarningMessage('Por favor ingresa un término de búsqueda.');
        return;
    }

    clearResults();
    resultList.innerHTML = '<p>Buscando...</p>';

    try {
        const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
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

// Reproduce track: obtiene stream y actualiza UI
async function playTrack(track) {
    try {
        // Obtener URL de stream
        const streamRes = await fetch(`http://localhost:3000/stream/${track.id}`);
        if (!streamRes.ok) throw new Error('Error al obtener la URL de audio');
        const streamData = await streamRes.json();

        if (!streamData.audioUrl) {
            showWarningMessage('No se pudo obtener la URL de audio.');
            return;
        }

        // Configura y reproduce audio
        audioPlayer.src = streamData.audioUrl;
        audioPlayer.loop = true;  // <-- Activar loop para repetir canción
        await audioPlayer.play();

        currentTrack = track;

        // Actualiza info canción
        songTitleEl.textContent = track.title;
        artistNameEl.textContent = track.author;

        // Actualiza la miniatura en el div #youtube-player
        youtubePlayerDiv.innerHTML = `<img src="${track.thumbnail}" alt="${track.title}" style="width:100%; height:100%; object-fit: cover; border-radius: 10px;">`;

        // Cambia icono play/pause a pause
        const icon = playpauseButton.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';

        // Inicia actualizar barra progreso
        if (updateInterval) clearInterval(updateInterval);
        updateInterval = setInterval(updateProgress, 500);

    } catch (error) {
        console.error(error);
        showWarningMessage('Error al reproducir la canción.');
    }
}

// Maneja play/pause botón
playpauseButton.addEventListener('click', () => {
    if (!audioPlayer.src) {
        showWarningMessage('No hay canción cargada.');
        return;
    }

    if (audioPlayer.paused) {
        audioPlayer.play();
        const icon = playpauseButton.querySelector('i');
        if (icon) icon.className = 'fas fa-pause';
    } else {
        audioPlayer.pause();
        const icon = playpauseButton.querySelector('i');
        if (icon) icon.className = 'fas fa-play';
    }
});

// Mueve la barra de progreso (seek)
seekBar.addEventListener('input', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = seekBar.value;
    updateProgress();
});

// Botón next: salta 10 seg adelante
document.getElementById('next-button').addEventListener('click', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = Math.min(audioPlayer.currentTime + 10, audioPlayer.duration);
    updateProgress();
});

// Botón prev: salta 10 seg atrás
document.getElementById('prev-button').addEventListener('click', () => {
    if (!audioPlayer.duration) return;
    audioPlayer.currentTime = Math.max(audioPlayer.currentTime - 10, 0);
    updateProgress();
});

// Botón buscar
searchButton.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (!query) {
        showWarningMessage('Por favor ingresa un término de búsqueda.');
        return;
    }
    searchSongs(query);
});

// Buscar con Enter en input
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        searchButton.click();
    }
});

// Cuando termina la canción (aunque en loop no se dispara, lo dejamos para limpieza)
audioPlayer.addEventListener('ended', () => {
    // No limpiamos updateInterval para que la barra siga funcionando en loop
    const icon = playpauseButton.querySelector('i');
    if (icon) icon.className = 'fas fa-play';
    seekBar.value = 0;
    currentTimeEl.textContent = '0:00';
});

// Limpia intervalo cuando se pausa para optimizar recursos
audioPlayer.addEventListener('pause', () => {
    clearInterval(updateInterval);
    const icon = playpauseButton.querySelector('i');
    if (icon) icon.className = 'fas fa-play';
});

// Activa el intervalo de actualización cuando se reproduce o reanuda
audioPlayer.addEventListener('play', () => {
    if (updateInterval) clearInterval(updateInterval);
    updateInterval = setInterval(updateProgress, 500);
});

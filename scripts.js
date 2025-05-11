const homeSection = document.getElementById('home-section');
const searchSection = document.getElementById('search-section');
const playlistSection = document.getElementById('playlist-section');
const settingsSection = document.getElementById('settings-section');

const homeTab = document.getElementById('home-tab');
const searchTab = document.getElementById('search-tab');
const playlistTab = document.getElementById('playlist-tab');
const settingsTab = document.getElementById('settings-tab');

homeTab.addEventListener('click', () => showSection('home'));
searchTab.addEventListener('click', () => showSection('search'));
playlistTab.addEventListener('click', () => showSection('playlist'));
settingsTab.addEventListener('click', () => showSection('settings'));

function showSection(section) {
    homeSection.style.display = 'none';
    searchSection.style.display = 'none';
    playlistSection.style.display = 'none';
    settingsSection.style.display = 'none';

    homeTab.classList.remove('active');
    searchTab.classList.remove('active');
    playlistTab.classList.remove('active');
    settingsTab.classList.remove('active');

    if (section === 'home') {
        homeSection.style.display = 'block';
        homeTab.classList.add('active');
    } else if (section === 'search') {
        searchSection.style.display = 'block';
        searchTab.classList.add('active');
    } else if (section === 'playlist') {
        playlistSection.style.display = 'block';
        playlistTab.classList.add('active');
    } else if (section === 'settings') {
        settingsSection.style.display = 'block';
        settingsTab.classList.add('active');
    }
}

// Muestra la sección de inicio al cargar la página
showSection('home');
let player; // Variable global para el reproductor de YouTube
let isPlaying = false;
let updateInterval; // Variable para el intervalo de actualización
let currentSongIndex = -1; // Índice de la canción actual (-1 indica que no hay canción seleccionada)
let songList = [];  // Lista de canciones seleccionadas

// Función para inicializar el reproductor de YouTube
function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '240',
        width: '400',
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

// Función cuando el reproductor está listo
function onPlayerReady(event) {
    // Esperamos a que el usuario seleccione una canción
}

// Función para manejar el cambio de estado del reproductor
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING && !isPlaying) {
        isPlaying = true;
        startUpdatingProgress(); // Iniciar la actualización del progreso
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        isPlaying = false;
        clearInterval(updateInterval); // Detener la actualización del progreso

        // Si el video ha terminado, reiniciarlo para crear un bucle
        if (event.data === YT.PlayerState.ENDED) {
            player.seekTo(0); // Reiniciar el video al principio
            player.playVideo(); // Reproducir el video de nuevo
        }
    }
}

// Función para reproducir una canción
function playSong(videoId, videoTitle, channelTitle) {
    if (player && typeof player.loadVideoById === 'function') {
        player.loadVideoById(videoId);
        document.getElementById('song-title').textContent = videoTitle || 'Sin título';
        document.getElementById('artist-name').textContent = channelTitle || 'Desconocido';
        document.getElementById('seek-bar').value = 0;
        document.getElementById('current-time').textContent = '0:00';
        document.getElementById('duration').textContent = '0:00';
    } else {
        console.error("Error: El reproductor no está inicializado.");
    }
}

// Función para actualizar la barra de progreso y el tiempo
function updateProgress() {
    const currentTime = player.getCurrentTime();
    const duration = player.getDuration();
    if (!isNaN(duration)) {
        document.getElementById('seek-bar').max = duration;
        document.getElementById('seek-bar').value = currentTime;
        document.getElementById('current-time').textContent = formatTime(currentTime);
        document.getElementById('duration').textContent = formatTime(duration);
    }
}

// Función para formatear el tiempo en minutos y segundos
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Función para iniciar la actualización del progreso
function startUpdatingProgress() {
    clearInterval(updateInterval);
    updateInterval = setInterval(updateProgress, 1000);
}

// Función que maneja el clic en una canción de los resultados
function handleSongSelection(video) {
    songList.push(video);  // Añadir la canción a la lista de reproducción
    currentSongIndex = songList.length - 1; // Actualizar el índice actual
    playSong(video.id.videoId, video.snippet.title, video.snippet.channelTitle);
}

// Función para formatear la duración de ISO 8601 a mm:ss
function formatDuration(duration) {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = match[1] ? parseInt(match[1], 10) : 0;
    const seconds = match[2] ? parseInt(match[2], 10) : 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// APIs
const apiKeys = [
    'AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE',
    'AIzaSyC22-T1cksl3HOXLVPi1JD-AeSGLOpqFSo',
    'AIzaSyDqXyMRGBGRDnZBXfiCPpkfdV6tNeiVqJE'
];

// Variable para controlar la API actual
let currentApiIndex = 0;

// Función para obtener la API actual
function getCurrentApiKey() {
    return apiKeys[currentApiIndex];
}

// Cambiar la API después de 5 horas
setInterval(() => {
    currentApiIndex = (currentApiIndex + 1) % apiKeys.length;
}, 5 * 60 * 60 * 1000);  // 5 horas en milisegundos

// Función para mostrar los resultados de búsqueda
async function displaySearchResults(videos) {
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = ''; // Limpiar la lista de resultados anteriores

    // Obtener las IDs de los videos
    const videoIds = videos.map(video => video.id.videoId).join(',');

    // Llamar a la API de YouTube para obtener la duración de los videos
    const apiKey = getCurrentApiKey();  // Usar la API actual
    const videoDetailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`);
    const videoDetails = await videoDetailsResponse.json();

    // Mapear los videos con sus detalles
    videos.forEach((video, index) => {
        const listItem = document.createElement('li');

        // Crear contenedor para la miniatura
        const thumbnailContainer = document.createElement('div');
        thumbnailContainer.classList.add('thumbnail');
        const thumbnailImage = document.createElement('img');
        thumbnailImage.src = video.snippet.thumbnails.default.url; // URL de la miniatura
        thumbnailImage.alt = video.snippet.title;
        thumbnailContainer.appendChild(thumbnailImage);

        // Crear contenedor para los detalles del video
        const detailsContainer = document.createElement('div');
        detailsContainer.classList.add('result-details');

        // Título del video
        const titleElement = document.createElement('h3');
        titleElement.classList.add('result-title');
        titleElement.textContent = video.snippet.title;

        // Nombre del artista
        const artistElement = document.createElement('p');
        artistElement.classList.add('result-artist');
        artistElement.textContent = `Artista: ${video.snippet.channelTitle}`;

        // Duración del video
        const duration = videoDetails.items[index]?.contentDetails?.duration || 'Desconocida';
        const formattedDuration = duration !== 'Desconocida' ? formatDuration(duration) : 'Desconocida';

        const durationElement = document.createElement('p');
        durationElement.classList.add('result-duration');
        durationElement.textContent = `Duración: ${formattedDuration}`;

        // Añadir los elementos al contenedor de detalles
        detailsContainer.appendChild(titleElement);
        detailsContainer.appendChild(artistElement);
        detailsContainer.appendChild(durationElement);

        // Añadir miniatura y detalles al elemento de la lista
        listItem.appendChild(thumbnailContainer);
        listItem.appendChild(detailsContainer);

        // Evento al hacer clic en el resultado
        listItem.onclick = () => {
            handleSongSelection(video);
        };

        // Añadir el elemento a la lista
        resultList.appendChild(listItem);
    });
}

// Función de búsqueda usando la API de YouTube
function searchSongs(query) {
    const apiKey = getCurrentApiKey();  // Usar la API actual
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items.length === 0) {
                showError('No se encontraron resultados para tu búsqueda.');
            } else {
                displaySearchResults(data.items);
            }
        })
        .catch(error => {
            console.error('Error al buscar canciones:', error);
            showError('Ocurrió un error al buscar canciones (error 62).');
        });
}

// Evento para adelantar el video 10 segundos
document.getElementById('next-button').addEventListener('click', function() {
    if (player) {
        const currentTime = player.getCurrentTime();
        player.seekTo(currentTime + 10, true); // Adelanta 10 segundos
    }
});

// Evento para retroceder el video 10 segundos
document.getElementById('prev-button').addEventListener('click', function() {
    if (player) {
        const currentTime = player.getCurrentTime();
        player.seekTo(currentTime - 10, true); // Retrocede 10 segundos
    }
});


// Evento de búsqueda al hacer clic en el botón
document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value.trim();

    if (query === "") {
        // Si no se ha ingresado texto, mostrar la advertencia
        showWarningMessage('Primero ingresa un termino de busqueda');
    } else {
        // Si hay texto, realizar la búsqueda
        searchSongs(query);
    }
});

// Función para mostrar el mensaje de advertencia con sonido
function showWarningMessage(message) {
    const warningSound = document.getElementById('warning-sound');
    warningSound.play(); // Reproduce el sonido de advertencia

    

    const warningMessageElement = document.getElementById('warning-message');

 // HTML para el ícono de advertencia cuadrado con el símbolo ⚠ en el centro
 const iconHTML = `
 <span style="
     display: inline-flex; 
     align-items: center; 
     justify-content: center; 
     width: 30px; 
     height: 0px; 
     border-radius: 20px; 
     margin-right: 10px;">
     <span style="
         color: yellow; 
         font-size: 18px; 
         font-weight: bold;">
         ⚠️
     </span>
 </span>`;

    const messageHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Actualizar el contenido del mensaje de advertencia con el texto centrado
    warningMessageElement.innerHTML = `
        <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: 100%;">
            ${iconHTML}${messageHTML}
        </div>`;

        warningMessageElement.style.display = 'block';


// Ocultar el mensaje después de 5 segundos
setTimeout(() => {
    warningMessageElement.style.display = 'none';
}, 5000);
}



// Evento para pausar o reproducir el video
document.getElementById('playpause-button').addEventListener('click', function() {
    if (player && typeof player.getPlayerState === 'function') {
        const playerState = player.getPlayerState();

        // Si no hay canción agregada (estado -1 es cuando no hay video cargado)
        if (playerState === -1) {
            showWarningMessage('No hay ninguna canción agregada');
        } else if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } else {
        // Si el reproductor no está inicializado, mostrar el error
        showWarningMessage('No hay ninguna canción agregada');
    }
});

// Función para mostrar el mensaje de error con sonido
function showError(message) {
    const errorSound = document.getElementById('error-sound');
    const errorMessageElement = document.getElementById('error-message');

    // Reproducir el sonido de error
    errorSound.play();

    // HTML para el ícono de error ❌
    const iconHTML = `
        <span style="
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 30px; 
            height: 30px;
            border-radius: 20px; 
            margin-right: 10px;">
            <span style="color: white; font-size: 18px; font-weight: bold;">
                ❌
            </span>
        </span>`;

    const mensajeHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Insertar contenido
    errorMessageElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
            ${iconHTML}${mensajeHTML}
        </div>`;

    // Reiniciar animación (técnica de reflow)
    errorMessageElement.style.animation = 'none';
    void errorMessageElement.offsetWidth; // Fuerza el reflow
    errorMessageElement.style.animation = 'slideErrorDown 0.4s ease forwards, slideErrorUp 0.4s ease 4s forwards';
}


    // Ocultar el mensaje después de 5 segundos con animación de salida
    setTimeout(() => {
        errorMessageElement.style.animation = 'slideOutToLeft 0.3s forwards';
    }, 5000);  
 


window.onload = function() {
    const message = document.getElementById('welcomeMessage');
    const sound = document.getElementById('welcomeSound');
    
    // Mostrar el mensaje de bienvenida
    message.style.display = 'block';
    
    // Reproducir el sonido cuando aparece el mensaje
    sound.play().catch(error => {
        console.error("No se pudo reproducir el sonido automáticamente:", error);
    });
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(function() {
        message.style.display = 'none';
    }, 5000);
};

// Función para adelantar el video cuando se mueve la barra de progreso
document.getElementById('seek-bar').addEventListener('input', function() {
    const seekTo = parseFloat(this.value);
    player.seekTo(seekTo, true); // Adelantar el video al tiempo seleccionado
});


// Función para cargar configuraciones al abrir la app
function loadSettings() {
    // Recuperar configuraciones de localStorage
    const pauseOnLock = localStorage.getItem('pauseOnLock') === 'true'; // Convertir a booleano
    const dataSavingMode = localStorage.getItem('dataSavingMode') === 'true'; // Convertir a booleano

    // Aplicar configuraciones a los checkboxes
    document.getElementById('pause-on-lock').checked = pauseOnLock;
    document.getElementById('data-saving-mode').checked = dataSavingMode;
}

// Función para guardar configuraciones cuando cambien
function saveSettings() {
    // Obtener el estado de los checkboxes
    const pauseOnLock = document.getElementById('pause-on-lock').checked;
    const dataSavingMode = document.getElementById('data-saving-mode').checked;

    // Guardar los estados en localStorage
    localStorage.setItem('pauseOnLock', pauseOnLock);
    localStorage.setItem('dataSavingMode', dataSavingMode);
}

// Añadir eventos a los checkboxes para guardar configuraciones al cambiar
document.getElementById('pause-on-lock').addEventListener('change', saveSettings);
document.getElementById('data-saving-mode').addEventListener('change', saveSettings);

// Cargar configuraciones al inicio
document.addEventListener('DOMContentLoaded', loadSettings);
// Función para reproducir el sonido de advertencia
function playWarningSound() {
    const audio = new Audio('sounds/warning.mp3'); // Ruta al archivo de sonido
    audio.play().catch(error => console.error('Error al reproducir el sonido:', error));
}

document.getElementById('show-advantages').addEventListener('click', function() {
    const menu = document.getElementById('advantages-menu');
    menu.classList.toggle('show');
});

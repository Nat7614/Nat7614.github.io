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

// Función para mostrar el mensaje de advertencia
function showWarningMessage(message) {
    const warningMessageElement = document.getElementById('warning-message');

    // HTML para el ícono de advertencia cuadrado con el símbolo ⚠ en el centro
    const iconHTML = `
        <span style="
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 30px; 
            height: 30px; 
            background-color: white; 
            border-radius: 4px; 
            margin-right: 10px;">
            <span style="
                color: yellow; 
                font-size: 18px; 
                font-weight: bold;">
                ⚠
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
                showWarningMessage('No se encontraron resultados para tu búsqueda.');
            } else {
                displaySearchResults(data.items);
            }
        })
        .catch(error => {
            console.error('Error al buscar canciones:', error);
            showWarningMessage('Ocurrió un error al buscar canciones.');
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
        showWarningMessage('Primero Ingresa Un Termino De Busqueda');
    } else {
        // Si hay texto, realizar la búsqueda
        searchSongs(query);
    }
});

// Función para mostrar el mensaje de error
function showError(message) {
    const errorMessageElement = document.getElementById('error-message');

    // HTML para el ícono de error cuadrado con una "X" en el centro
    const iconHTML = `
        <span style="
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 30px; 
            height: 30px; 
            background-color: white; 
            border-radius: 4px; 
            margin-right: 10px;">
            <span style="
                color: red; 
                font-size: 18px; 
                font-weight: bold;">
                ❌
            </span>
        </span>`;

    const mensajeHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Actualizar el contenido del mensaje de error con el texto centrado
    errorMessageElement.innerHTML = `
        <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: 100%;">
            ${iconHTML}${message}
        </div>`;
    errorMessageElement.style.display = 'block';

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}

// Evento para pausar o reproducir el video
document.getElementById('playpause-button').addEventListener('click', function() {
    if (player && typeof player.getPlayerState === 'function') {
        const playerState = player.getPlayerState();

        // Si no hay canción agregada (estado -1 es cuando no hay video cargado)
        if (playerState === -1) {
            showError('No Hay Ninguna Canción Agregada');
        } else if (playerState === YT.PlayerState.PLAYING) {
            player.pauseVideo();
        } else {
            player.playVideo();
        }
    } else {
        // Si el reproductor no está inicializado, mostrar el error
        showError('No Hay Ninguna Canción Agregada');
    }
});
// Manejo de la opción de pausar música al apagar el dispositivo
const pauseOnLockCheckbox = document.getElementById('pause-on-lock');
pauseOnLockCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Aquí activamos la opción para pausar la música cuando la pantalla se apaga
        alert("La música se reproducirá cuando se apague la pantalla del dispositivo.");
    } else {
        // Desactivamos la pausa automática
        alert("La música se detendra cuando se apague la pantalla del dispositivo.");
    }
});



// Funcionalidad para ahorro de datos (reducir la calidad del video en YouTube)
const dataSavingModeCheckbox = document.getElementById('data-saving-mode');
dataSavingModeCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Reducir la calidad del video de YouTube
        alert("Ahorro de datos activado: La calidad del video se reducirá para ahorrar datos.");
        // Aquí se implementaría la lógica para ajustar el reproductor de YouTube a baja calidad.
        // Por ejemplo, se podría cambiar la calidad a 144p o 240p si el reproductor soporta la API de calidad.
        setYouTubePlayerQuality('small'); // Ejemplo para cambiar calidad (240p)
    } else {
        // Reproducir en calidad normal
        alert("Ahorro de datos desactivado: La calidad del video volverá a la normal.");
        setYouTubePlayerQuality('default'); // Cambiar la calidad a la predeterminada
    }
});

// Función ficticia para establecer la calidad del reproductor de YouTube
function setYouTubePlayerQuality(quality) {
    // Suponiendo que hay un reproductor de YouTube controlado por la API de YouTube
    // player.setPlaybackQuality(quality);
}
// Función para mostrar el mensaje de error con sonido
function showError(message) {
    const errorSound = document.getElementById('error-sound');
    errorSound.play(); // Reproduce el sonido de error

    const errorMessageElement = document.getElementById('error-message');

    // HTML para el ícono de error cuadrado con una "X" en el centro
    const iconHTML = `
        <span style="
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 30px; 
            height: 30px;
            border-radius: 4px; 
            margin-right: 10px;">
            <span style="
                color: red; 
                font-size: 18px; 
                font-weight: bold;">
                ❌
            </span>
        </span>`;

    const mensajeHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Actualizar el contenido del mensaje de error con el texto centrado
    errorMessageElement.innerHTML = `
        <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: 100%;">
            ${iconHTML}${mensajeHTML}
        </div>`;
    errorMessageElement.style.display = 'block';

    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => {
        errorMessageElement.style.display = 'none';
    }, 5000);
}
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
            border-radius: 4px; 
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
// script.js

let audio = null;  // Variable para almacenar el audio actual
let currentSongElement = null;  // Elemento de la canción que está en reproducción
let currentSongURL = null;  // URL del archivo de audio actual
let songListData = [];  // Array para almacenar las canciones añadidas

// Genera un ID único para cada canción basado en el nombre y tamaño del archivo
function generateSongID(file) {
    return `${file.name}-${file.size}`;
}

// Maneja la selección del archivo de audio
function handleFileSelect(event) {
    const file = event.target.files[0];
    
    if (file) {
        const songID = generateSongID(file);
        addSongToList(songID, file.name, URL.createObjectURL(file));
    }
}

// Añade la canción a la lista de reproducción
function addSongToList(id, name, fileURL) {
    const songList = document.getElementById('song-list');
    document.getElementById('no-songs').style.display = 'none';

    // Verificar si la canción ya está en la lista
    if (songListData.some(song => song.id === id)) {
        return; // Si ya existe, no la añadimos de nuevo
    }

    // Agregar la canción al array de datos
    songListData.push({ id, name, fileURL });

    const songItem = document.createElement('li');
    songItem.className = 'song-item';
    songItem.dataset.songId = id;  // Asignamos el ID único al elemento

    const title = document.createElement('span');
    title.className = 'song-title';
    title.innerText = name;
    songItem.appendChild(title);

    const playButton = document.createElement('button');
    playButton.className = 'play-button';
    playButton.innerHTML = '<i class="fa fa-play"></i>';  // Icono de reproducir
    playButton.addEventListener('click', () => playPauseSong(fileURL, songItem, playButton));
    songItem.appendChild(playButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.innerHTML = '<i class="fa fa-trash"></i>';  // Icono de eliminar
    deleteButton.addEventListener('click', () => deleteSong(songItem, id));
    songItem.appendChild(deleteButton);

    songList.appendChild(songItem);
}

// Reproduce o pausa la canción seleccionada
function playPauseSong(fileURL, songItem, playButton) {
    // Pausa la canción actual si se está reproduciendo
    if (audio && currentSongElement === songItem) {
        if (audio.paused) {
            audio.play();
            playButton.innerHTML = '<i class="fa fa-pause"></i>';  // Cambia a icono de pausa
        } else {
            audio.pause();
            playButton.innerHTML = '<i class="fa fa-play"></i>';  // Cambia a icono de reproducir
        }
    } else {
        // Detiene la canción actual si es una diferente
        if (audio) {
            audio.pause();
            currentSongElement.querySelector('.play-button').innerHTML = '<i class="fa fa-play"></i>';
        }

        // Carga y reproduce la nueva canción
        audio = new Audio(fileURL);
        audio.loop = true;  // Configura el audio para reproducirse en bucle
        audio.play();
        playButton.innerHTML = '<i class="fa fa-pause"></i>';  // Cambia a icono de pausa
        currentSongElement = songItem;
        currentSongURL = fileURL;

        // Configura el botón para volver a reproducir en bucle al terminar
        audio.onended = () => {
            audio.play();
        };
    }
}

// Elimina una canción de la lista
function deleteSong(songItem, songID) {
    const songList = document.getElementById('song-list');
    songList.removeChild(songItem);

    // Quitar la canción del array de datos
    songListData = songListData.filter(song => song.id !== songID);

    if (songList.children.length === 0) {
        document.getElementById('no-songs').style.display = 'block';
    }

    // Detiene la canción actual si se está eliminando
    if (currentSongElement === songItem) {
        audio.pause();
        audio = null;
        currentSongElement = null;
        currentSongURL = null;
    }
}
// Alternar menú de opciones
document.getElementById("toggle-button").addEventListener("click", function () {
    const options = document.getElementById("event-options");
    options.classList.toggle("hidden");
    this.classList.toggle("active"); // Rotar flecha
});

// Cambiar entre eventos
document.querySelectorAll(".event-option").forEach(button => {
    button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        document.getElementById("spottrack-events").classList.toggle("hidden", type !== "spottrack");
        document.getElementById("artist-events").classList.toggle("hidden", type !== "artist");
        document.getElementById("event-options").classList.add("hidden");
    });
});

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

// Función para mostrar el mensaje de advertencia
function showNoConnectionWarning() {
    const warningMessage = document.getElementById('no-connection-warning');
    warningMessage.innerHTML = `
        <span>
            <span>⚠️</span>
        </span>
        <strong>No hay conexión a Internet</strong>
    `;
    warningMessage.style.display = 'flex';

    // Reproducir el sonido de advertencia
    playWarningSound();

    // Ocultar el mensaje automáticamente después de 5 segundos
    setTimeout(() => {
        warningMessage.style.display = 'none';
    }, 5000);
}

// Detectar cambios en la conexión de red
window.addEventListener('offline', showNoConnectionWarning);


document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".news-carousel img");
    const carousel = document.querySelector(".news-carousel");
    let currentIndex = 0;

    // Función para mostrar la siguiente imagen
    const showNextImage = () => {
        images[currentIndex].classList.remove("active"); // Quitar clase activa de la imagen actual
        currentIndex = (currentIndex + 1) % images.length; // Pasar al siguiente índice
        images[currentIndex].classList.add("active"); // Agregar clase activa a la nueva imagen
    };

    // Cambiar imágenes automáticamente cada 10 segundos
    setInterval(showNextImage, 10000);

    // Cambiar a la siguiente imagen al hacer clic en el cuadro
    carousel.addEventListener("click", showNextImage);
});

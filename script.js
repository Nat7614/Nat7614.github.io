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

// Función para mostrar el mensaje de advertencia con un nuevo ícono
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

// Función para mostrar los resultados de búsqueda
function displaySearchResults(videos) {
    const resultList = document.getElementById('result-list');
    resultList.innerHTML = ''; // Limpiar la lista de resultados anteriores

    videos.forEach(video => {
        const listItem = document.createElement('li');
        listItem.textContent = video.snippet.title;
        listItem.onclick = () => {
            handleSongSelection(video);
        };
        resultList.appendChild(listItem);
    });
}

// Función de búsqueda usando la API de YouTube
function searchSongs(query) {
    const apiKey = 'AIzaSyABClQa94HWAt0QlrXcFnrMHqsJ-axBN9E';  // Asegúrate de mantener tu API Key segura
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

// Evento para pausar o reproducir el video
document.getElementById('playpause-button').addEventListener('click', function() {
    if (player.getPlayerState() === YT.PlayerState.PLAYING) {
        player.pauseVideo();
    } else {
        player.playVideo();
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
                X
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
        alert("La música se pausará cuando se apague el dispositivo.");
    } else {
        // Desactivamos la pausa automática
        alert("La música seguirá reproduciéndose incluso si apagas el dispositivo.");
    }
});

// Funcionalidad para cambiar la foto de perfil
const profilePicture = document.getElementById('profile-picture');
const profilePictureInput = document.getElementById('profile-picture-input');
const uploadPictureBtn = document.getElementById('upload-picture-btn');

uploadPictureBtn.addEventListener('click', function() {
    profilePictureInput.click(); // Abrir el administrador de archivos
});

profilePictureInput.addEventListener('change', function() {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            profilePicture.src = e.target.result; // Cambiar la imagen de perfil
            localStorage.setItem('profilePicture', e.target.result); // Guardar la imagen en localStorage
        }
        reader.readAsDataURL(file);
    }
});

// Cargar la imagen de perfil desde localStorage
window.addEventListener('load', function() {
    const savedProfilePicture = localStorage.getItem('profilePicture');
    if (savedProfilePicture) {
        profilePicture.src = savedProfilePicture;
    }
});

// Funcionalidad para cambiar el nombre de usuario
const profileNameDisplay = document.getElementById('profile-name-display');
const profileNameInput = document.getElementById('profile-name-input');
const changeNameBtn = document.getElementById('change-name-btn');

changeNameBtn.addEventListener('click', function() {
    profileNameDisplay.classList.add('hidden'); // Ocultar el nombre actual
    profileNameInput.classList.remove('hidden'); // Mostrar el input para cambiar el nombre
    profileNameInput.value = profileNameDisplay.textContent;
    profileNameInput.focus();
});

profileNameInput.addEventListener('blur', function() {
    const newName = profileNameInput.value.trim();
    if (newName) {
        profileNameDisplay.textContent = newName; // Cambiar el nombre mostrado
        localStorage.setItem('profileName', newName); // Guardar el nombre en localStorage
    }
    profileNameInput.classList.add('hidden'); // Ocultar el input
    profileNameDisplay.classList.remove('hidden'); // Mostrar el nombre actualizado
});

// Cargar el nombre de usuario desde localStorage
window.addEventListener('load', function() {
    const savedProfileName = localStorage.getItem('profileName');
    if (savedProfileName) {
        profileNameDisplay.textContent = savedProfileName;
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
            background-color: white; 
            border-radius: 4px; 
            margin-right: 10px;">
            <span style="
                color: red; 
                font-size: 18px; 
                font-weight: bold;">
                X
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

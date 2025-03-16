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

    // Limitar el título a 15 caracteres y agregar "..." si es necesario
    const truncatedName = name.length > 15 ? name.substring(0, 15) + "..." : name;
    title.innerText = truncatedName;

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

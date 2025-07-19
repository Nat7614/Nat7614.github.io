// library-music.js

// IndexedDB setup
const DB_NAME = "SpottrackMusicDB";
const DB_VERSION = 1;
const STORE_NAME = "songs";

let db;
let audio = null;
let currentSongElement = null;
let currentSongURL = null;
let songListData = [];

const mp3IconPath = "images/mp3-icon.png";  // ruta al icono para mp3/mp4 thumbnails

// Abre o crea la base de datos
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject("Error abriendo IndexedDB");
    req.onsuccess = () => {
      db = req.result;
      resolve(db);
    };
    req.onupgradeneeded = e => {
      db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

// Guardar canción en IndexedDB
function saveSongToDB(song) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(song);
    req.onsuccess = () => resolve();
    req.onerror = () => reject("Error guardando canción");
  });
}

// Borrar canción de IndexedDB
function deleteSongFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject("Error eliminando canción");
  });
}

// Cargar todas las canciones
function loadSongsFromDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Error cargando canciones");
  });
}

// ID único basado en nombre + tamaño
function generateSongID(file) {
  return `${file.name}-${file.size}`;
}

// Maneja selección de archivo
async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  await openDB();

  const id = generateSongID(file);
  if (songListData.some(s => s.id === id)) return;

  const song = { id, name: file.name, file, type: file.type };
  await saveSongToDB(song);
  songListData.push(song);
  renderSongItem(song);
  document.getElementById('no-songs').style.display = 'none';
}

// Renderiza un item en la lista
function renderSongItem(song) {
  const list = document.getElementById('song-list');
  const li = document.createElement('li');
  li.className = 'song-item';
  li.dataset.songId = song.id;

  // Thumbnail
  const thumb = document.createElement('img');
  thumb.className = 'song-thumb';
  thumb.src = mp3IconPath;
  thumb.width = 40; thumb.height = 40;
  thumb.style.objectFit = 'cover';
  thumb.style.borderRadius = '6px';
  thumb.style.marginRight = '10px';
  li.appendChild(thumb);

  // Title
  const title = document.createElement('span');
  title.className = 'song-title';
  const name = song.name;
  title.innerText = name.length > 20 ? name.substring(0,20) + "..." : name;
  li.appendChild(title);

  // Play button
  const playBtn = document.createElement('button');
  playBtn.className = 'play-button';
  playBtn.innerHTML = '<i class="fa fa-play"></i>';
  playBtn.addEventListener('click', () => playPauseSong(song, li, playBtn));
  li.appendChild(playBtn);

  // Delete button
  const delBtn = document.createElement('button');
  delBtn.className = 'delete-button';
  delBtn.innerHTML = '<i class="fa fa-trash"></i>';
  delBtn.addEventListener('click', () => deleteSong(li, song.id));
  li.appendChild(delBtn);

  list.appendChild(li);
}

// Play / Pause logic
function playPauseSong(song, li, btn) {
  if (audio && currentSongElement === li) {
    if (audio.paused) {
      audio.play();
      btn.innerHTML = '<i class="fa fa-pause"></i>';
    } else {
      audio.pause();
      btn.innerHTML = '<i class="fa fa-play"></i>';
    }
    return;
  }
  // Stop previous
  if (audio) {
    audio.pause();
    currentSongElement.querySelector('.play-button').innerHTML = '<i class="fa fa-play"></i>';
  }
  // Start new
  audio = new Audio(URL.createObjectURL(song.file));
  audio.loop = true;
  audio.play();
  btn.innerHTML = '<i class="fa fa-pause"></i>';
  currentSongElement = li;
  audio.onended = () => audio.play();
}

// Eliminar canción
async function deleteSong(li, id) {
  li.remove();
  songListData = songListData.filter(s => s.id !== id);
  await deleteSongFromDB(id);
  if (!document.getElementById('song-list').children.length) {
    document.getElementById('no-songs').style.display = 'block';
  }
  if (currentSongElement === li) {
    audio.pause();
    audio = null;
    currentSongElement = null;
  }
}

// Al cargar la página, inicializa lista
window.onload = async () => {
  await openDB();
  songListData = await loadSongsFromDB();
  if (!songListData.length) {
    document.getElementById('no-songs').style.display = 'block';
  } else {
    document.getElementById('no-songs').style.display = 'none';
    songListData.forEach(renderSongItem);
  }
  document.getElementById('file-input').addEventListener('change', handleFileSelect);
};

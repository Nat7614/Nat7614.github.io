// library-music.js

const DB_NAME = "SpottrackMusicDB";
const DB_VERSION = 1;
const STORE_NAME = "songs";

let db;
let audio = null;
let currentSongElement = null;
let currentSongURL = null;
let songListData = [];

const mp3IconPath = "images/mp3-icon.png";

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

function saveSongToDB(song) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(song);
    req.onsuccess = () => resolve();
    req.onerror = () => reject("Error guardando canción");
  });
}

function deleteSongFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject("Error eliminando canción");
  });
}

function loadSongsFromDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Error cargando canciones");
  });
}

function generateSongID(file) {
  return `${file.name}-${file.size}`;
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  await openDB();

  const id = generateSongID(file);
  if (songListData.some(s => s.id === id)) return;

  const arrayBuffer = await file.arrayBuffer(); // Convierte el archivo

  const song = {
    id,
    name: file.name,
    type: file.type,
    buffer: arrayBuffer,
  };

  await saveSongToDB(song);
  songListData.push(song);
  renderSongItem(song);
  document.getElementById('no-songs').style.display = 'none';
}

function renderSongItem(song) {
  const list = document.getElementById('song-list');
  const li = document.createElement('li');
  li.className = 'song-item';
  li.dataset.songId = song.id;

  const thumb = document.createElement('img');
  thumb.className = 'song-thumb';
  thumb.src = mp3IconPath;
  thumb.width = 40;
  thumb.height = 40;
  thumb.style.objectFit = 'cover';
  thumb.style.borderRadius = '6px';
  thumb.style.marginRight = '10px';
  li.appendChild(thumb);

  const title = document.createElement('span');
  title.className = 'song-title';
  const name = song.name;
  title.innerText = name.length > 20 ? name.substring(0, 20) + "..." : name;
  li.appendChild(title);

  const playBtn = document.createElement('button');
  playBtn.className = 'play-button';
  playBtn.innerHTML = '<i class="fa fa-play"></i>';
  playBtn.addEventListener('click', () => playPauseSong(song, li, playBtn));
  li.appendChild(playBtn);

  const delBtn = document.createElement('button');
  delBtn.className = 'delete-button';
  delBtn.innerHTML = '<i class="fa fa-trash"></i>';
  delBtn.addEventListener('click', () => deleteSong(li, song.id));
  li.appendChild(delBtn);

  list.appendChild(li);
}

function playPauseSong(song, li, btn) {
  const blob = new Blob([song.buffer], { type: song.type });
  const url = URL.createObjectURL(blob);

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

  if (audio) {
    audio.pause();
    if (currentSongElement) {
      currentSongElement.querySelector('.play-button').innerHTML = '<i class="fa fa-play"></i>';
    }
  }

  audio = new Audio(url);
  audio.loop = true;
  audio.play();
  btn.innerHTML = '<i class="fa fa-pause"></i>';
  currentSongElement = li;
  audio.onended = () => audio.play();
}

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

window.onload = async () => {
  await openDB();
  const songs = await loadSongsFromDB();
  songListData = songs;

  if (!songs.length) {
    document.getElementById('no-songs').style.display = 'block';
  } else {
    document.getElementById('no-songs').style.display = 'none';
    songs.forEach(song => {
      if (!(song.buffer instanceof ArrayBuffer)) {
        song.buffer = new Uint8Array(song.buffer).buffer;
      }
      renderSongItem(song);
    });
  }

  document.getElementById('file-input').addEventListener('change', handleFileSelect);
};

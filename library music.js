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
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject("Error al abrir IndexedDB");
    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      db = event.target.result;
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
    req.onerror = () => reject("Error al guardar la canción");
  });
}

function deleteSongFromDB(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject("Error al eliminar la canción");
  });
}

function loadSongsFromDB() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject("Error al cargar las canciones");
  });
}

function generateSongID(file) {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

async function handleFileSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  await openDB();

  const id = generateSongID(file);
  if (songListData.some(s => s.id === id)) return;

  const buffer = await file.arrayBuffer();

  const song = {
    id,
    name: file.name,
    type: file.type,
    buffer,
  };

  await saveSongToDB(song);
  songListData.push(song);
  renderSongItem(song);
  document.getElementById("no-songs").style.display = "none";
  event.target.value = ""; // Limpia el input
}

function renderSongItem(song) {
  const list = document.getElementById("song-list");
  const li = document.createElement("li");
  li.className = "song-item";
  li.dataset.songId = song.id;

  const thumb = document.createElement("img");
  thumb.className = "song-thumb";
  thumb.src = mp3IconPath;
  thumb.width = 40;
  thumb.height = 40;
  thumb.style.objectFit = "cover";
  thumb.style.borderRadius = "6px";
  thumb.style.marginRight = "10px";
  li.appendChild(thumb);

  const title = document.createElement("span");
  title.className = "song-title";
  const maxLen = 20;
  title.innerText = song.name.length > maxLen ? song.name.substring(0, maxLen) + "..." : song.name;
  li.appendChild(title);

  const playBtn = document.createElement("button");
  playBtn.className = "play-button";
  playBtn.innerHTML = '<i class="fa fa-play"></i>';
  playBtn.addEventListener("click", () => playPauseSong(song, li, playBtn));
  li.appendChild(playBtn);

  const delBtn = document.createElement("button");
  delBtn.className = "delete-button";
  delBtn.innerHTML = '<i class="fa fa-trash"></i>';
  delBtn.addEventListener("click", () => deleteSong(li, song.id));
  li.appendChild(delBtn);

  list.appendChild(li);
}

function playPauseSong(song, li, btn) {
  if (!(song.buffer instanceof ArrayBuffer)) {
    console.warn("Buffer inválido para la canción", song);
    return;
  }

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
      currentSongElement.querySelector(".play-button").innerHTML = '<i class="fa fa-play"></i>';
    }
    URL.revokeObjectURL(currentSongURL);
  }

  audio = new Audio(url);
  audio.loop = true;
  audio.play();
  currentSongElement = li;
  currentSongURL = url;
  btn.innerHTML = '<i class="fa fa-pause"></i>';

  audio.onended = () => {
    btn.innerHTML = '<i class="fa fa-play"></i>';
  };
}

async function deleteSong(li, id) {
  li.remove();
  songListData = songListData.filter(song => song.id !== id);
  await deleteSongFromDB(id);

  if (currentSongElement === li) {
    if (audio) audio.pause();
    audio = null;
    currentSongElement = null;
    if (currentSongURL) {
      URL.revokeObjectURL(currentSongURL);
      currentSongURL = null;
    }
  }

  if (!document.getElementById("song-list").children.length) {
    document.getElementById("no-songs").style.display = "block";
  }
}

window.onload = async () => {
  await openDB();
  const songs = await loadSongsFromDB();
  songListData = songs;

  if (!songs.length) {
    document.getElementById("no-songs").style.display = "block";
  } else {
    document.getElementById("no-songs").style.display = "none";
    songs.forEach(song => {
      // Corrige el buffer si es necesario
      if (!(song.buffer instanceof ArrayBuffer)) {
        song.buffer = new Uint8Array(song.buffer).buffer;
      }
      renderSongItem(song);
    });
  }

  document.getElementById("file-input").addEventListener("change", handleFileSelect);
};

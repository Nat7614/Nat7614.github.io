// playlist.js
import { db, auth } from './firebase.js';
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  arrayUnion
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js';
import {
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';

let currentUserId = null;

document.addEventListener("DOMContentLoaded", () => {
  const playlistGrid = document.getElementById('user-playlists');
  const fabButton = document.querySelector('.fab');

  // Escuchar cambios de sesión
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      if (fabButton) fabButton.disabled = false;
      loadPlaylists();
    } else {
      currentUserId = null;
      if (fabButton) fabButton.disabled = true;
      if (playlistGrid) playlistGrid.innerHTML = "<p>Inicia sesión para ver tus playlists.</p>";
    }
  });

  // Evento botón FAB para abrir modal
  if (fabButton) {
    fabButton.addEventListener("click", openCreatePlaylistModal);
  }
});

export async function createPlaylist() {
  const name = document.getElementById('playlist-name').value.trim();
  const desc = document.getElementById('playlist-desc').value.trim();
  if (!name || !currentUserId) return;

  const playlistData = {
    name,
    description: desc,
    songs: [],
    createdAt: new Date()
  };

  await addDoc(collection(db, "usuarios", currentUserId, "playlists"), playlistData);
  closeCreatePlaylistModal();
  loadPlaylists();
}

export async function loadPlaylists() {
  const playlistGrid = document.getElementById('user-playlists');
  if (!playlistGrid || !currentUserId) return;

  playlistGrid.innerHTML = "";
  const snapshot = await getDocs(collection(db, "users", currentUserId, "playlists"));
  snapshot.forEach(doc => {
    const pl = doc.data();
    const div = document.createElement("div");
    div.className = "playlist-card";
    div.innerHTML = `
      <h3>${pl.name}</h3>
      <p>${pl.desc || "Sin descripción"}</p>
      <button onclick="alert('Importar canciones a esta playlist próximamente')">Importar Canciones</button>
    `;
    playlistGrid.appendChild(div);
  });
}

export function openCreatePlaylistModal() {
  document.getElementById('create-playlist-modal')?.classList.remove('hidden');
}

export function closeCreatePlaylistModal() {
  document.getElementById('create-playlist-modal')?.classList.add('hidden');
  document.getElementById('playlist-name').value = '';
  document.getElementById('playlist-desc').value = '';
}

export function showSpotifyImportSteps() {
  document.getElementById('import-options')?.classList.add('hidden');
  document.getElementById('spotify-import-steps')?.classList.remove('hidden');
}

export async function handleCSVImport(event) {
  const file = event.target.files[0];
  if (!file || !currentUserId) return;

  const reader = new FileReader();
  reader.onload = async function (e) {
    const lines = e.target.result.split('\n');
    const songs = lines.slice(1).map(line => {
      const cols = line.split(',');
      return {
        title: cols[0]?.replace(/"/g, '') || '',
        artist: cols[1]?.replace(/"/g, '') || '',
      };
    }).filter(song => song.title && song.artist);

    // Guardar en la última playlist creada
    const playlistsRef = collection(db, "users", currentUserId, "playlists");
    const snapshot = await getDocs(playlistsRef);
    const latest = snapshot.docs[snapshot.docs.length - 1];
    if (latest) {
      await updateDoc(latest.ref, {
        songs: arrayUnion(...songs)
      });
    }

    alert("Playlist importada exitosamente.");
    document.getElementById('spotify-import-steps')?.classList.add('hidden');
    loadPlaylists();
  };
  reader.readAsText(file);
}

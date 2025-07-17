// recientes.js
import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js';

let currentUser = null;

// 1) Detectar usuario actual
onAuthStateChanged(auth, user => {
  currentUser = user;
  renderRecientes();
});

// 2) Función para renderizar la lista
async function renderRecientes() {
  const lista = document.querySelector('.recientes-lista');
  const apiKey = 'AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE';
  let recientes = [];

  // Obtener array según login
  if (currentUser) {
    const docRef = doc(db, "usuarios", currentUser.uid);
    const snap = await getDoc(docRef);
    if (snap.exists()) recientes = snap.data().recientes || [];
  } else {
    recientes = JSON.parse(localStorage.getItem('spottrack_recientes')) || [];
  }

  // Mostrar mensaje si no hay
  if (recientes.length === 0) {
    const mensaje = currentUser
      ? "Sin canciones"
      : "Sin canciones, recomendamos iniciar sesión para no perder los datos de esta sección.";
    lista.innerHTML = `<div style="
      display:flex;justify-content:center;align-items:center;
      height:100%;min-height:140px;color:white;opacity:0.6;
      text-align:center;font-size:16px;width:100%;
    ">${mensaje}</div>`;
    return;
  }

  // Rellenar lista
  lista.innerHTML = ''; // limpiar
  for (const { id } of recientes) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${apiKey}`
    );
    const data = await res.json();
    if (!data.items || !data.items[0]) continue;
    const video = data.items[0];
    const thumb = video.snippet.thumbnails.medium.url;
    const title = video.snippet.title;
    const channel = video.snippet.channelTitle;
    const duration = formatDuration(video.contentDetails.duration);

    const li = document.createElement('li');
    li.innerHTML = `
      <img src="${thumb}" alt="${title}">
      <div class="song-title"><span>${title}</span></div>
      <div class="song-meta">${channel}</div>
      <div class="song-meta">${duration}</div>
    `;
    li.addEventListener('click', () => {
      showSection('search');
      setTimeout(() => playSong(id, title, channel), 100);
    });
    lista.appendChild(li);
  }
}

// 3) Función de formateo
function formatDuration(iso) {
  const m = iso.match(/(\d+)M/)?.[1] || 0;
  const s = iso.match(/(\d+)S/)?.[1] || 0;
  return `${m}:${s.toString().padStart(2,'0')}`;
}

// 4) Observador para detectar nuevo video
const observer = new MutationObserver(muts => {
  const player = document.getElementById('youtube-player');
  const vid = player?.dataset.videoId;
  if (vid) agregarCancionReciente(vid);
});
observer.observe(document.body, { childList: true, subtree: true });

// 5) Añadir a recientes
async function agregarCancionReciente(videoId) {
  try {
    let recientes = [];

    if (currentUser) {
      const ref = doc(db, "usuarios", currentUser.uid);
      const snap = await getDoc(ref);
      recientes = snap.exists() ? snap.data().recientes || [] : [];
    } else {
      recientes = JSON.parse(localStorage.getItem('spottrack_recientes')) || [];
    }

    // Filtrar duplicados y cap a 5
    recientes = [{ id: videoId }, ...recientes.filter(c => c.id !== videoId)];
    if (recientes.length > 5) recientes = recientes.slice(0, 5);

    if (currentUser) {
      // Guardar en Firestore
      await updateDoc(doc(db, "usuarios", currentUser.uid), {
        recientes: recientes
      });
    } else {
      // Guardar en localStorage
      localStorage.setItem('spottrack_recientes', JSON.stringify(recientes));
    }

    // Volver a renderizar
    renderRecientes();
  } catch (e) {
    console.error("Error guardando recientes:", e);
  }
}

import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.querySelector(".recientes-lista");
  const auth = getAuth();

  const LOCAL_STORAGE_KEY = "recientesLocal";

  function saveToLocalRecientes(id) {
    let recientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    recientes = recientes.filter(i => i !== id);
    recientes.unshift(id);
    if (recientes.length > 5) recientes = recientes.slice(0, 5);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recientes));
  }

  function getLocalRecientes() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  }

  // Obtiene datos desde backend banked (metadatos y duración, thumbnail)
  async function fetchAndRender(id) {
    try {
      const res = await fetch(`http://localhost:3000/metadata/${id}`);
      if (!res.ok) throw new Error("Error al obtener metadata");
      const track = await res.json();

      if (!track || !track.id) return;

      renderSong({
        id: track.id,
        title: track.title,
        author: track.author,
        duration: formatDuration(track.duration), // duración en segundos
        thumbnail: track.thumbnail,
      });
    } catch (err) {
      console.error("Error obteniendo datos de canción:", err);
    }
  }

  onAuthStateChanged(auth, async (user) => {
    lista.innerHTML = "";
    const recientes = user
      ? (await getDoc(doc(db, "usuarios", user.uid))).data()?.recientes || []
      : getLocalRecientes();

    if (recientes.length === 0) {
      lista.innerHTML = mostrarMensajeSinCanciones();
      return;
    }

    for (const id of recientes) {
      await fetchAndRender(id);
    }
  });

  // Guarda en Firebase los recientes con el ID que manejes (id de banked)
  async function saveRecent(id) {
    const user = auth.currentUser;
    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userDocRef);
        let recientes = userSnap.exists() ? userSnap.data().recientes || [] : [];
        recientes = recientes.filter(i => i !== id);
        recientes.unshift(id);
        if (recientes.length > 5) recientes = recientes.slice(0, 5);
        await updateDoc(userDocRef, { recientes });
      } catch (err) {
        console.error("Error guardando recientes en Firestore:", err);
      }
    } else {
      saveToLocalRecientes(id);
    }
  }

  function renderSong({ id, title, author, duration, thumbnail }) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${thumbnail}" alt="${title}" />
      <div class="song-title"><span>${title}</span></div>
      <div class="song-meta">${author}</div>
      <div class="song-meta">${duration}</div>
    `;

    li.addEventListener("click", async () => {
      // Al hacer clic, reproducir en el reproductor local usando el backend
      // 1) Obtener URL audio desde backend banked
      try {
        const res = await fetch(`http://localhost:3000/stream/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener URL de audio");
        const data = await res.json();
        if (!data.audioUrl) throw new Error("AudioUrl no disponible");

        // Aquí se asume que playTrack es la función para reproducir canción
        playTrack({ 
          id, 
          title, 
          author, 
          thumbnail, 
          audioUrl: data.audioUrl, 
          duration: durationToSeconds(duration) 
        });
      } catch (e) {
        console.error(e);
        alert("Error al reproducir la canción");
      }
    });

    lista.appendChild(li);
  }

  // Convierte duración mm:ss o hh:mm:ss a segundos
  function durationToSeconds(duration) {
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  }

  // Formatea duración en segundos a mm:ss o hh:mm:ss
  function formatDuration(seconds) {
    if (!seconds) return "0:00";
    seconds = Math.floor(seconds);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`;
    }
    return `${m}:${s.toString().padStart(2,"0")}`;
  }

  function mostrarMensajeSinCanciones() {
    return `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100%;
        min-height: 140px;
        color: white;
        opacity: 0.6;
        text-align: center;
        font-size: 16px;
        width: 100%;
      ">
        Sin canciones, reproduce una bro! 👌
      </div>`;
  }

  // Ejemplo básico de playTrack para que quede claro:
  // Asegurate de adaptar o importar tu función real que usas para reproducir
  async function playTrack(track) {
    const audioPlayer = document.getElementById("audioPlayer");
    if (!audioPlayer) return;

    audioPlayer.src = track.audioUrl;
    audioPlayer.play();

    // Actualizar UI info (título, artista, miniatura)
    document.getElementById("song-title").textContent = track.title;
    document.getElementById("artist-name").textContent = track.author;
    document.getElementById("youtube-player").innerHTML = `<img src="${track.thumbnail}" style="width:100%;height:100%;object-fit:cover;border-radius:10px">`;

    // También actualizar duración y barra de progreso según tu lógica
    // ...
  }
});

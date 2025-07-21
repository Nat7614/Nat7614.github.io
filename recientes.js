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
  const apiKey = "AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE";
  const auth = getAuth();

  const LOCAL_STORAGE_KEY = "recientesLocal";

  function saveToLocalRecientes(videoId) {
    let recientes = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
    recientes = recientes.filter(id => id !== videoId); // Eliminar duplicados
    recientes.unshift(videoId);
    if (recientes.length > 5) {
      recientes = recientes.slice(0, 5);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recientes));
  }

  function getLocalRecientes() {
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
  }

  async function fetchAndRender(videoId) {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`);
      const data = await res.json();
      if (!data.items || data.items.length === 0) return;

      const video = data.items[0];
      const item = {
        videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        duration: formatDuration(video.contentDetails.duration),
        thumbnail: video.snippet.thumbnails.medium.url,
      };
      renderSong(item);
    } catch (err) {
      console.error("Error obteniendo datos de video:", err);
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

    for (const videoId of recientes) {
      await fetchAndRender(videoId);
    }
  });

  setInterval(async () => {
    const user = auth.currentUser;
    if (!window.player || typeof player.getVideoData !== "function") return;

    const videoId = player.getVideoData()?.video_id;
    if (!videoId) return;

    if (user) {
      try {
        const userDocRef = doc(db, "usuarios", user.uid);
        const userSnap = await getDoc(userDocRef);
        let recientes = userSnap.exists() ? userSnap.data().recientes || [] : [];
        recientes = recientes.filter((id) => id !== videoId);
        recientes.unshift(videoId);
        if (recientes.length > 5) {
          recientes = recientes.slice(0, 5);
        }
        await updateDoc(userDocRef, { recientes });
      } catch (err) {
        console.error("Error guardando recientes en Firestore:", err);
      }
    } else {
      saveToLocalRecientes(videoId);
    }
  }, 2000);

  function renderSong({ videoId, title, channel, duration, thumbnail }) {
    const li = document.createElement("li");
    li.innerHTML = `
      <img src="${thumbnail}" alt="${title}">
      <div class="song-title"><span>${title}</span></div>
      <div class="song-meta">${channel}</div>
      <div class="song-meta">${duration}</div>
    `;
    li.addEventListener("click", () => {
      showSection("search");
      setTimeout(() => {
        playSong(videoId, title, channel);
      }, 100);
    });
    lista.appendChild(li);
  }

  function formatDuration(iso) {
    const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    const h = parseInt(match[1]) || 0;
    const m = parseInt(match[2]) || 0;
    const s = parseInt(match[3]) || 0;
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
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
});

import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.querySelector(".recientes-lista");
  const section = document.querySelector(".recientes-section");
  const apiKey = "AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE";

  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      lista.innerHTML = `
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
          Inicia sesión para ver esta sección
        </div>`;
      return;
    }

    try {
      const userDoc = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userDoc);

      if (!userSnap.exists()) {
        lista.innerHTML = mostrarMensajeSinCanciones();
        return;
      }

      const recientes = userSnap.data()?.recientes || [];

      if (recientes.length === 0) {
        lista.innerHTML = mostrarMensajeSinCanciones();
        return;
      }

      lista.innerHTML = ""; // limpiar

      recientes.forEach((videoId) => {
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`)
          .then((res) => res.json())
          .then((data) => {
            if (!data.items || data.items.length === 0) return;

            const video = data.items[0];
            const thumbnail = video.snippet.thumbnails.medium.url;
            const title = video.snippet.title;
            const channel = video.snippet.channelTitle;
            const duration = formatDuration(video.contentDetails.duration);

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
          })
          .catch((err) => {
            console.error("Error al cargar canción reciente:", err);
          });
      });
    } catch (err) {
      console.error("Error cargando recientes:", err);
    }
  });

  // Guarda el video actual como escuchado recientemente
  setInterval(async () => {
    const user = auth.currentUser;
    if (!user || !window.player || typeof player.getVideoData !== "function") return;

    const videoData = player.getVideoData();
    const videoId = videoData?.video_id;
    if (!videoId) return;

    try {
      const userDocRef = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userDocRef);

      let recientes = userSnap.exists() ? userSnap.data().recientes || [] : [];

      // Si ya está, lo quitamos para moverlo al principio
      recientes = recientes.filter((id) => id !== videoId);
      recientes.unshift(videoId); // Agregar al inicio

      // Limitar a 5 canciones
      if (recientes.length > 5) {
        recientes = recientes.slice(0, 5);
      }

      await updateDoc(userDocRef, {
        recientes: recientes
      });
    } catch (err) {
      console.error("Error guardando recientes:", err);
    }
  }, 2000); // Guarda cada 2 segundos si cambia video

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
        Sin canciones
      </div>`;
  }
});

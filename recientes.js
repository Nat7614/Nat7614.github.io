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

// IndexedDB
const dbName = "spottrackCache";
const storeName = "recientes";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onerror = () => reject("Error abriendo IndexedDB");
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "videoId" });
      }
    };
  });
}

function saveToCache(data) {
  openDB().then((db) => {
    const tx = db.transaction(storeName, "readwrite");
    const store = tx.objectStore(storeName);
    store.put(data);
  });
}

function getAllFromCache() {
  return new Promise(async (resolve) => {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve([]);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const lista = document.querySelector(".recientes-lista");
  const apiKey = "AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE";
  const auth = getAuth();

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      mostrarOffline();
      return;
    }

    try {
      const userDoc = doc(db, "usuarios", user.uid);
      const userSnap = await getDoc(userDoc);
      const recientes = userSnap.data()?.recientes || [];

      if (recientes.length === 0) {
        mostrarOffline();
        return;
      }

      lista.innerHTML = "";

      for (const videoId of recientes) {
        const cached = await getFromCache(videoId);
        if (cached) {
          renderSong(cached);
        } else {
          fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`)
            .then((res) => res.json())
            .then((data) => {
              if (!data.items || data.items.length === 0) return;

              const video = data.items[0];
              const item = {
                videoId,
                title: video.snippet.title,
                channel: video.snippet.channelTitle,
                duration: formatDuration(video.contentDetails.duration),
                thumbnail: video.snippet.thumbnails.medium.url,
              };

              saveToCache(item);
              renderSong(item);
            });
        }
      }
    } catch (err) {
      console.error("Error:", err);
    }
  });

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
      recientes = recientes.filter((id) => id !== videoId);
      recientes.unshift(videoId);
      if (recientes.length > 5) {
        recientes = recientes.slice(0, 5);
      }

      await updateDoc(userDocRef, { recientes });
    } catch (err) {
      console.error("Error guardando recientes:", err);
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

  async function getFromCache(videoId) {
    const db = await openDB();
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    return new Promise((resolve) => {
      const req = store.get(videoId);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    });
  }

  function mostrarOffline() {
    getAllFromCache().then((cachedItems) => {
      if (cachedItems.length === 0) {
        lista.innerHTML = mostrarMensajeSinCanciones();
        return;
      }
      lista.innerHTML = "";
      cachedItems.forEach(renderSong);
    });
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

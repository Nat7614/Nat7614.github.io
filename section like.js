// likes.js
import { db } from "./firebase.js";
import {
  doc,
  getDoc,
  updateDoc,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

const likesContainer = document.querySelector(".likes-list");
const apiKey = "AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE";
const auth = getAuth();

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showEmpty();
    return;
  }

  try {
    const userDoc = doc(db, "usuarios", user.uid);
    const userSnap = await getDoc(userDoc);
    const likes = userSnap.data()?.likes || [];

    if (likes.length === 0) {
      showEmpty();
      return;
    }

    likesContainer.innerHTML = "";

    for (const videoId of likes) {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${apiKey}`
      );
      const data = await res.json();

      if (!data.items || data.items.length === 0) continue;

      const video = data.items[0];
      const item = {
        videoId,
        title: video.snippet.title,
        channel: video.snippet.channelTitle,
        duration: formatDuration(video.contentDetails.duration),
        thumbnail: video.snippet.thumbnails.medium.url,
      };

      renderLikeSong(item, user.uid);
    }
  } catch (err) {
    console.error("Error al cargar likes:", err);
  }
});

function renderLikeSong({ videoId, title, channel, duration, thumbnail }, uid) {
  const li = document.createElement("li");
  li.innerHTML = `
    <img src="${thumbnail}" alt="${title}">
    <div class="song-title">${title}</div>
    <div class="song-meta">${channel}</div>
    <div class="song-meta">${duration}</div>
    <button class="like-toggle liked" title="Quitar de Me gusta">
      <i class="fas fa-heart"></i>
    </button>
  `;

  li.querySelector(".like-toggle").addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      const ref = doc(db, "usuarios", uid);
      await updateDoc(ref, {
        likes: arrayRemove(videoId),
      });
      li.remove();
    } catch (err) {
      console.error("Error al quitar like:", err);
    }
  });

  li.addEventListener("click", () => {
    showSection("search");
    setTimeout(() => {
      playSong(videoId, title, channel);
    }, 100);
  });

  likesContainer.appendChild(li);
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

function showEmpty() {
  const likesContent = document.querySelector(".likes-content");
  if (!likesContent) return;

  likesContent.innerHTML = `
    <div style="
      display: flex;
      justify-content: center;
      align-items: center;
      height: 140px;
      color: white;
      opacity: 0.6;
      text-align: center;
      font-size: 15px;
      width: 100%;
    ">
      Aún no tienes canciones con me gusta 💔
    </div>`;
}

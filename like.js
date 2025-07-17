// like.js
import { db } from "./firebase.js"; // Importar Firestore desde firebase.js
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

const likeButton = document.getElementById("like-button");
let lastVideoId = null;
let currentUser = null;

// Detectar el estado del usuario
onAuthStateChanged(getAuth(), async (user) => {
  if (user) {
    currentUser = user;
  } else {
    currentUser = null;
    likeButton.disabled = true;
    likeButton.classList.remove("liked");
  }
});

// Revisión constante del video actual y estado del like
setInterval(async () => {
  if (!window.player || typeof player.getVideoData !== "function" || !currentUser) return;

  const videoData = player.getVideoData?.();
  const videoId = videoData?.video_id;

  if (!videoId) {
    likeButton.disabled = true;
    likeButton.classList.remove("liked");
    lastVideoId = null;
    return;
  }

  likeButton.disabled = false;

  if (videoId !== lastVideoId) {
    lastVideoId = videoId;

    try {
      const userDocRef = doc(db, "usuarios", currentUser.uid);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const userLikes = userSnap.data()?.likes || [];

        if (userLikes.includes(videoId)) {
          likeButton.classList.add("liked");
        } else {
          likeButton.classList.remove("liked");
        }
      }
    } catch (error) {
      console.error("Error obteniendo datos del usuario:", error);
    }
  }
}, 500);

// Evento para dar o quitar like
likeButton.addEventListener("click", async () => {
  if (!currentUser || likeButton.disabled || !player || typeof player.getVideoData !== "function") return;

  const videoData = player.getVideoData?.();
  const videoId = videoData?.video_id;
  if (!videoId) return;

  try {
    const userDocRef = doc(db, "usuarios", currentUser.uid);
    const userSnap = await getDoc(userDocRef);
    const currentLikes = userSnap.exists() ? userSnap.data()?.likes || [] : [];

    if (currentLikes.includes(videoId)) {
      await updateDoc(userDocRef, {
        likes: arrayRemove(videoId),
      });
      likeButton.classList.remove("liked");
    } else {
      await updateDoc(userDocRef, {
        likes: arrayUnion(videoId),
      });
      likeButton.classList.add("liked");
    }
  } catch (error) {
    console.error("Error actualizando likes:", error);
  }
});

// 💡 Detectar el botón
const likeButton = document.getElementById("like-button");

// ⚠️ Variable de control
let lastVideoId = null;

// 🔁 Verificar cada 500ms si hay un video cargado y actualizar botón
setInterval(() => {
    if (!window.player || typeof player.getVideoData !== 'function') return;

    const videoId = player.getVideoData().video_id;

    if (videoId) {
        likeButton.disabled = false;

        // Si cambió de video, actualizar estado del botón
        if (videoId !== lastVideoId) {
            lastVideoId = videoId;
            const likes = JSON.parse(localStorage.getItem("spottrack_likes") || "[]");
            if (likes.includes(videoId)) {
                likeButton.classList.add("liked");
            } else {
                likeButton.classList.remove("liked");
            }
        }
    } else {
        likeButton.disabled = true;
        likeButton.classList.remove("liked");
        lastVideoId = null;
    }
}, 500);

// ⭐ Evento al dar like
likeButton.addEventListener("click", () => {
    if (likeButton.disabled || !player || typeof player.getVideoData !== 'function') return;

    const videoId = player.getVideoData().video_id;
    if (!videoId) return;

    let likes = JSON.parse(localStorage.getItem("spottrack_likes") || "[]");

    if (likes.includes(videoId)) {
        // Si ya está, quitar el like
        likes = likes.filter(id => id !== videoId);
        likeButton.classList.remove("liked");
    } else {
        // Si no está, añadir
        likes.push(videoId);
        likeButton.classList.add("liked");
    }

    localStorage.setItem("spottrack_likes", JSON.stringify(likes));
});


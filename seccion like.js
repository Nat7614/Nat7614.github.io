document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("liked-songs");
    const likes = JSON.parse(localStorage.getItem("spottrack_likes") || "[]");

    if (!likes.length) {
        container.innerHTML = "<p style='color: #ccc;'>No has dado like a ninguna canción aún.</p>";
        return;
    }

    likes.forEach(videoId => {
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE`)
            .then(res => res.json())
            .then(data => {
                if (!data.items || !data.items[0]) return;

                const video = data.items[0];
                const title = video.snippet.title;
                const artist = video.snippet.channelTitle;
                const thumbnail = video.snippet.thumbnails.medium.url;
                const duration = parseYouTubeDuration(video.contentDetails.duration);

                const card = document.createElement("div");
                card.classList.add("liked-song");

                card.innerHTML = `
                    <img src="${thumbnail}" alt="${title}">
                    <div class="title">${title}</div>
                    <div class="artist">${artist}</div>
                    <div class="duration">${duration}</div>
                `;

                container.appendChild(card);
            })
            .catch(err => console.error("Error al cargar video:", err));
    });
});

// Convierte duración ISO 8601 (PT4M2S) → "4:02"
function parseYouTubeDuration(duration) {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    const minutes = match[1] ? parseInt(match[1]) : 0;
    const seconds = match[2] ? parseInt(match[2]) : 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}



// Función para abrir el modal
function openLikesModal() {
  const modal = document.getElementById("likes-modal");
  if (modal) {
    modal.classList.add("show");
  }
}

// Función para cerrar el modal
function closeLikesModal() {
  const modal = document.getElementById("likes-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}
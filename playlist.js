// playlist.js
import { db } from "./firebase.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";

// Contenedor padre
const playlistSection = document.getElementById("playlist-section");

// Botones de biblioteca
const libraryContainer = document.createElement("div");
libraryContainer.classList.add("library-container");

// Subcontenedor: Tus Me Gusta
const likeContainer = document.createElement("div");
likeContainer.classList.add("library-box");
likeContainer.innerHTML = `
  <img src="assets/likes.jpg" alt="Tus Me Gusta" />
  <h3>Tus Me Gusta</h3>
  <i class="fas fa-heart"></i>
`;
libraryContainer.appendChild(likeContainer);

// Puedes añadir aquí más contenedores de playlist con el mismo formato (4 en total)

// Contenedor dinámico de contenido
const contentContainer = document.createElement("div");
contentContainer.id = "library-content";
contentContainer.classList.add("library-content");

playlistSection.appendChild(libraryContainer);
playlistSection.appendChild(contentContainer);

// Función para dar formato a duración ISO 8601
function formatDuration(iso) {
  const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const h = parseInt(match[1]) || 0;
  const m = parseInt(match[2]) || 0;
  const s = parseInt(match[3]) || 0;
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

// Evento click en "Tus Me Gusta"
likeContainer.addEventListener("click", () => {
  contentContainer.innerHTML = "<p style='color: white;'>Cargando canciones...</p>";

  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    contentContainer.innerHTML = "<p style='color: white;'>Inicia sesión para ver tus canciones con me gusta.</p>";
    return;
  }

  const userDocRef = doc(db, "usuarios", user.uid);
  getDoc(userDocRef)
    .then(async (docSnap) => {
      if (!docSnap.exists()) {
        contentContainer.innerHTML = "<p style='color: white;'>No hay canciones marcadas con me gusta.</p>";
        return;
      }

      const likes = docSnap.data().likes || [];
      if (likes.length === 0) {
        contentContainer.innerHTML = "<p style='color: white;'>No hay canciones marcadas con me gusta.</p>";
        return;
      }

      // Obtener datos de canciones desde API YouTube
      const apiKey = "AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE";
      const promises = likes.map(id =>
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${id}&key=${apiKey}`)
          .then(res => res.json())
          .then(data => {
            const item = data.items[0];
            if (!item) return null;
            return {
              id,
              title: item.snippet.title,
              artist: item.snippet.channelTitle,
              thumbnail: item.snippet.thumbnails.medium.url,
              duration: formatDuration(item.contentDetails.duration)
            };
          })
          .catch(() => null)
      );

      const songs = await Promise.all(promises);
      const validSongs = songs.filter(song => song !== null);

      if (validSongs.length === 0) {
        contentContainer.innerHTML = "<p style='color: white;'>No se pudieron cargar las canciones.</p>";
        return;
      }

      contentContainer.innerHTML = ""; // Limpiar antes de renderizar

      validSongs.forEach(song => {
        const songBox = document.createElement("div");
        songBox.classList.add("song-box");
        songBox.innerHTML = `
          <img src="${song.thumbnail}" alt="${song.title}">
          <div class="song-info">
            <h4>${song.title}</h4>
            <p>${song.artist}</p>
            <span>${song.duration}</span>
          </div>
          <button class="play-button" data-id="${song.id}"><i class="fas fa-play"></i></button>
          <button class="like-toggle" data-id="${song.id}"><i class="fas fa-heart liked"></i></button>
        `;

        // Reproducir en YouTube player
        songBox.querySelector(".play-button").addEventListener("click", () => {
          showSection("search"); // O tu función para abrir el reproductor
          setTimeout(() => {
            playSong(song.id, song.title, song.artist); // Asegúrate que existe
          }, 100);
        });

        // Quitar me gusta
        songBox.querySelector(".like-toggle").addEventListener("click", async () => {
          const songId = song.id;
          try {
            await updateDoc(userDocRef, {
              likes: arrayRemove(songId),
            });
            songBox.remove();
            if (contentContainer.children.length === 0) {
              contentContainer.innerHTML = "<p style='color: white;'>Ya no tienes canciones con me gusta.</p>";
            }
          } catch (error) {
            console.error("Error al quitar me gusta:", error);
          }
        });

        contentContainer.appendChild(songBox);
      });
    })
    .catch(err => {
      console.error("Error al obtener tus me gustas:", err);
      contentContainer.innerHTML = "<p style='color: white;'>Error al cargar canciones.</p>";
    });
});

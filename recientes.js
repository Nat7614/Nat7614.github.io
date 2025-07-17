import { auth, db } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js';
import {
    doc,
    getDoc,
    setDoc
} from 'https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', () => {
    const lista = document.querySelector('.recientes-lista');
    const apiKey = 'AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE';

    onAuthStateChanged(auth, async (user) => {
        let recientes = [];

        try {
            if (user) {
                const docRef = doc(db, "usuarios", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    recientes = docSnap.data().recientes || [];
                }
            } else {
                recientes = JSON.parse(localStorage.getItem('spottrack_recientes')) || [];
            }

            if (recientes.length === 0) {
                const mensaje = user
                    ? "Sin canciones"
                    : "Sin canciones, recomendamos iniciar sesión para no perder los datos de esta sección.";
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
                    ">${mensaje}</div>`;
                return;
            }

            recientes.forEach(cancion => {
                fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${cancion.id}&key=${apiKey}`)
                    .then(res => res.json())
                    .then(data => {
                        if (!data.items || data.items.length === 0) return;

                        const video = data.items[0];
                        const thumbnail = video.snippet.thumbnails.medium.url;
                        const title = video.snippet.title;
                        const channel = video.snippet.channelTitle;
                        const duration = formatDuration(video.contentDetails.duration);

                        const li = document.createElement('li');
                        li.innerHTML = `
                            <img src="${thumbnail}" alt="${title}">
                            <div class="song-title"><span>${title}</span></div>
                            <div class="song-meta">${channel}</div>
                            <div class="song-meta">${duration}</div>
                        `;

                        li.addEventListener('click', () => {
                            showSection('search');
                            setTimeout(() => {
                                playSong(cancion.id, title, channel);
                            }, 100);
                        });

                        lista.appendChild(li);
                    })
                    .catch(err => console.error("Error al cargar canción reciente:", err));
            });
        } catch (error) {
            console.error("Error al cargar canciones recientes:", error);
        }
    });

    function formatDuration(iso) {
        const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const h = parseInt(match[1]) || 0;
        const m = parseInt(match[2]) || 0;
        const s = parseInt(match[3]) || 0;
        return h > 0
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Detección de cambio en el reproductor (si aplica)
    const observer = new MutationObserver(() => {
        const player = document.getElementById('youtube-player');
        if (player && player.dataset.videoId) {
            agregarCancionReciente(player.dataset.videoId);
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

function agregarCancionReciente(videoId) {
    onAuthStateChanged(auth, async (user) => {
        try {
            let recientes = [];

            if (user) {
                const docRef = doc(db, "usuarios", user.uid);
                const docSnap = await getDoc(docRef);
                recientes = docSnap.exists() ? docSnap.data().recientes || [] : [];
            } else {
                recientes = JSON.parse(localStorage.getItem('spottrack_recientes')) || [];
            }

            // Evitar duplicados
            recientes = recientes.filter(c => c.id !== videoId);

            // Añadir al principio
            recientes.unshift({ id: videoId });

            // Limitar a 5
            if (recientes.length > 5) recientes = recientes.slice(0, 5);

            // Guardar
            if (user) {
                await setDoc(doc(db, "usuarios", user.uid), {
                    recientes: recientes
                }, { merge: true });
            } else {
                localStorage.setItem('spottrack_recientes', JSON.stringify(recientes));
            }
        } catch (error) {
            console.error("Error al guardar canción reciente:", error);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const lista = document.querySelector('.recientes-lista');
    const section = document.querySelector('.recientes-section');
    const recientes = JSON.parse(localStorage.getItem('spottrack_recientes')) || [];

    if (recientes.length === 0) {
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
        Sin canciones
    </div>`;
}

    const apiKey = 'AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE';

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

    function formatDuration(iso) {
        const match = iso.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const h = parseInt(match[1]) || 0;
        const m = parseInt(match[2]) || 0;
        const s = parseInt(match[3]) || 0;
        return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m}:${s.toString().padStart(2, '0')}`;
    }
});

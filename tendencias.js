document.addEventListener('DOMContentLoaded', () => {
    const paisGuardado = localStorage.getItem('spottrack_pais');
    if (!paisGuardado) {
        mostrarMenuSeleccionPais();
    }

    function mostrarMenuSeleccionPais() {
        // Evitar crear dos veces el overlay
        if (document.getElementById('pais-overlay')) return;

        const overlay = document.createElement('div');
        overlay.id = 'pais-overlay';
        overlay.innerHTML = `
            <div id="pais-modal">
                <h2>¡Bienvenido a Spottrack!</h2>
                <p>Disfruta de la mejor música adaptada a tu gusto, disfruta de musica con pantalla apagada y escucha sin conexion a internet con el modo offline.</p>
                <p>Spottrack aun le falta mucho por mejorar asi que paciencia, estamos trabajando constantemente para mejorar tu experiencia ¡Pronto tendras mas funciones y mejoras! aqui abajo puedes tener tu cuenta o simplemente elegir el pais y finalizar todo sin cuenta (te recomendamos iniciar sesion).</p>
                <div id="auth-buttons">
                    <button id="btn-login">Iniciar sesión</button>
                    <button id="btn-register">Registrarse</button>
                </div>
                <hr style="margin: 15px 0; border-color: #333;">
                <h3>Selecciona tu país</h3>
                <p>Esta preferencia determinará el contenido musical según tu país. No podrás cambiar esto luego.</p>
                <select id="pais-select">
                    <option value="" disabled selected>Elige un país</option>
                    <option value="AR">Argentina</option>
                    <option value="BO">Bolivia</option>
                    <option value="BR">Brasil</option>
                    <option value="CL">Chile</option>
                    <option value="CO">Colombia</option>
                    <option value="CR">Costa Rica</option>
                    <option value="CU">Cuba</option>
                    <option value="DO">República Dominicana</option>
                    <option value="EC">Ecuador</option>
                    <option value="SV">El Salvador</option>
                    <option value="GT">Guatemala</option>
                    <option value="HN">Honduras</option>
                    <option value="MX">México</option>
                    <option value="NI">Nicaragua</option>
                    <option value="PA">Panamá</option>
                    <option value="PY">Paraguay</option>
                    <option value="PE">Perú</option>
                    <option value="PR">Puerto Rico</option>
                    <option value="UY">Uruguay</option>
                    <option value="VE">Venezuela</option>
                    <option value="ES">España</option>
                    <option value="US">Estados Unidos</option>
                </select>
                <button id="finalizar-pais">Finalizar</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const estilo = document.createElement('style');
        estilo.textContent = `
            #pais-overlay {
                position: fixed;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background-color: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 9999;
            }
            #pais-modal {
                background-color: #0d0d22;
                color: white;
                padding: 20px;
                width: 90%;
                max-width: 320px;
                border-radius: 10px;
                text-align: center;
                margin-left: auto;
                margin-right: auto;
                font-family: 'Segoe UI', sans-serif;
            }
            #pais-modal h2 {
                margin-top: 0;
                margin-bottom: 10px;
                white-space: nowrap;
                color: #f464c4;
            }
            #pais-modal h3 {
                margin-top: 15px;
                color: #f464c4;
            }
            #pais-modal p {
                margin: 6px 0;
                font-size: 14px;
            }
            #pais-modal select {
                margin-top: 10px;
                padding: 8px;
                width: 100%;
                border-radius: 6px;
                border: 1px solid #ccc;
                font-size: 16px;
                background-color: #1a1a40;
                color: white;
            }
            #finalizar-pais {
                margin-top: 15px;
                background: linear-gradient(45deg, #a64bf4, #f464c4, #4bf4e1);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
            }
            #auth-buttons {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                margin-top: 10px;
            }
            #auth-buttons button {
                flex: 1;
                padding: 8px;
                font-size: 14px;
                border: none;
                border-radius: 6px;
                background: linear-gradient(45deg, #a64bf4, #f464c4, #4bf4e1);
                color: white;
                cursor: pointer;
                transition: background 0.2s;
            }
            #auth-buttons button:hover {
                background-color: #292952;
            }
        `;
        document.head.appendChild(estilo);

        document.getElementById('finalizar-pais').addEventListener('click', () => {
            const paisSeleccionado = document.getElementById('pais-select').value;
            if (paisSeleccionado) {
                localStorage.setItem('spottrack_pais', paisSeleccionado);
                document.getElementById('pais-overlay').remove();
                showSection('home'); // Para asegurarnos que vuelve a home
                location.reload();
            }
        });

        document.getElementById('btn-login').addEventListener('click', () => {
            showSection('settings');
            const overlay = document.getElementById('pais-overlay');
            if (overlay) overlay.remove();
        });

        document.getElementById('btn-register').addEventListener('click', () => {
            window.location.href = 'https://spottrack-web.github.io';
        });
    }

    // Secciones
    const homeSection = document.getElementById('home-section');
    const searchSection = document.getElementById('search-section');
    const playlistSection = document.getElementById('playlist-section');
    const settingsSection = document.getElementById('settings-section');

    const homeTab = document.getElementById('home-tab');
    const searchTab = document.getElementById('search-tab');
    const playlistTab = document.getElementById('playlist-tab');
    const settingsTab = document.getElementById('settings-tab');

    homeTab.addEventListener('click', () => showSection('home'));
    searchTab.addEventListener('click', () => showSection('search'));
    playlistTab.addEventListener('click', () => showSection('playlist'));
    settingsTab.addEventListener('click', () => showSection('settings'));

    function showSection(section) {
        homeSection.style.display = 'none';
        searchSection.style.display = 'none';
        playlistSection.style.display = 'none';
        settingsSection.style.display = 'none';

        homeTab.classList.remove('active');
        searchTab.classList.remove('active');
        playlistTab.classList.remove('active');
        settingsTab.classList.remove('active');

        if (section === 'home') {
            homeSection.style.display = 'block';
            homeTab.classList.add('active');

            // Mostrar menú país si aún no se ha elegido
            const paisGuardado = localStorage.getItem('spottrack_pais');
            if (!paisGuardado && !document.getElementById('pais-overlay')) {
                mostrarMenuSeleccionPais();
            }

        } else if (section === 'search') {
            searchSection.style.display = 'block';
            searchTab.classList.add('active');
        } else if (section === 'playlist') {
            playlistSection.style.display = 'block';
            playlistTab.classList.add('active');
        } else if (section === 'settings') {
            settingsSection.style.display = 'block';
            settingsTab.classList.add('active');

            // Cierra menú país si está abierto
            const overlay = document.getElementById('pais-overlay');
            if (overlay) overlay.remove();
        }
    }

    // TENDENCIAS
    const tendenciasContainer = document.getElementById('tendencias-lista');
    const apiKey = 'AIzaSyCiEjKo8cps3pDY1XeatDdVhQHfZfrYahE';
    const toggleButton = document.createElement('button');
    const regionCode = localStorage.getItem('spottrack_pais') || 'MX';

    toggleButton.textContent = '▼ Ver más';
    toggleButton.style.marginTop = '10px';
    toggleButton.style.background = 'none';
    toggleButton.style.border = 'none';
    toggleButton.style.color = '#f464c4';
    toggleButton.style.cursor = 'pointer';
    toggleButton.style.fontSize = '14px';

    let showingAll = false;
    let allItems = [];

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&chart=mostPopular&videoCategoryId=10&maxResults=15&regionCode=${regionCode}&key=${apiKey}`)
        .then(response => response.json())
        .then(data => {
            data.items.forEach((video, index) => {
                const videoId = video.id;
                const title = video.snippet.title;
                const channel = video.snippet.channelTitle;
                const thumbnail = video.snippet.thumbnails.medium.url;
                const duration = formatDuration(video.contentDetails.duration);

                const li = document.createElement('li');
                li.style.position = 'relative';

                li.innerHTML = `
                    <img src="${thumbnail}" alt="${title}">
                    <div class="song-info">
                        <span class="song-title"><span class="scrolling-text">${title}</span></span>
                        <span class="song-meta"><strong>Artista:</strong> ${channel}</span>
                        <span class="song-meta"><strong>Duración:</strong> ${duration}</span>
                    </div>
                `;

                if (index < 3) {
                    const topLabel = document.createElement('div');
                    topLabel.classList.add('top-label');
                    topLabel.textContent = `Top ${index + 1}`;

                    if (index === 0) topLabel.classList.add('top-1');
                    else if (index === 1) topLabel.classList.add('top-2');
                    else if (index === 2) topLabel.classList.add('top-3');

                    li.appendChild(topLabel);
                }

                li.addEventListener('click', () => {
                    showSection('search');
                    setTimeout(() => {
                        playSong(videoId, video.snippet.title, channel);
                    }, 100);
                });

                allItems.push(li);
            });

            renderList();

            toggleButton.addEventListener('click', () => {
                tendenciasContainer.classList.remove('animating-down', 'animating-up');
                void tendenciasContainer.offsetWidth;

                showingAll = !showingAll;
                toggleButton.textContent = showingAll ? '▲ Ver menos' : '▼ Ver más';
                tendenciasContainer.classList.add(showingAll ? 'animating-down' : 'animating-up');

                setTimeout(renderList, 400);
            });

            tendenciasContainer.parentNode.appendChild(toggleButton);
        })
        .catch(error => console.error('Error al cargar tendencias:', error));

    function renderList() {
        tendenciasContainer.innerHTML = '';
        const itemsToShow = showingAll ? allItems : allItems.slice(0, 3);
        itemsToShow.forEach(item => tendenciasContainer.appendChild(item));
    }

    function formatDuration(isoDuration) {
        const match = isoDuration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        const hours = (match[1] || '0H').slice(0, -1);
        const minutes = (match[2] || '0M').slice(0, -1);
        const seconds = (match[3] || '0S').slice(0, -1);

        const h = parseInt(hours);
        const m = parseInt(minutes);
        const s = parseInt(seconds);

        return h > 0
            ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
            : `${m}:${s.toString().padStart(2, '0')}`;
    }

    // Mostrar código del país al lado de la versión
    const versionElement = document.getElementById('spottrack-version');
    if (versionElement && regionCode) {
        versionElement.innerHTML = `v4.2 <span style="font-size: 0.75em; vertical-align: middle; opacity: 0.6; margin-left: 6px;">${regionCode}</span>`;
    }
});

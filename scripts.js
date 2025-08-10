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
    } else if (section === 'search') {
        searchSection.style.display = 'block';
        searchTab.classList.add('active');
    } else if (section === 'playlist') {
        playlistSection.style.display = 'block';
        playlistTab.classList.add('active');
    } else if (section === 'settings') {
        settingsSection.style.display = 'block';
        settingsTab.classList.add('active');
    }
}

// Muestra la sección de inicio al cargar la página
showSection('home');
let player; // Variable global para el reproductor de YouTube
let isPlaying = false;
let updateInterval; // Variable para el intervalo de actualización
let currentSongIndex = -1; // Índice de la canción actual (-1 indica que no hay canción seleccionada)
let songList = [];  // Lista de canciones seleccionadas


// Función para mostrar el mensaje de advertencia con sonido
function showWarningMessage(message) {
    const warningSound = document.getElementById('warning-sound');
    warningSound.play(); // Reproduce el sonido de advertencia

    

    const warningMessageElement = document.getElementById('warning-message');

 // HTML para el ícono de advertencia cuadrado con el símbolo ⚠️ en el centro
const iconHTML = `
<span style="
    display: inline-flex; 
    align-items: center; 
    justify-content: center; 
    width: 30px; 
    height: 0px; 
    border-radius: 20px; 
    margin-right: 10px;
    white-space: nowrap; /* ✅ evita que el texto se rompa en otra línea */
">
    <span style="
        color: yellow; 
        font-size: 18px; 
        font-weight: bold;
    ">
        ⚠️
    </span>
</span>`;


    const messageHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Actualizar el contenido del mensaje de advertencia con el texto centrado
    warningMessageElement.innerHTML = `
        <div style="
            display: flex; 
            align-items: center; 
            justify-content: center; 
            width: 100%;">
            ${iconHTML}${messageHTML}
        </div>`;

        warningMessageElement.style.display = 'block';


// Ocultar el mensaje después de 5 segundos
setTimeout(() => {
    warningMessageElement.style.display = 'none';
}, 5000);
}


// Función para mostrar el mensaje de error con sonido
function showError(message) {
    const errorSound = document.getElementById('error-sound');
    const errorMessageElement = document.getElementById('error-message');

    // Reproducir el sonido de error
    errorSound.play();

    // HTML para el ícono de error ❌
const iconHTML = `
    <span style="
        display: inline-flex; 
        align-items: center; 
        justify-content: center; 
        width: 30px; 
        height: 24px; /* 🔧 Más fino que antes */
        border-radius: 20px; 
        margin-right: 10px;
        white-space: nowrap; /* ✅ evita que el texto se divida */
    ">
        <span style="
            color: white; 
            font-size: 18px; 
            font-weight: bold;
            line-height: 1;
        ">
            ❌
        </span>
    </span>`;


    const mensajeHTML = `<strong style="color: white; font-size: 16px;">${message}</strong>`;

    // Insertar contenido
    errorMessageElement.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; width: 100%;">
            ${iconHTML}${mensajeHTML}
        </div>`;

    // Reiniciar animación (técnica de reflow)
    errorMessageElement.style.animation = 'none';
    void errorMessageElement.offsetWidth; // Fuerza el reflow
    errorMessageElement.style.animation = 'slideErrorDown 0.4s ease forwards, slideErrorUp 0.4s ease 4s forwards';
}


    // Ocultar el mensaje después de 5 segundos con animación de salida
    setTimeout(() => {
        errorMessageElement.style.animation = 'slideOutToLeft 0.3s forwards';
    }, 5000);  
 


window.onload = function() {
    const message = document.getElementById('welcomeMessage');
    const sound = document.getElementById('welcomeSound');
    
    // Mostrar el mensaje de bienvenida
    message.style.display = 'block';
    
    // Reproducir el sonido cuando aparece el mensaje
    sound.play().catch(error => {
        console.error("No se pudo reproducir el sonido automáticamente:", error);
    });
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(function() {
        message.style.display = 'none';
    }, 5000);
};



// Función para cargar configuraciones al abrir la app
function loadSettings() {
    // Recuperar configuraciones de localStorage
    const pauseOnLock = localStorage.getItem('pauseOnLock') === 'true'; // Convertir a booleano
    const dataSavingMode = localStorage.getItem('dataSavingMode') === 'true'; // Convertir a booleano

    // Aplicar configuraciones a los checkboxes
    document.getElementById('pause-on-lock').checked = pauseOnLock;
    document.getElementById('data-saving-mode').checked = dataSavingMode;
}

// Función para guardar configuraciones cuando cambien
function saveSettings() {
    // Obtener el estado de los checkboxes
    const pauseOnLock = document.getElementById('pause-on-lock').checked;
    const dataSavingMode = document.getElementById('data-saving-mode').checked;

    // Guardar los estados en localStorage
    localStorage.setItem('pauseOnLock', pauseOnLock);
    localStorage.setItem('dataSavingMode', dataSavingMode);
}

// Añadir eventos a los checkboxes para guardar configuraciones al cambiar
document.getElementById('pause-on-lock').addEventListener('change', saveSettings);
document.getElementById('data-saving-mode').addEventListener('change', saveSettings);

// Cargar configuraciones al inicio
document.addEventListener('DOMContentLoaded', loadSettings);
// Función para reproducir el sonido de advertencia
function playWarningSound() {
    const audio = new Audio('sounds/warning.mp3'); // Ruta al archivo de sonido
    audio.play().catch(error => console.error('Error al reproducir el sonido:', error));
}

document.getElementById('show-advantages').addEventListener('click', function() {
    const menu = document.getElementById('advantages-menu');
    menu.classList.toggle('show');
});
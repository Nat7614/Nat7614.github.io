// Función para mostrar el mensaje de advertencia
function showNoConnectionWarning() {
    const warningMessage = document.getElementById('no-connection-warning');
    warningMessage.innerHTML = `
        <span>
            <span>⚠️</span>
        </span>
        <strong>No hay conexión a Internet</strong>
    `;
    warningMessage.style.display = 'flex';

    // Reproducir el sonido de advertencia
    playWarningSound();

    // Ocultar el mensaje automáticamente después de 5 segundos
    setTimeout(() => {
        warningMessage.style.display = 'none';
    }, 5000);
}

// Detectar cambios en la conexión de red
window.addEventListener('offline', showNoConnectionWarning);

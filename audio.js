// Función para reproducir el sonido de advertencia
function playWarningSound() {
    const audio = new Audio('sounds/warning.mp3'); // Ruta al archivo de sonido
    audio.play().catch(error => console.error('Error al reproducir el sonido:', error));
}
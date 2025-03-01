// Obtener el checkbox de la opción "Canción en segundo plano"
const pauseOnLockCheckbox = document.getElementById('pause-on-lock');

// Función para recargar la página
function reloadPage() {
    location.reload();
}

// Detectar el cambio de visibilidad de la página (cuando la pantalla se apaga o el dispositivo entra en suspensión)
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {  // La página ha dejado de ser visible (pantalla apagada o bloqueada)
        if (pauseOnLockCheckbox.checked) {
            reloadPage();  // Recargar la página si la opción está activada
        }
    }
});

// Manejo de la opción de pausar música al apagar el dispositivo
pauseOnLockCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // Aquí activamos la opción para pausar la música cuando la pantalla se apaga
        alert("La música se reproducirá cuando se apague la pantalla del dispositivo.");
    } else {
        // Desactivamos la pausa automática
        alert("La música se detendra cuando se apague la pantalla del dispositivo.");
    }
});
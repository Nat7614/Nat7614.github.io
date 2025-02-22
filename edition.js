let startTime = null;
let endTime = null;
let isCustomRangeActive = false;
let lastVideoDuration = null; // Para detectar si la duración del video cambia

document.addEventListener("DOMContentLoaded", function () {
    const pencilButton = document.getElementById("edit-timing");
    const modal = document.getElementById("timing-modal");
    const startInput = document.getElementById("start-time");
    const endInput = document.getElementById("end-time");
    const saveButton = document.getElementById("save-timing");
    const cancelButton = document.getElementById("cancel-timing");

    // Función para actualizar el estado del botón dependiendo si hay un video cargado
    function updateButtonState() {
        if (player && player.getVideoData().video_id) {
            pencilButton.disabled = false; // Habilita el botón si hay un video
        } else {
            pencilButton.disabled = true;  // Deshabilita el botón si no hay video
        }
    }

    // Verificar cada segundo si el video ha cambiado para habilitar o deshabilitar el botón
    setInterval(updateButtonState, 1000);

    // Activar o desactivar el menú de personalización
    pencilButton.addEventListener("click", function () {
        const premiumStatus = document.getElementById("premium-status").innerText.trim();

        // Verificación de estado Premium
        if (!premiumStatus.includes("Spottrack Premium: Activa")) {
            alert("Necesitas Spottrack Premium para usar esta función.");
            return; // No permite abrir el modal si no tiene Premium
        }

        if (!player || player.getPlayerState() !== YT.PlayerState.PLAYING) {
            alert("Debes estar reproduciendo un video/musica para habilitar/desactivar la opción de reproducción personalizada.");
            return;
        }

        if (isCustomRangeActive) {
            // Si ya está activado, desactivamos
            resetCustomization();
        } else {
            // Si no está activado, lo activamos y abrimos el modal
            modal.style.display = "block";
            toggleButtonActive(true); // Activar el botón
        }
    });

    cancelButton.addEventListener("click", function () {
        modal.style.display = "none";
        toggleButtonActive(false); // Desactivar el botón al cancelar
    });

    saveButton.addEventListener("click", function () {
        const videoDuration = player.getDuration();
        const start = parseTime(startInput.value);
        const end = parseTime(endInput.value);

        // Validación de los valores de tiempo
        if (start === null || end === null || start < 0 || end <= start || end > videoDuration) {
            alert("Rango de tiempo inválido. Verifica los valores ingresados.");
            return;
        }

        startTime = start;
        endTime = end;
        isCustomRangeActive = true;
        modal.style.display = "none";
        toggleButtonActive(true); // Mantener el botón activado después de guardar
        player.seekTo(startTime);  // Establece el inicio de la canción
    });
});

// Función para convertir el tiempo ingresado en segundos
function parseTime(timeString) {
    let timeInSeconds = 0;
    
    // Reemplazar los : por espacio y separar
    let timeParts = timeString.replace(':', ' ').split(' ');

    // Convertir todos los valores a segundos
    if (timeParts.length === 1) {
        timeInSeconds = parseInt(timeParts[0], 10);
    } else if (timeParts.length === 2) {
        timeInSeconds = parseInt(timeParts[0], 10) * 60 + parseInt(timeParts[1], 10);
    } else if (timeParts.length === 3) {
        timeInSeconds = parseInt(timeParts[0], 10) * 3600 + parseInt(timeParts[1], 10) * 60 + parseInt(timeParts[2], 10);
    } else {
        return null; // Tiempo inválido
    }

    return timeInSeconds;
}

// Cambiar color del botón según si está activado o no
function toggleButtonActive(isActive = true) {
    const pencilButton = document.getElementById("edit-timing");
    if (isActive) {
        pencilButton.classList.add("active");  // Añadir la clase para activar la iluminación
    } else {
        pencilButton.classList.remove("active");  // Eliminar la clase para desactivar la iluminación
    }
}

// Restablecer la personalización cuando cambie la canción (basado en duración)
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED || event.data === YT.PlayerState.PAUSED) {
        // Resetear la personalización si la canción termina o se pausa
        resetCustomization();
    }

    if (event.data === YT.PlayerState.PLAYING) {
        const currentVideoDuration = player.getDuration();
        
        // Si la duración del video cambia (lo que indica que la canción cambió), desactivar la personalización
        if (lastVideoDuration !== currentVideoDuration) {
            resetCustomization();
        }

        lastVideoDuration = currentVideoDuration;

        const currentTime = player.getCurrentTime();
        // Si la canción ha llegado al tiempo final, reinicia al tiempo de inicio
        if (isCustomRangeActive && currentTime >= endTime) {
            player.seekTo(startTime); // Regresa al tiempo de inicio
        }
    }
}

// Limpiar los inputs de tiempo
function clearInputs() {
    const startInput = document.getElementById("start-time");
    const endInput = document.getElementById("end-time");
    startInput.value = '';
    endInput.value = '';
}

// Resetear la personalización
function resetCustomization() {
    isCustomRangeActive = false;
    startTime = null;
    endTime = null;
    clearInputs();  // Limpiar los campos de tiempo
    toggleButtonActive(false);  // Desactivar el botón de lápiz
}

// Continuamente verificar el tiempo del reproductor mientras se reproduce
setInterval(function() {
    if (isCustomRangeActive) {
        const currentTime = player.getCurrentTime();
        // Si la canción llega al tiempo final, vuelve al inicio
        if (currentTime >= endTime) {
            player.seekTo(startTime);
        }
    }
}, 1000); // Revisa cada segundo

// Obtener el checkbox de la opción "Canción en segundo plano"
const pauseOnLockCheckbox = document.getElementById("pause-on-lock");

// Cargar la configuración guardada en localStorage
if (localStorage.getItem("pauseOnLock") === "true") {
    pauseOnLockCheckbox.checked = true;
} else {
    pauseOnLockCheckbox.checked = false;
}

// Función para recargar la página
function reloadPage() {
    location.reload();
}

// Detectar el cambio de visibilidad de la página (cuando la pantalla se apaga o entra en suspensión)
document.addEventListener("visibilitychange", function () {
    if (document.hidden && !pauseOnLockCheckbox.checked) {
        reloadPage();  // Se recarga la página solo si la opción está desactivada
    }
});

// Manejo de la opción de pausar música al apagar la pantalla
pauseOnLockCheckbox.addEventListener("change", function () {
    localStorage.setItem("pauseOnLock", this.checked);  // Guardar la preferencia en localStorage
    
    if (this.checked) {
        alert("La música seguirá reproduciéndose cuando apagues la pantalla del dispositivo.");
    } else {
        alert("La música se detendrá cuando apagues la pantalla del dispositivo.");
    }
});

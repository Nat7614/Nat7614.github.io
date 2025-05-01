// Bloqueo básico de clic derecho
document.addEventListener("contextmenu", function (event) {
    event.preventDefault();
});

// Bloqueo de teclas comunes para inspeccionar
document.addEventListener("keydown", function (event) {
    // Bloquear F12
    if (event.key === "F12") {
        event.preventDefault();
    }

    // Bloquear Ctrl + Shift + I / J
    if (event.ctrlKey && event.shiftKey && (event.key === "I" || event.key === "J")) {
        event.preventDefault();
    }

    // Bloquear Ctrl + U
    if (event.ctrlKey && event.key === "u") {
        event.preventDefault();
    }
});

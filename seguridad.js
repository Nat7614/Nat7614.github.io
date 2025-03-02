(function() {
    // Bloquear clic derecho (inspeccionar elemento)
    document.addEventListener("contextmenu", function(event) {
        event.preventDefault();
    });

    // Bloquear teclas de acceso a herramientas de desarrollo
    document.addEventListener("keydown", function(event) {
        if (event.keyCode === 123 || // F12
            (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74)) || // Ctrl+Shift+I / Ctrl+Shift+J
            (event.ctrlKey && event.keyCode === 85)) { // Ctrl+U
            event.preventDefault();
        }
    });

    // Intento de bloqueo avanzado de la consola
    setInterval(function() {
        console.profile();
        console.profileEnd();
        if (console.clear) console.clear();
    }, 1000);
})();

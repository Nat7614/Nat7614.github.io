document.addEventListener("DOMContentLoaded", function () {
    const topbarToggle = document.getElementById("topbarToggle");
    const topbar = document.querySelector(".topbar");

    if (!topbarToggle || !topbar) return;

    // Obtener el valor guardado (si existe)
    const savedSetting = localStorage.getItem("hideTopbar");

    // Si es la primera vez (no hay valor), ocultar la barra y activar el checkbox
    if (savedSetting === null) {
        topbarToggle.checked = true;
        topbar.classList.add("hidden");
        localStorage.setItem("hideTopbar", "true"); // Guardar como activado
    } else if (savedSetting === "true") {
        topbarToggle.checked = true;
        topbar.classList.add("hidden");
    } else {
        topbarToggle.checked = false;
        topbar.classList.remove("hidden");
    }

    // Escuchar cambios en el checkbox
    topbarToggle.addEventListener("change", function () {
        if (this.checked) {
            topbar.classList.add("hidden");
            localStorage.setItem("hideTopbar", "true");
        } else {
            topbar.classList.remove("hidden");
            localStorage.setItem("hideTopbar", "false");
        }
    });
});

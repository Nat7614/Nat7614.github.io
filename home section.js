// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
    const topbarToggle = document.getElementById("topbarToggle");
    const topbar = document.querySelector(".topbar");

    if (!topbarToggle || !topbar) return;

    // Cargar la configuración guardada en localStorage
    if (localStorage.getItem("hideTopbar") === "true") {
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

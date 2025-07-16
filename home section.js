// Obtener el checkbox de la opción "Desactivar barra superior"
const topbarToggle = document.getElementById("topbarToggle");
const topbar = document.querySelector(".topbar");

// Cargar la configuración guardada en localStorage
if (localStorage.getItem("hideTopbar") === "true") {
    topbarToggle.checked = true;
    topbar.classList.add("hidden");
} else {
    topbarToggle.checked = false;
    topbar.classList.remove("hidden");
}

// Manejar el cambio del checkbox
topbarToggle.addEventListener("change", function () {
    const shouldHide = this.checked;
    localStorage.setItem("hideTopbar", shouldHide.toString());

    if (shouldHide) {
        topbar.classList.add("hidden");
    } else {
        topbar.classList.remove("hidden");
    }
});

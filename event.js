// Alternar menú de opciones
document.getElementById("toggle-button").addEventListener("click", function () {
    const options = document.getElementById("event-options");
    options.classList.toggle("hidden");
    this.classList.toggle("active"); // Rotar flecha
});

// Cambiar entre eventos
document.querySelectorAll(".event-option").forEach(button => {
    button.addEventListener("click", function () {
        const type = this.getAttribute("data-type");
        document.getElementById("spottrack-events").classList.toggle("hidden", type !== "spottrack");
        document.getElementById("artist-events").classList.toggle("hidden", type !== "artist");
        document.getElementById("event-options").classList.add("hidden");
    });
});
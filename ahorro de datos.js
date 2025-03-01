// Obtener los elementos del DOM
const dataSavingModeCheckbox = document.getElementById('data-saving-mode');

// Evento para detectar cambios en la opción de ahorro de datos
dataSavingModeCheckbox.addEventListener('change', function() {
    if (this.checked) {
        alert("Ahorro de datos activado: La calidad del video e imágenes se reducirán para ahorrar datos.");
        setYouTubePlayerQuality('small'); // Baja calidad (144p - 240p)
        reduceImageQuality(); // Reducir calidad de imágenes
    } else {
        alert("Ahorro de datos desactivado: La calidad del video e imágenes volverán a la normal.");
        setYouTubePlayerQuality('default'); // Restaurar calidad de video
        restoreImageQuality(); // Restaurar calidad de imágenes
    }
});

// Función para establecer la calidad del reproductor de YouTube
function setYouTubePlayerQuality(quality) {
    if (typeof player !== "undefined" && player.setPlaybackQuality) {
        player.setPlaybackQuality(quality);
    }
}

// Función para reducir la calidad de las imágenes
function reduceImageQuality() {
    document.querySelectorAll('img').forEach(img => {
        if (!img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src; // Guardamos la URL original
        }
        img.src = img.src.replace(/(\.\w+)$/, '-low$1'); // Cambia la imagen a una versión de menor calidad
    });
}

// Función para restaurar la calidad original de las imágenes
function restoreImageQuality() {
    document.querySelectorAll('img').forEach(img => {
        if (img.dataset.originalSrc) {
            img.src = img.dataset.originalSrc; // Restauramos la imagen original
        }
    });
}

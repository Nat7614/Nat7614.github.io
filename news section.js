// Novedades
document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".news-carousel img");
    const carousel = document.querySelector(".news-carousel");
    let currentIndex = 0;

    // Función para mostrar la siguiente imagen
    const showNextImage = () => {
        images[currentIndex].classList.remove("active"); // Quitar clase activa de la imagen actual
        currentIndex = (currentIndex + 1) % images.length; // Pasar al siguiente índice
        images[currentIndex].classList.add("active"); // Agregar clase activa a la nueva imagen
    };

    // Cambiar imágenes automáticamente cada 10 segundos
    setInterval(showNextImage, 10000);

    // Cambiar a la siguiente imagen al hacer clic en el cuadro
    carousel.addEventListener("click", showNextImage);
});

document.addEventListener("DOMContentLoaded", () => {
    const downloadButton = document.getElementById("external-download");
    const modal = document.getElementById("convertidor-modal");
    const acceptBtn = document.getElementById("accept-convertidor");
    const acceptAndHideBtn = document.getElementById("accept-hide-convertidor");

    // Mostrar modal si no fue ocultado previamente
    function showModalIfNeeded() {
        const hideModal = localStorage.getItem("ocultarConvertidor");
        if (!hideModal) {
            modal.style.display = "flex";
        } else {
            openConvertidor();
        }
    }

    // Verificar si hay una canción cargada
    function updateDownloadButtonState() {
        if (typeof player !== "undefined" && player.getVideoData && player.getVideoData().video_id) {
            downloadButton.disabled = false;
            downloadButton.classList.add("active");
        } else {
            downloadButton.disabled = true;
            downloadButton.classList.remove("active");
        }
    }
    setInterval(updateDownloadButtonState, 1000);

    // Evento clic del botón de convertir
    downloadButton.addEventListener("click", () => {
        if (downloadButton.disabled) return;
        showModalIfNeeded();
    });

    // Solo aceptar (se volverá a mostrar el modal en el futuro)
    acceptBtn.addEventListener("click", () => {
        modal.style.display = "none";
        openConvertidor();
    });

    // Aceptar y no volver a mostrar
    acceptAndHideBtn.addEventListener("click", () => {
        localStorage.setItem("ocultarConvertidor", "true");
        modal.style.display = "none";
        openConvertidor();
    });

    // Abrir convertidor externo con la URL del video
    function openConvertidor() {
        const videoId = player?.getVideoData()?.video_id;
        if (!videoId) {
            alert("No se pudo obtener el ID del video.");
            return;
        }

        const youtubeUrl = "https://www.youtube.com/watch?v=" + videoId;
        const convertidorUrl = "https://ytmp3.cc/8pu8/?url=" + encodeURIComponent(youtubeUrl);
        window.open(convertidorUrl, "_blank");
    }
});
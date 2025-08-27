document.addEventListener("DOMContentLoaded", () => {
  const downloadButton = document.getElementById("external-download");
  const modal = document.getElementById("convertidor-modal");
  const acceptBtn = document.getElementById("accept-convertidor");
  const acceptAndHideBtn = document.getElementById("accept-hide-convertidor");

  // Obtener audioPlayer global
  const audioPlayer = document.getElementById("audioPlayer");

  // Mostrar modal si no fue ocultado previamente
  function showModalIfNeeded() {
    const hideModal = localStorage.getItem("ocultarConvertidor");
    if (!hideModal) {
      modal.style.display = "flex";
    } else {
      openConvertidor();
    }
  }

  // Verificar si hay una canción cargada para habilitar botón
  function updateDownloadButtonState() {
    if (audioPlayer && audioPlayer.src) {
      downloadButton.disabled = false;
      downloadButton.classList.add("active");
    } else {
      downloadButton.disabled = true;
      downloadButton.classList.remove("active");
    }
  }
  setInterval(updateDownloadButtonState, 1000);

  // Clic en botón descargar
  downloadButton.addEventListener("click", () => {
    if (downloadButton.disabled) return;
    showModalIfNeeded();
  });

  // Solo aceptar (modal puede volver a aparecer)
  acceptBtn.addEventListener("click", () => {
    modal.style.display = "none";
    openConvertidor();
  });

  // Aceptar y no volver a mostrar modal
  acceptAndHideBtn.addEventListener("click", () => {
    localStorage.setItem("ocultarConvertidor", "true");
    modal.style.display = "none";
    openConvertidor();
  });

  // Abrir convertidor externo con URL basada en la canción actual
  function openConvertidor() {
    if (!audioPlayer || !audioPlayer.src) {
      alert("No hay canción cargada para convertir.");
      return;
    }

    // Intentamos obtener el ID de la canción (si tenés la info de track actual, por ejemplo currentTrack.id)
    // En este ejemplo, asumimos que tenés global currentTrack con id YouTube:
    if (!window.currentTrack || !window.currentTrack.id) {
      alert("No se pudo obtener el ID de la canción.");
      return;
    }

    const youtubeUrl = "https://www.youtube.com/watch?v=" + window.currentTrack.id;
    const convertidorUrl = "https://ytmp3.cc/8pu8/?url=" + encodeURIComponent(youtubeUrl);
    window.open(convertidorUrl, "_blank");
  }
});

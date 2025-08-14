let startTime = null;
let endTime = null;
let isCustomRangeActive = false;

document.addEventListener("DOMContentLoaded", function () {
  const pencilButton = document.getElementById("edit-timing");
  const modal = document.getElementById("timing-modal");
  const startInput = document.getElementById("start-time");
  const endInput = document.getElementById("end-time");
  const saveButton = document.getElementById("save-timing");
  const cancelButton = document.getElementById("cancel-timing");

  // Actualizar estado botón según si hay audio cargado
  function updateButtonState() {
    if (audioPlayer && audioPlayer.src) {
      pencilButton.disabled = false;
    } else {
      pencilButton.disabled = true;
      resetCustomization();
    }
  }

  // Actualizar cada segundo
  setInterval(updateButtonState, 1000);

  pencilButton.addEventListener("click", () => {
    const premiumStatus = document.getElementById("premium-status").innerText.trim();

    if (!premiumStatus.includes("Spottrack Premium: Activa")) {
      alert("Necesitas Spottrack Premium para usar esta función con la que podras personalizar el tiempo de inicio y fin de una cancion ¡Suscribete a Spottrack Premium y disfruta de esta ventaja!.");
      return;
    }

    if (!audioPlayer || audioPlayer.paused) {
      alert("Debes estar reproduciendo una canción para habilitar/deshabilitar la opción de reproducción personalizada.");
      return;
    }

    if (isCustomRangeActive) {
      resetCustomization();
      modal.style.display = "none";
    } else {
      // Cargar valores previos
      startInput.value = formatTime(startTime) || "";
      endInput.value = formatTime(endTime) || "";
      modal.style.display = "block";
      toggleButtonActive(true);
    }
  });

  cancelButton.addEventListener("click", () => {
    modal.style.display = "none";
    toggleButtonActive(isCustomRangeActive);
  });

  saveButton.addEventListener("click", () => {
    if (!audioPlayer) return alert("Reproductor no disponible");

    const duration = audioPlayer.duration;
    const start = parseTime(startInput.value);
    const end = parseTime(endInput.value);

    if (
      start === null ||
      end === null ||
      start < 0 ||
      end <= start ||
      end > duration
    ) {
      alert("Rango de tiempo inválido. Verifica los valores ingresados.");
      return;
    }

    startTime = start;
    endTime = end;
    isCustomRangeActive = true;
    modal.style.display = "none";
    toggleButtonActive(true);
    audioPlayer.currentTime = startTime;
  });
});

// Parsear tiempo mm:ss o hh:mm:ss a segundos
function parseTime(timeString) {
  if (!timeString) return null;

  const parts = timeString.split(":").map((p) => p.trim());
  if (parts.some((p) => isNaN(p) || p === "")) return null;

  let seconds = 0;
  if (parts.length === 1) {
    seconds = parseInt(parts[0], 10);
  } else if (parts.length === 2) {
    seconds = parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  } else if (parts.length === 3) {
    seconds =
      parseInt(parts[0], 10) * 3600 +
      parseInt(parts[1], 10) * 60 +
      parseInt(parts[2], 10);
  } else {
    return null;
  }
  return seconds;
}

// Formatear segundos a mm:ss o hh:mm:ss
function formatTime(seconds) {
  if (seconds === null || isNaN(seconds)) return "";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function toggleButtonActive(isActive = true) {
  const pencilButton = document.getElementById("edit-timing");
  if (isActive) pencilButton.classList.add("active");
  else pencilButton.classList.remove("active");
}

function clearInputs() {
  document.getElementById("start-time").value = "";
  document.getElementById("end-time").value = "";
}

function resetCustomization() {
  isCustomRangeActive = false;
  startTime = null;
  endTime = null;
  clearInputs();
  toggleButtonActive(false);
}

// Loop personalizado: chequear cada 500ms si debe regresar al inicio
setInterval(() => {
  if (isCustomRangeActive && audioPlayer && !audioPlayer.paused) {
    if (audioPlayer.currentTime >= endTime) {
      audioPlayer.currentTime = startTime;
    }
  }
}, 500);

// Opcional: si querés reiniciar la personalización al cambiar de canción
audioPlayer.addEventListener('loadedmetadata', () => {
  resetCustomization();
});

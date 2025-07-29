document.addEventListener("DOMContentLoaded", () => {
  const tarjetas = document.querySelectorAll(".tarjeta");

  tarjetas.forEach((tarjeta) => {
    tarjeta.addEventListener("click", () => {
      const targetId = tarjeta.getAttribute("data-target");

      if (targetId === "meGusta" || targetId === "masEscuchado") {
        // Simula clic en el tab de biblioteca
        showSection("playlist");
      } else if (targetId === "novedades") {
        window.open("https://discord.com/invite/gkhFs4AUn6", "_blank");
      } else if (targetId === "colaborar") {
        window.open("https://cafecito.app/spottrack", "_blank");
      } else {
        console.warn(`Destino desconocido: ${targetId}`);
      }
    });
  });
});

// Función showSection reutilizada desde tu otro script
function showSection(section) {
  const homeSection = document.getElementById("home-section");
  const searchSection = document.getElementById("search-section");
  const playlistSection = document.getElementById("playlist-section");
  const settingsSection = document.getElementById("settings-section");

  const homeTab = document.getElementById("home-tab");
  const searchTab = document.getElementById("search-tab");
  const playlistTab = document.getElementById("playlist-tab");
  const settingsTab = document.getElementById("settings-tab");

  // Ocultar todas las secciones
  homeSection.style.display = "none";
  searchSection.style.display = "none";
  playlistSection.style.display = "none";
  settingsSection.style.display = "none";

  // Quitar clase activa de todos
  homeTab.classList.remove("active");
  searchTab.classList.remove("active");
  playlistTab.classList.remove("active");
  settingsTab.classList.remove("active");

  // Mostrar sección seleccionada
  switch (section) {
    case "home":
      homeSection.style.display = "block";
      homeTab.classList.add("active");
      break;
    case "search":
      searchSection.style.display = "block";
      searchTab.classList.add("active");
      break;
    case "playlist":
      playlistSection.style.display = "block";
      playlistTab.classList.add("active");
      break;
    case "settings":
      settingsSection.style.display = "block";
      settingsTab.classList.add("active");
      break;
  }
}

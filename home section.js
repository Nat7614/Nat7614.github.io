document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("topbarToggle");
  const topbar = document.querySelector(".topbar");

  // Cargar configuración guardada
  const hideTopbar = localStorage.getItem("hideTopbar") === "true";
  toggle.checked = hideTopbar;
  topbar.classList.toggle("hidden", hideTopbar);
});

function toggleTopbarOption() {
  const toggle = document.getElementById("topbarToggle");
  const topbar = document.querySelector(".topbar");
  const shouldHide = toggle.checked;

  topbar.classList.toggle("hidden", shouldHide);
  localStorage.setItem("hideTopbar", shouldHide.toString());
}

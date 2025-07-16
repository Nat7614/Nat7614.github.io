document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("topbarToggle");
  const topbar = document.querySelector(".topbar");

  // Cargar configuración guardada
  const hideTopbar = localStorage.getItem("hideTopbar") === "true";
  toggle.checked = hideTopbar;
  topbar.style.display = hideTopbar ? "none" : "flex";
});

function toggleTopbarOption() {
  const toggle = document.getElementById("topbarToggle");
  const topbar = document.querySelector(".topbar");
  const shouldHide = toggle.checked;

  if (shouldHide) {
    topbar.style.display = "none";
  } else {
    topbar.style.display = "flex";
  }

  localStorage.setItem("hideTopbar", shouldHide.toString());
}

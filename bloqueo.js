document.addEventListener("contextmenu", event => event.preventDefault()); // Bloquea clic derecho

document.addEventListener("keydown", event => {
    if (event.ctrlKey && (event.key === "u" || event.key === "U")) { 
        event.preventDefault(); // Bloquea Ctrl + U (Ver código fuente)
    }
});

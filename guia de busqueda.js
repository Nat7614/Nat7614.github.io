document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchContainer = document.querySelector(".search-container"); // Contenedor de la barra de búsqueda
    const suggestionsContainer = document.createElement("div");
    suggestionsContainer.id = "suggestions-container";
    searchContainer.appendChild(suggestionsContainer); // Agregar el contenedor de sugerencias

    // Obtener sugerencias de búsqueda en tiempo real desde la API de YouTube
    searchInput.addEventListener("input", async () => {
        const query = searchInput.value.trim();
        if (query.length === 0) {
            suggestionsContainer.style.display = "none"; // Ocultar sugerencias si no hay texto
            return;
        }

        try {
            const apiKey = getCurrentApiKey(); // Función para obtener la API actual
            const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=5`;

            const response = await fetch(apiUrl);
            const data = await response.json();

            suggestionsContainer.innerHTML = ""; // Limpiar las sugerencias anteriores

            if (data.items.length === 0) {
                suggestionsContainer.style.display = "none"; // Ocultar si no hay sugerencias
                return;
            }

            // Mostrar las sugerencias de YouTube
            data.items.forEach((item) => {
                const suggestionText = item.snippet.title; // Título del video como sugerencia
                const div = document.createElement("div");
                div.classList.add("suggestion");
                div.textContent = suggestionText;
                div.addEventListener("click", () => {
                    searchInput.value = suggestionText; // Establecer el texto de la sugerencia en el campo de búsqueda
                    suggestionsContainer.style.display = "none";  // Ocultar las sugerencias al hacer clic
                    searchSongs(suggestionText); // Función para realizar la búsqueda
                });
                suggestionsContainer.appendChild(div);
            });

            suggestionsContainer.style.display = "block"; // Mostrar las sugerencias
        } catch (error) {
            console.error("Error obteniendo sugerencias de YouTube:", error);
        }
    });

    // Controlar la visibilidad de las sugerencias cuando el usuario hace clic fuera
    document.addEventListener("click", (event) => {
        if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
            suggestionsContainer.style.display = "none"; // Ocultar las sugerencias si se hace clic fuera
        }
    });
});

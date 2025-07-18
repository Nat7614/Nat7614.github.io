import { doc, updateDoc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
import { firebaseConfig } from './firebase.js';

// import { auth, db } from './firebase.js';

const spotifyBox = document.getElementById("spotify-container");
const spotifyText = document.getElementById("spotify-text");

const clientId = "a74b6d109a4e487094453247d23b7749";
const redirectUri = "https://nat7614.github.io/callback.html";

let currentUser = null;

// Escuchamos estado usuario una vez para mantener referencia
onAuthStateChanged(auth, async (user) => {
  currentUser = user;

  if (!user) {
    // Si no hay usuario, no hacemos nada ni mostramos alerta
    spotifyText.textContent = "Vincula tu cuenta de Spotify";
    spotifyBox.style.cursor = "pointer"; // Habilitado igual por si controlas en otro lugar
    return;
  }

  try {
    const userRef = doc(db, "cuentas", user.uid);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.spotifyVinculado && data.spotifyNombre) {
        spotifyText.textContent = `Bienvenido, ${data.spotifyNombre}`;
      } else {
        spotifyText.textContent = "Vincula tu cuenta de Spotify";
      }
    } else {
      spotifyText.textContent = "Vincula tu cuenta de Spotify";
    }
  } catch (error) {
    console.error("Error leyendo datos de usuario:", error);
    spotifyText.textContent = "Vincula tu cuenta de Spotify";
  }
});

spotifyBox.addEventListener("click", () => {
  if (!currentUser) {
    // Aquí no mostramos alertas, solo evitamos proceder
    return;
  }

  const scopes = ["user-read-private", "playlist-read-private", "playlist-read-collaborative"];
  const authUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes.join("%20")}`;
  window.location.href = authUrl;
});

const hash = window.location.hash;

if (hash.includes("access_token")) {
  const token = new URLSearchParams(hash.substring(1)).get("access_token");
  window.location.hash = ""; // Limpia URL

  fetch("https://api.spotify.com/v1/me", {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Token inválido o expirado");
      return res.json();
    })
    .then(async userData => {
      const nombreSpotify = userData.display_name || "Usuario Spotify";

      spotifyText.textContent = `Bienvenido, ${nombreSpotify}`;

      if (!currentUser) {
        // No mostramos alerta, solo salimos silenciosamente
        return;
      }

      const userRef = doc(db, "cuentas", currentUser.uid);
      try {
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
          await updateDoc(userRef, {
            spotifyVinculado: true,
            spotifyNombre: nombreSpotify
          });
        } else {
          await setDoc(userRef, {
            spotifyVinculado: true,
            spotifyNombre: nombreSpotify
          });
        }
      } catch (error) {
        console.error("Error guardando datos en Firebase:", error);
      }
    })
    .catch(err => {
      console.error("Error obteniendo datos de Spotify:", err);
      spotifyText.textContent = "Vincula tu cuenta de Spotify";
    });
}

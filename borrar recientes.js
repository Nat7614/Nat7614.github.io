import { db } from "./firebase.js";
import {
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('borrar-recientes-btn');
  const menu = document.getElementById('borrar-menu');
  const mensaje = document.getElementById('mensaje-confirmacion');

  const auth = getAuth();

  btn.addEventListener('click', () => {
    menu.style.display = 'block';
  });

  window.cerrarMenu = () => {
    menu.style.display = 'none';
  };

  window.confirmarBorrado = async () => {
    // Borrar del localStorage
    localStorage.removeItem('spottrack_recientes');

    // Borrar de Firebase si el usuario está autenticado
    const user = auth.currentUser;
    if (user) {
      try {
        const userDoc = doc(db, "usuarios", user.uid);
        await updateDoc(userDoc, {
          recientes: []
        });
        console.log("Recientes eliminados de Firebase.");
      } catch (err) {
        console.error("Error al eliminar recientes en Firebase:", err);
      }
    }

    // Mostrar mensaje de éxito
    mensaje.style.opacity = '1';
    setTimeout(() => {
      mensaje.style.opacity = '0';
      cerrarMenu();
    }, 2000);
  };

  // Verifica el estado de autenticación al cargar
  onAuthStateChanged(auth, (user) => {
    // Puedes hacer algo si necesitas que el botón se oculte o muestre
  });
});

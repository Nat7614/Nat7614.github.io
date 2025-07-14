// Firebase Configuración
            import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-app.js";
            import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-auth.js";
            import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-firestore.js";
            import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.2/firebase-storage.js";
    
            // Configuración de Firebase
            const firebaseConfig = {
                apiKey: "AIzaSyABdWdjdSTf33W6zaInDznc8HUWZE2KZ6w",
                authDomain: "spottrack-888de.firebaseapp.com",
                projectId: "spottrack-888de",
                storageBucket: "spottrack-888de.appspot.com",
                messagingSenderId: "641511662246",
                appId: "1:641511662246:web:c4c3225daae5edf4ea4a67"
            };
    
            // Inicialización de Firebase
            const app = initializeApp(firebaseConfig);
            const auth = getAuth(app);
            const db = getFirestore(app);
            const storage = getStorage(app);
    
            // Manejo de Estado de Autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("perfil-container").style.display = "block";

        const userDoc = await getDoc(doc(db, "usuarios", user.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            document.getElementById("username").innerText = userData.nombre || "Usuario";
            document.getElementById("profile-img").src = userData.foto || "";
            document.getElementById("plus-icon").style.display = userData.foto ? "none" : "block";

            const premiumStatus = document.getElementById("premium-status");
            const premiumDescription = document.getElementById("premium-description");
            const paypalContainer = document.getElementById("paypal-button-container");

            if (userData.premium) {
    premiumStatus.innerHTML = `
        <div style="
                color: #00c853;
                font-weight: bold;
                font-size: 18px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                text-align: center;
                margin-bottom: 10px;
            ">
                Spottrack Premium: Activa
            </div>
            <div style="
                font-size: 14px;
                line-height: 1.5;
                color: #ccc;
                text-align: left;
            ">
                Felicidades, eres usuario premium de Spottrack. Obtienes las siguientes ventajas:
                <ul style="padding-left: 20px; margin: 10px 0 0 0;">
                    <li>Puedes indicar el inicio y fin de una canción.</li>
                    <li>Puedes establecer un tiempo límite para que la música se detenga.</li>
                    <li>Obtienes un rol especial y ventajas en nuestro servidor de Discord.</li>
                </ul>
            </div>
        </div>
    `;
    premiumStatus.style.display = "block";


// Añadir una animación profesional
premiumStatus.classList.add("premium-active");

                
                premiumDescription.style.display = "none"; // Ocultar descripción
                paypalContainer.style.display = "none"; // Ocultar botón de PayPal
            } else {
                premiumStatus.innerText = "Spottrack Premium";
                premiumStatus.style.color = "white";
                premiumStatus.style.fontWeight = "normal";

                premiumDescription.style.display = "block"; // Mostrar descripción
                paypalContainer.style.display = "block"; // Mostrar botón de PayPal
            }
        }
    } else {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("perfil-container").style.display = "none";
    }
});

    
            // Inicio de Sesión
document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const mensajeLogin = document.getElementById("mensajeLogin");

    // Verificar si los campos de correo y contraseña están completos
    if (!email || !password) {
        mensajeLogin.innerText = "Por favor, completa todos los campos.";
        mensajeLogin.style.color = "red";
        return;
    }

    
    // Verificar si el reCAPTCHA fue completado
    const recaptchaResponse = grecaptcha.getResponse(); // Obtener la respuesta del reCAPTCHA

    if (recaptchaResponse.length === 0) {
        mensajeLogin.innerText = "Por favor, completa el reCAPTCHA.";
        mensajeLogin.style.color = "red";
        return;
    }

    // Mostrar mensaje de "Iniciando sesión..."
    mensajeLogin.innerText = "Iniciando sesión...";
    mensajeLogin.style.color = "blue";

    try {
        // Intentar iniciar sesión con Firebase
        await signInWithEmailAndPassword(auth, email, password);

        // Ocultar el contenedor de login y mostrar el contenedor de perfil
        document.getElementById("login-container").style.display = "none";
        document.getElementById("perfil-container").style.display = "block";
    } catch (error) {
        // Mostrar mensaje de error si la autenticación falla
        mensajeLogin.innerText = "Error: " + error.message;
        mensajeLogin.style.color = "red";
    }
});

    
            // Cambio de Foto de Perfil
            document.getElementById("change-photo").addEventListener("click", () => {
                document.getElementById("file-input").click();
            });
    
            // Subir Foto de Perfil
            document.getElementById("file-input").addEventListener("change", async (event) => {
                const file = event.target.files[0];
                if (file && file.type.startsWith("image/")) {
                    const storageRef = ref(storage, `profile_pictures/${auth.currentUser.uid}`);
                    const uploadResult = await uploadBytes(storageRef, file);
                    const photoURL = await getDownloadURL(uploadResult.ref);
    
                    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), { foto: photoURL });
                    document.getElementById("profile-img").src = photoURL;
                    document.getElementById("plus-icon").style.display = "none";
                } else {
                }
            });
    
            // Cambio de Nombre de Usuario
            document.getElementById("change-username").addEventListener("click", () => {
                document.getElementById("change-username-container").style.display = "block";
            });
    
            // Guardar Nuevo Nombre de Usuario
            document.getElementById("save-username").addEventListener("click", async () => {
                const newUsername = document.getElementById("new-username").value;
                if (newUsername.trim() !== "") {
                    await updateDoc(doc(db, "usuarios", auth.currentUser.uid), { nombre: newUsername });
                    document.getElementById("username").innerText = newUsername;
                    document.getElementById("change-username-container").style.display = "none";
                } else {
                    alert("El nombre no puede estar vacío.");
                }
            });
    
            // Cerrar Sesión
            document.getElementById("logoutBtn").addEventListener("click", () => {
                signOut(auth).then(() => {
                    document.getElementById("perfil-container").style.display = "none";
                    document.getElementById("login-container").style.display = "block";
                });
            });
    
            // Integración con PayPal para Spottrack Premium
            paypal.Buttons({
                style: { shape: 'pill', color: 'gold', layout: 'vertical', label: 'subscribe', height: 40 },
                createSubscription: function(data, actions) {
                    return actions.subscription.create({ plan_id: 'P-6GC75737B9128194DM6R5U3Y' });
                },
                onApprove: async function(data, actions) {
                    const user = auth.currentUser;
                    if (user) {
                        const expiration = Date.now() + 30 * 24 * 60 * 60 * 1000;
                        await updateDoc(doc(db, "usuarios", user.uid), { premium: true, expira: expiration });
    
                        document.getElementById("paypal-button-container").style.display = "none";
                        document.getElementById("premium-status").innerText = "Spottrack Premium: Activa";
                    }
                }
            }).render('#paypal-button-container');
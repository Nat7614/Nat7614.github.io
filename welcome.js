const greetingElement = document.getElementById('greeting');
const suggestionElement = document.getElementById('suggestion');
const iconElement = document.getElementById('greetingIcon');

const now = new Date();
const hour = now.getHours();

let greeting = '';
let suggestion = '';
let iconClass = '';

if (hour >= 20 || hour < 7) {
  greeting = '¡Buenas noches!';
  suggestion = '¿Qué escucharás esta noche?';
  iconClass = 'fas fa-moon';
} else if (hour >= 7 && hour < 14) {
  greeting = '¡Buenos días!';
  suggestion = '¿Qué escucharás hoy?';
  iconClass = 'fas fa-sun';
} else {
  greeting = '¡Buenas tardes!';
  suggestion = '¿Qué escucharás esta tarde?';
  iconClass = 'fas fa-cloud-sun';
}

// Asigna el texto
greetingElement.textContent = greeting;
suggestionElement.textContent = suggestion;

// Cambia la clase del icono a la derecha
iconElement.className = `greeting-icon ${iconClass}`;

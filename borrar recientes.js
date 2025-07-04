document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('borrar-recientes-btn');
    const menu = document.getElementById('borrar-menu');
    const mensaje = document.getElementById('mensaje-confirmacion');

    btn.addEventListener('click', () => {
        menu.style.display = 'block';
    });

    window.cerrarMenu = () => {
        menu.style.display = 'none';
    };

    window.confirmarBorrado = () => {
        localStorage.removeItem('spottrack_recientes');
        mensaje.style.opacity = '1';

        setTimeout(() => {
            mensaje.style.opacity = '0';
            cerrarMenu();
        }, 2000);
    };
});

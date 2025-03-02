setInterval(() => {
    (function() {
        if (window.console && (console.firebug || console.table && /firebug/i.test(console.table()))) {
            alert("Depuración detectada. Se cerrará la aplicación.");
            window.close();
        }
    })();
}, 1000);

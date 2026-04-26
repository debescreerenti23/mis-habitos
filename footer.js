function cargarFooter() {
    const anioActual = new Date().getFullYear();

    const footerTemplate = `
        <footer>
            <div class="social-links">
                <a href="https://www.linkedin.com/in/javier-gallego-4b033815a?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" title="LinkedIn">
                    <i class="fab fa-linkedin"></i>
                </a>
                <a href="https://github.com/debescreerenti23" target="_blank" title="GitHub">
                    <i class="fab fa-github"></i>
                </a>
                <a href="mailto:javigallegofenor@gmail.com" title="Enviar Email">
                    <i class="fas fa-envelope"></i>
                </a>
                <a href="https://instagram.com/javilindj" target="_blank" title="Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
            </div>
            <p>javilindj - All Rights Reserved &copy; <span>${anioActual}</span></p>
        </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerTemplate);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargarFooter);
} else {
    cargarFooter();
}

/* CSS a aplicar

footer {
    text-align: center;
    padding: 20px;
    font-family: 'Inter', sans-serif;
    color: #64748b;
    border-top: 1px solid rgba(0,0,0,0.05);
    margin-top: 40px;
}


*/
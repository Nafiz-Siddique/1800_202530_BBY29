const openButton = document.getElementById('open-sidebar-button');
const navbar = document.getElementById('navbar');
const media = window.matchMedia("(max-width: 700px)"); // FIXED syntax

media.addEventListener('change', updateNavbar);

// Run on page load
updateNavbar(media);

function updateNavbar(e) {
    const isMobile = e.matches;

    if (isMobile) {
        // Sidebar hidden by default on mobile → disable it
        if (!navbar.classList.contains("show")) {
            navbar.setAttribute('inert', '');
        }
    } else {
        // Desktop → always enable navbar
        navbar.removeAttribute('inert');
    }
}

function openSidebar() {
    navbar.classList.add('show');
    openButton.setAttribute('aria-expanded', 'true');
    navbar.removeAttribute('inert'); // enable links
}

function closeSidebar() {
    navbar.classList.remove('show');
    openButton.setAttribute('aria-expanded', 'false');

    // Disable only if in mobile view
    if (media.matches) {
        navbar.setAttribute('inert', '');
    }
}

const navLinks = document.querySelectorAll('nav a');
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        closeSidebar();
    });
});
openButton.addEventListener('click', () => {
    openSidebar();
});

const closeButton = document.getElementById('close-sidebar-button');
closeButton.addEventListener('click', () => {
    closeSidebar();
});
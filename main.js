document.addEventListener('DOMContentLoaded', function () {
    const heroCarousel = document.querySelector('#heroCarousel');
    if (heroCarousel) {
        new bootstrap.Carousel(heroCarousel, {
            interval: 2000,
            ride: 'carousel'
        });
    }

    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    if (navLinks.length) {
        const currentPath = normalizePath(window.location.pathname);
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = (link.getAttribute('href') || '').trim();
            const togglesDropdown = link.matches('[data-bs-toggle="dropdown"]');
            if (!href || href === '#' || href.startsWith('#') || togglesDropdown) {
                return;
            }
            const linkPath = normalizePath(new URL(href, window.location.href).pathname);
            if (currentPath === linkPath) {
                link.classList.add('active');
            }
        });
    }
});

function normalizePath(pathname) {
    if (!pathname) return '/';
    let path = pathname.split('?')[0].split('#')[0];
    if (!path.startsWith('/')) path = '/' + path;
    if (path !== '/' && path.endsWith('/')) {
        path = path.slice(0, -1);
    }
    if (path.toLowerCase().endsWith('/index') || path.toLowerCase().endsWith('/index.html')) {
        return '/';
    }
    return path.toLowerCase() || '/';
}

import 'bootstrap/dist/js/bootstrap.bundle.min.js';

document.addEventListener('DOMContentLoaded', function () {
    const heroCarousel = document.querySelector('#heroCarousel');
    if (heroCarousel) {
        const carousel = new bootstrap.Carousel(heroCarousel, {
            interval: 2000,
            ride: 'carousel'
        });
    }
});

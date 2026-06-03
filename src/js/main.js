// Initialize AOS (Animate On Scroll)
AOS.init({
    duration: 800,
    offset: 100,
    once: true,
    easing: 'ease-in-out-cubic'
});

// Navbar Scroll Effect
const navbar = document.querySelector('.navbar');
const scrollProgressBar = document.querySelector('.scroll-progress');

window.addEventListener('scroll', () => {
    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    scrollProgressBar.style.width = scrollPercent + '%';
    
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Smooth Scroll for Navbar Links
document.querySelectorAll('.navbar-menu a').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('[data-target]');
    const duration = 2000; // 2 seconds
    const frameRate = 30;
    const frames = duration / (1000 / frameRate);

    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const increment = target / frames;
        let current = 0;

        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.ceil(current) + (counter.textContent.includes('+') ? '+' : '');
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target + (counter.textContent.includes('+') ? '+' : '');
            }
        };

        updateCounter();
    });
}

// Trigger counter animation when hero section is visible
const heroObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            animateCounters();
            heroObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

const heroSection = document.querySelector('#hero');
if (heroSection) {
    heroObserver.observe(heroSection);
}

// Initialize Swiper for Clients
const clientsSwiper = new Swiper('.clientsSwiper', {
    loop: true,
    autoplay: {
        delay: 3000,
        disableOnInteraction: false,
    },
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    breakpoints: {
        640: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 4,
        },
    },
});

// Initialize Swiper for Testimonials
const testimonialSwiper = new Swiper('.testimonialSwiper', {
    loop: true,
    autoplay: {
        delay: 5000,
        disableOnInteraction: false,
    },
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
        type: 'bullets',
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    breakpoints: {
        768: {
            slidesPerView: 2,
        },
        1024: {
            slidesPerView: 3,
        },
    },
});

// Portfolio Filter
const filterButtons = document.querySelectorAll('.btn-tag');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        const filter = button.getAttribute('data-filter');

        // Filter portfolio items
        portfolioItems.forEach(item => {
            const category = item.getAttribute('data-category');
            
            if (filter === 'all' || category === filter) {
                item.style.display = 'block';
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 10);
            } else {
                item.style.opacity = '0';
                setTimeout(() => {
                    item.style.display = 'none';
                }, 300);
            }
        });

        // Refresh AOS
        AOS.refresh();
    });
});

// Add opacity transition
portfolioItems.forEach(item => {
    item.style.transition = 'opacity 0.3s ease';
    item.style.opacity = '1';
});

// Navbar Mobile Toggle
const navbarToggle = document.querySelector('.navbar-toggle');
const navbarMenu = document.querySelector('.navbar-menu');

if (navbarToggle) {
    navbarToggle.addEventListener('click', () => {
        navbarMenu.classList.toggle('active');
    });
}

// CTA Buttons
document.querySelectorAll('.navbar-cta, .btn-primary').forEach(btn => {
    if (btn.textContent.includes('Hubungi') || btn.textContent.includes('Konsultasi')) {
        btn.addEventListener('click', () => {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
});

// Form Submission
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Simple validation
        if (!data.name || !data.email || !data.message) {
            alert('Mohon isi semua field yang wajib diisi');
            return;
        }
        
        // Show success message
        alert('Terima kasih! Pesan Anda telah kami terima. Kami akan menghubungi Anda segera.');
        contactForm.reset();
    });
}

// Parallax Effect on Hero
window.addEventListener('scroll', () => {
    const heroBg = document.querySelector('.hero-video-bg');
    if (heroBg && window.scrollY < window.innerHeight) {
        heroBg.style.transform = `translateY(${window.scrollY * 0.5}px)`;
    }
});

// Lazy Loading untuk Images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Add animation for service cards on hover
document.querySelectorAll('.services-card, .portfolio-item, .project-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Navbar menu active state on scroll
window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    document.querySelectorAll('.navbar-menu a').forEach(link => {
        const href = link.getAttribute('href');
        if (href && href.startsWith('#')) {
            link.classList.remove('text-corporate-bright');
            if (href.slice(1) === current) {
                link.classList.add('text-corporate-bright');
            }
        }
    });
});

// Preloader/Loading Screen
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

// Performance monitoring
if (window.performance && window.performance.timing) {
    const navigation = window.performance.timing;
    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
    console.log(`Page load time: ${loadTime}ms`);
}

// Add to cart / CTA tracking
document.querySelectorAll('[class*="btn-"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        console.log(`Button clicked: ${btn.textContent.trim()}`);
    });
});

// Initialize tooltips if needed
function initTooltips() {
    document.querySelectorAll('[title]').forEach(el => {
        el.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('title');
            tooltip.style.cssText = `
                position: absolute;
                background: #0B1F3A;
                color: white;
                padding: 5px 10px;
                border-radius: 4px;
                font-size: 12px;
                z-index: 1000;
            `;
            document.body.appendChild(tooltip);
        });
    });
}

initTooltips();

// Keyboard navigation support
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals if added later
        console.log('ESC key pressed');
    }
});

console.log('MEGATAMA Website Loaded Successfully');

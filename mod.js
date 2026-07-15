// Header scroll state
  const header = document.getElementById('siteHeader');
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Hero video: fade in if it loads, otherwise keep animated fallback
  const video = document.getElementById('heroVideo');
  video.addEventListener('canplay', () => video.classList.add('loaded'));
  video.addEventListener('error', () => { /* fallback gradient stays visible */ });

  // Spray line draw-in on load
  window.addEventListener('load', () => {
    document.getElementById('heroSpray').classList.add('draw');
  });

  // Legal modals
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('modal-' + btn.dataset.modal).classList.add('open');
    });
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
  });

  // Mobile menu (simple toggle)
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');

  function openMenu(){
    navLinks.style.cssText = 'display:flex; position:absolute; top:64px; left:0; right:0; background:#fff; flex-direction:column; padding:24px 32px; gap:18px; box-shadow:0 12px 24px rgba(0,0,0,0.08);';
    navLinks.querySelectorAll('a').forEach(a => a.style.color = 'var(--ink)');
    burger.classList.add('active');
  }
  function closeMenu(){
    navLinks.style.cssText = '';
    navLinks.querySelectorAll('a').forEach(a => a.style.color = '');
    burger.classList.remove('active');
  }

  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    open ? closeMenu() : openMenu();
  });
  navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  // Contact form (front-end only placeholder)
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Merci, votre demande a bien été enregistrée. Notre équipe vous recontacte sous 24h.');
    e.target.reset();
  });

  // Footer year
  document.getElementById('year').textContent = new Date().getFullYear();

  // Basic input sanitation (defense-in-depth, not a substitute for server-side validation)
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.value = el.value.replace(/<script.*?>.*?<\/script>/gi, '');
    });
  });

  // Animation des compteurs
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 secondes
    const increment = target / (duration / 16); // 60 FPS
    let current = 0;

    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = Math.floor(current) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    };

    updateCounter();
}

// Observer pour détecter quand la section est visible
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const counters = document.querySelectorAll('.stat-num');
            counters.forEach(counter => {
                animateCounter(counter);
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observer la section
const statsSection = document.querySelector('.stats');
observer.observe(statsSection);
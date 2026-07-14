// Header scroll state
  const siteHeader = document.querySelector('header');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });

  // Contact form (front-end only placeholder)
  document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();
    document.getElementById('formSuccess').classList.add('show');
    e.target.reset();
    document.getElementById('formSuccess').scrollIntoView({behavior:'smooth', block:'center'});
  });

  // Basic input sanitation (defense-in-depth, not a substitute for server-side validation)
  document.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.value = el.value.replace(/<script.*?>.*?<\/script>/gi, '');
    });
  });

  // Legal modals
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById('modal-' + btn.dataset.modal).classList.add('open'));
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
  });

  // Mobile menu
  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open ? '' : 'display:flex; position:absolute; top:60px; left:0; right:0; background:var(--forest-dark); flex-direction:column; padding:20px 32px; gap:16px; z-index:50;';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
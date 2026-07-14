const siteHeader = document.querySelector('header');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });

  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => document.getElementById('modal-' + btn.dataset.modal).classList.add('open'));
  });
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => btn.closest('.modal-overlay').classList.remove('open'));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', (e) => { if (e.target === ov) ov.classList.remove('open'); });
  });

  const burger = document.getElementById('burger');
  const navLinks = document.querySelector('.nav-links');
  burger.addEventListener('click', () => {
    const open = navLinks.style.display === 'flex';
    navLinks.style.cssText = open ? '' : 'display:flex; position:absolute; top:60px; left:0; right:0; background:var(--forest-dark); flex-direction:column; padding:20px 32px; gap:16px; z-index:50;';
  });

  document.getElementById('year').textContent = new Date().getFullYear();
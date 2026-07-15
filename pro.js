// Header scroll state (same behavior as index.html)
  const siteHeader = document.querySelector('header');
  window.addEventListener('scroll', () => {
    siteHeader.classList.toggle('scrolled', window.scrollY > 40);
  });

  const tabs = document.querySelectorAll('.filter-tab');
  const cards = document.querySelectorAll('.prod-card');
  const emptyMsg = document.getElementById('catalogEmpty');
  const resultCount = document.getElementById('resultCount');
  const searchInput = document.getElementById('searchInput');
  let activeFilter = 'all';

  function applyFilters(){
    const query = searchInput.value.trim().toLowerCase();
    let visible = 0;
    cards.forEach(card => {
      const matchesCat = activeFilter === 'all' || card.dataset.cat === activeFilter;
      const name = card.querySelector('h3').textContent.toLowerCase();
      const matchesSearch = !query || name.includes(query);
      const show = matchesCat && matchesSearch;
      card.style.display = show ? 'flex' : 'none';
      if (show) visible++;
    });
    emptyMsg.style.display = visible === 0 ? 'block' : 'none';
    resultCount.textContent = visible + (visible > 1 ? ' produits' : ' produit');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeFilter = tab.dataset.filter;
      applyFilters();
    });
  });
  searchInput.addEventListener('input', applyFilters);

  document.querySelectorAll('[data-filter-link]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const filter = link.dataset.filterLink;
      const tab = document.querySelector('.filter-tab[data-filter="' + filter + '"]');
      if (tab) tab.click();
      document.querySelector('.catalog-toolbar').scrollIntoView({behavior:'smooth'});
    });
  });

  // "Commander" opens the full product modal: visuals + info + order form.
  // The rest of the card is no longer clickable — only this button triggers it.
  document.querySelectorAll('.prod-order').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.prod-card');
      const icon = card.querySelector('.prod-visual i').className;
      
      const tag = card.querySelector('.prod-tag').textContent;
      const name = card.querySelector('h3').textContent;
      const desc = card.querySelector('.prod-body p').textContent;
      const price = card.querySelector('.prod-price span').textContent;

      document.getElementById('detailIcon').className = icon;
      
      document.getElementById('detailTag').textContent = tag;
      document.getElementById('detailName').textContent = name;
      document.getElementById('detailDesc').textContent = desc;
      document.getElementById('detailPrice').textContent = price;

      document.getElementById('modal-order').classList.add('open');
    });
  });
  document.getElementById('orderForm').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Merci, votre demande a été enregistrée. Notre équipe vous recontacte rapidement.');
    document.getElementById('modal-order').classList.remove('open');
    e.target.reset();
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

  function openMenu(){
    navLinks.style.cssText = 'display:flex; position:absolute; top:60px; left:0; right:0; background:#fff; flex-direction:column; padding:20px 32px; gap:16px; z-index:50; box-shadow:0 12px 24px rgba(0,0,0,0.08);';
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

  document.getElementById('year').textContent = new Date().getFullYear();
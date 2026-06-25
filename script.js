const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Fermer le menu quand on clique sur un lien
const links = navLinks.querySelectorAll('a');
links.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    });
});

// Fermer le menu quand on clique en dehors
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
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
            const counters = document.querySelectorAll('.stat-number');
            counters.forEach(counter => {
                animateCounter(counter);
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

// Observer la section
const statsSection = document.querySelector('.stats-section');
observer.observe(statsSection);

// ====================================
// RECHERCHE AVEC SUGGESTIONS
// ====================================

const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');
const suggestionsDropdown = document.getElementById('suggestionsDropdown');
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card');
const noResults = document.getElementById('noResults');

let currentFilter = 'all';
let selectedSuggestionIndex = -1;
let currentSuggestions = [];

// Extraire les données des produits
function getProductsData() {
    const products = [];
    productCards.forEach(card => {
        const name = card.dataset.name;
        const category = card.dataset.category;
        const price = card.querySelector('.product-price').textContent;
        const description = card.querySelector('.product-description').textContent;
        
        // Icône selon la catégorie
        let icon = '📦';
        if (category === 'engrais') icon = '🌱';
        else if (category === 'herbicide') icon = '🌿';
        else if (category === 'insecticide') icon = '🐛';
        else if (category === 'fongicide') icon = '🍄';
        else if (category === 'stimulants-nematicides') icon = '💪';
        else if (category === 'hygiene-publique') icon = '🧼';
        else if (category === 'appareil') icon = '💉';
        
        products.push({ name, category, price, description, icon, element: card });
    });
    return products;
}

const productsDataArray = getProductsData();

// Fonction pour afficher les suggestions
function showSuggestions(searchTerm) {
    if (!searchTerm.trim()) {
        suggestionsDropdown.classList.remove('active');
        return;
    }

    const term = searchTerm.toLowerCase();
    const suggestions = productsDataArray.filter(product => 
        product.name.toLowerCase().includes(term) ||
        product.category.toLowerCase().includes(term) ||
        product.description.toLowerCase().includes(term)
    ).slice(0, 6); // Limiter à 6 suggestions

    currentSuggestions = suggestions;
    selectedSuggestionIndex = -1;

    if (suggestions.length === 0) {
        suggestionsDropdown.innerHTML = `
            <div class="no-suggestions">Aucune suggestion trouvée pour "${searchTerm}"</div>
        `;
    } else {
        suggestionsDropdown.innerHTML = suggestions.map((product, index) => `
            <div class="suggestion-item" data-index="${index}">
                <div class="suggestion-icon">${product.icon}</div>
                <div class="suggestion-content">
                    <div class="suggestion-name">${highlightMatch(product.name, searchTerm)}</div>
                    <div class="suggestion-category">${product.category}</div>
                </div>
                <div class="suggestion-price">${product.price}</div>
            </div>
        `).join('');

        // Ajouter les événements de clic
        document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.index);
                selectSuggestion(index);
            });
        });
    }

    suggestionsDropdown.classList.add('active');
}

// Surligner le texte correspondant
function highlightMatch(text, searchTerm) {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<strong style="color: #10b981;">$1</strong>');
}

// Sélectionner une suggestion
function selectSuggestion(index) {
    if (index >= 0 && index < currentSuggestions.length) {
        const product = currentSuggestions[index];
        searchInput.value = product.name;
        suggestionsDropdown.classList.remove('active');
        filterProducts(product.name);
        clearSearch.classList.add('active');
    }
}

// Filtrer les produits
function filterProducts(searchTerm = searchInput.value) {
    const term = searchTerm.toLowerCase().trim();
    let visibleCount = 0;

    productCards.forEach(card => {
        const name = card.dataset.name.toLowerCase();
        const category = card.dataset.category.toLowerCase();
        const description = card.querySelector('.product-description').textContent.toLowerCase();

        const matchesSearch = !term || name.includes(term) || category.includes(term) || description.includes(term);
        const matchesFilter = currentFilter === 'all' || category === currentFilter;

        if (matchesSearch && matchesFilter) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });

    if (visibleCount === 0) {
        noResults.classList.add('active');
    } else {
        noResults.classList.remove('active');
    }
}

// Événement de saisie
searchInput.addEventListener('input', (e) => {
    const value = e.target.value;
    
    if (value.trim()) {
        clearSearch.classList.add('active');
        showSuggestions(value);
    } else {
        clearSearch.classList.remove('active');
        suggestionsDropdown.classList.remove('active');
        filterProducts('');
    }
});

// Navigation au clavier
searchInput.addEventListener('keydown', (e) => {
    const suggestionItems = document.querySelectorAll('.suggestion-item');

    if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestionItems.length - 1);
        updateSelectedSuggestion(suggestionItems);
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
        updateSelectedSuggestion(suggestionItems);
    } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
            selectSuggestion(selectedSuggestionIndex);
        } else {
            suggestionsDropdown.classList.remove('active');
            filterProducts();
        }
    } else if (e.key === 'Escape') {
        suggestionsDropdown.classList.remove('active');
    }
});

// Mettre à jour la sélection visuelle
function updateSelectedSuggestion(items) {
    items.forEach((item, index) => {
        if (index === selectedSuggestionIndex) {
            item.classList.add('selected');
            item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        } else {
            item.classList.remove('selected');
        }
    });
}

// Effacer la recherche
clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    clearSearch.classList.remove('active');
    suggestionsDropdown.classList.remove('active');
    filterProducts('');
    searchInput.focus();
});

// Filtres de catégorie
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        filterProducts();
    });
});

// Fermer les suggestions en cliquant ailleurs
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !suggestionsDropdown.contains(e.target)) {
        suggestionsDropdown.classList.remove('active');
    }
});

// ====================================
// FORMULAIRE DE CONTACT
// ====================================

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');
const nameInput = document.getElementById('name');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const email = emailInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !phone || !message) {
        alert('Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (email && !isValidEmail(email)) {
        alert('Veuillez entrer une adresse email valide');
        return;
    }

    submitBtn.textContent = 'Envoi en cours...';
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    await new Promise(resolve => setTimeout(resolve, 1500));

    console.log('Message envoyé:', { name, phone, email, message });

    successMessage.classList.add('show');
    
    nameInput.value = '';
    phoneInput.value = '';
    emailInput.value = '';
    messageInput.value = '';

    submitBtn.textContent = 'Envoyer';
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;

    setTimeout(() => {
        successMessage.classList.remove('show');
    }, 5000);
});

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ====================================
// ANIMATIONS AU SCROLL
// ====================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.info-item, .form-group').forEach(el => {
    animationObserver.observe(el);
});

document.querySelectorAll('.info-content a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.href.startsWith('tel:') || link.href.startsWith('mailto:')) {
            return;
        }
        e.preventDefault();
    });
});

// ====================================
// GESTION DU HEADER AU SCROLL
// ====================================

window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});

// ====================================
// MODAL PRODUIT
// ====================================

// Configuration des produits avec informations détaillées
const productsData = {
    'KARA VERT': {
        category: 'Engrais',
        badge: '50kg',
        price: '25,000',
        description: 'Engrais pour booster la croissance des jeunes cultures effet reverdissant par la synergie entre l’azote, les oligoéléments et les acides aminés augmenter l’activité photosynthétique et le développement végétatif des plantes améliorer l’absorption du phosphore',
        features: [
            '✓ Formulation équilibrée',
            '✓ Convient à tous types de cultures',
            '✓ Améliore la croissance et le rendement',
            '✓ Certifié et homologué',
            '✓ Conditionnement de 50kg'
        ]
    },
    'KARA ROUGE': {
        category: 'Engrais',
        badge: '50kg',
        price: '22,000',
        description: 'Augmente la concentration des sucres dans les fruits. Idéal pour améliorer la qualité des récoltes.',
        features: [
            '✓ Améliore la qualité des fruits',
            '✓ Augmente la teneur en sucres',
            '✓ Action rapide et efficace',
            '✓ Qualité garantie',
            '✓ Sac de 50kg'
        ]
    },
    'KARA GOLD': {
        category: 'Engrais',
        badge: '50kg',
        price: '25,000',
        description: 'Engrais NPK pour favoriser la floraison et la fructification des cultures.',
        features: [
            '✓ Favorise la floraison',
            '✓ Stimule la fructification',
            '✓ NPK équilibré',
            '✓ Multi-cultures certifié',
            '✓ Sac de 50kg'
        ]
    },
    'FOLCROP Ca': {
        category: 'Engrais',
        badge: '50kg',
        price: '25,000',
        description: 'Engrais NPK pour favoriser la floraison et la fructification des cultures.',
        features: [
            '✓ Favorise la floraison',
            '✓ Stimule la fructification',
            '✓ NPK équilibré',
            '✓ Multi-cultures certifié',
            '✓ Sac de 50kg'
        ]
    },
    'DOUO 800 WP & 800 SC': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'EFIKAX 720 SL': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'PRECIS 108 EC 250 mL': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'MALOFLA 432 EC 1L': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'MODEL 40 g/L 1L': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'TASMAN 480 SL/ 757 SG': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'TASMAN SUPER 200SL': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'MALOFLA PLUS 200 0D': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'TIGAFLA 100 SL': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'COLNOUMAN 400 EC': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'IDEAL 200 WP': {
        category: 'Herbicide',
        badge: '1L',
        price: '8,500',
        description: 'Herbicide sélectif destiné au désherbage efficace des cultures.',
        features: [
            '✓ Action sélective',
            '✓ Efficace contre mauvaises herbes',
            '✓ Protection longue durée',
            '✓ Homologué',
            '✓ Bidon de 1 litre'
        ]
    },
    'CACAOSUPER 40 EC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'REZO 50 EC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'VETO 30 EC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'TERMIX 50 SC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'PROTEGE BOIS 200 EC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'MYSTIK 40 EC': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'FUMIFOX 560 FT': {
        category: 'Insecticide',
        badge: '1L',
        price: '12,000',
        description: 'Insecticide binaire puissant pour la protection des cultures de cacao.',
        features: [
            '✓ Formulation binaire',
            '✓ Large spectre d\'action',
            '✓ Effet choc et rémanent',
            '✓ Spécial cacao',
            '✓ Flacon 1 litre'
        ]
    },
    'BONEUR 250 EC': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'FOMA 10 GR 1Kg': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'MANCOTOP 800 WP': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'DIFEZOL 250 EC': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'SECURITY 660 WP': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'BACTER 660 WP': {
        category: 'Fongicide',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'FURASOL 50 GR': {
        category: 'stumulants-nematicides',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'LATEX PLUS 5% PA': {
        category: 'stumulants-nematicides',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'GRAISSE HEVEA 1 Kg': {
        category: 'stumulants-nematicides',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'LATEX PLUS 2.5% PA': {
        category: 'stumulants-nematicides',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'BLOCK RAT': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'VICTOIRE 25 SC': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'GEL CAFARD': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'REMPART 0,5 DP': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'CLEANTEX 100 SC g/L': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'VICTOIRE 25 EC': {
        category: 'hygiene-publique',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'ATOMISEUR': {
        category: 'appareil',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
    'PULVERISATEUR': {
        category: 'appareil',
        badge: '1kg',
        price: '7,500',
        description: 'Fongicide systémique avec une action préventive et curative à la fois.',
        features: [
            '✓ Action préventive et curative',
            '✓ Systémique',
            '✓ Large spectre fongicide',
            '✓ Multi-cultures',
            '✓ Sachet 1kg'
        ]
    },
};

// Éléments du modal
const productModal = document.getElementById('productModal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose = document.getElementById('modalClose');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalPrice = document.getElementById('modalPrice');
const modalDescription = document.getElementById('modalDescription');
const modalFeatures = document.getElementById('modalFeatures');
const modalBadge = document.getElementById('modalBadge');
const modalOrderBtn = document.getElementById('modalOrderBtn');

// Fonction pour ouvrir le modal
function openProductModal(productName) {
    const product = productsData[productName];
    
    if (product) {
        modalTitle.textContent = productName;
        modalCategory.textContent = product.category;
        modalPrice.textContent = product.price;
        modalDescription.textContent = product.description;
        modalBadge.textContent = product.badge;
        
        // Remplir les caractéristiques
        modalFeatures.innerHTML = product.features.map(feature => 
            `<li>${feature}</li>`
        ).join('');
        
        // Afficher le modal avec animation
        productModal.style.display = 'flex';
        setTimeout(() => {
            productModal.classList.add('active');
        }, 10);
        
        // Empêcher le scroll du body
        document.body.style.overflow = 'hidden';
    }
}

// Fonction pour fermer le modal
function closeProductModal() {
    productModal.classList.remove('active');
    setTimeout(() => {
        productModal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }, 300);
}

// Event listeners pour les boutons Commander
document.querySelectorAll('.product-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const card = e.target.closest('.product-card');
        const productName = card.dataset.name;
        openProductModal(productName);
    });
});

// Fermer le modal
modalClose.addEventListener('click', closeProductModal);
modalOverlay.addEventListener('click', closeProductModal);

// Fermer avec la touche Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && productModal.classList.contains('active')) {
        closeProductModal();
    }
});

// Bouton Commander dans le modal
modalOrderBtn.addEventListener('click', () => {
    const productName = modalTitle.textContent;
    const productPrice = modalPrice.textContent;
    
    // Créer le message WhatsApp
    const message = `Bonjour, je souhaite commander : ${productName} au prix de ${productPrice} FCFA`;
    const phoneNumber = '2250758949310';
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    // Ouvrir WhatsApp
    window.open(whatsappUrl, '_blank');
    
    closeProductModal();
});

// ====================================
// ANIMATIONS AU SCROLL ENTRE SECTIONS
// ====================================

// Configuration de l'observer
const scrollAnimationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Ajouter la classe 'animated' quand l'élément devient visible
            entry.target.classList.add('animated');
            
            // Optionnel : arrêter d'observer après l'animation (animation une seule fois)
            // scrollAnimationObserver.unobserve(entry.target);
        } else {
            // Optionnel : retirer la classe pour réanimer au retour
            // entry.target.classList.remove('animated');
        }
    });
}, {
    threshold: 0.15, // Déclenche quand 15% de l'élément est visible
    rootMargin: '0px 0px -50px 0px' // Déclenche un peu avant que l'élément soit complètement visible
});

// Observer tous les éléments avec les classes d'animation
document.addEventListener('DOMContentLoaded', function() {
    // Sélectionner tous les éléments à animer
    const elementsToAnimate = document.querySelectorAll(
        '.fade-up, .fade-down, .fade-left, .fade-right, ' +
        '.scale-in, .rotate-in, .blur-in, .slide-bottom, ' +
        '.flip-in, .bounce-in, .animate-on-scroll'
    );
    
    // Observer chaque élément
    elementsToAnimate.forEach(element => {
        scrollAnimationObserver.observe(element);
    });
});

 const wrapper = document.getElementById('carouselWrapper');
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const indicatorsContainer = document.getElementById('indicators');
        const slides = document.querySelectorAll('.carousel-slide');
        
        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoPlayInterval;

        // Créer les indicateurs
        function createIndicators() {
            for (let i = 0; i < totalSlides; i++) {
                const indicator = document.createElement('div');
                indicator.classList.add('indicator');
                if (i === 0) indicator.classList.add('active');
                indicator.addEventListener('click', () => goToSlide(i));
                indicatorsContainer.appendChild(indicator);
            }
        }

        // Aller à une slide spécifique
        function goToSlide(index) {
            currentIndex = index;
            updateCarousel();
        }

        // Mettre à jour le carrousel
        function updateCarousel() {
            const offset = -currentIndex * 100;
            wrapper.style.transform = `translateX(${offset}%)`;
            
            // Mettre à jour les indicateurs
            const indicators = document.querySelectorAll('.indicator');
            indicators.forEach((indicator, index) => {
                indicator.classList.toggle('active', index === currentIndex);
            });

            // Mettre à jour le compteur de slides
            const currentNum = document.getElementById('currentSlideNum');
            if (currentNum) {
                currentNum.textContent = String(currentIndex + 1).padStart(2, '0');
            }

            // Mettre à jour la barre de progression
            const progressFill = document.getElementById('progressFill');
            if (progressFill) {
                const pct = ((currentIndex + 1) / totalSlides) * 100;
                progressFill.style.width = pct + '%';
            }
        }

        // Slide suivante
        function nextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateCarousel();
        }

        // Slide précédente
        function prevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateCarousel();
        }

        // Auto-play
        function startAutoPlay() {
            autoPlayInterval = setInterval(nextSlide, 5000);
        }

        function stopAutoPlay() {
            clearInterval(autoPlayInterval);
        }

        // Event Listeners
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoPlay();
            startAutoPlay();
        });

        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoPlay();
            startAutoPlay();
        });

        // Pause au survol
        wrapper.addEventListener('mouseenter', stopAutoPlay);
        wrapper.addEventListener('mouseleave', startAutoPlay);

        // Navigation au clavier
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
                stopAutoPlay();
                startAutoPlay();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
                stopAutoPlay();
                startAutoPlay();
            }
        });

        // Support tactile
        let touchStartX = 0;
        let touchEndX = 0;

        wrapper.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        wrapper.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            if (touchEndX < touchStartX - 50) {
                nextSlide();
                stopAutoPlay();
                startAutoPlay();
            }
            if (touchEndX > touchStartX + 50) {
                prevSlide();
                stopAutoPlay();
                startAutoPlay();
            }
        }

        // Initialisation
        createIndicators();
        startAutoPlay();

document.addEventListener("DOMContentLoaded", function() {

    // ==========================================================
    // 1. FILTRAGE INTERACTIF DE L'ÉQUIPE
    // ==========================================================
    const filterButtons = document.querySelectorAll(".filter-btn");
    const teamCards = document.querySelectorAll(".team-card");

    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener("click", () => {
                // Changer le bouton actif
                document.querySelector(".filter-btn.active").classList.remove("active");
                button.classList.add("active");

                const filterValue = button.getAttribute("data-filter");

                // Filtrer les cartes avec animation
                teamCards.forEach(card => {
                    const category = card.getAttribute("data-category");
                    if (filterValue === "all" || category === filterValue) {
                        card.classList.remove("hide");
                        card.classList.add("show");
                    } else {
                        card.classList.remove("show");
                        card.classList.add("hide");
                    }
                });
            });
        });
    }

    // ==========================================================
    // 2. SOUMISSION DU FORMULAIRE EN AJAX (INTERACTIF)
    // ==========================================================
    const contactForm = document.getElementById("interactive-contact-form");
    const formStatus = document.getElementById("form-status");
    const submitBtn = document.getElementById("submit-btn");

    if (contactForm) {
        contactForm.addEventListener("submit", function(e) {
            e.preventDefault(); // Empêche le rechargement de la page

            // Afficher le spinner et désactiver le bouton
            submitBtn.disabled = true;
            submitBtn.querySelector(".btn-text").style.display = "none";
            submitBtn.querySelector(".spinner").style.display = "inline-block";

            // Préparation des données
            const formData = new FormData(this);

            // Envoi de la requête asynchrone au serveur PHP
            fetch("traitement-contact.php", {
                method: "POST",
                body: formData
            })
            .then(response => response.text())
            .then(data => {
                // Réinitialiser le bouton
                submitBtn.disabled = false;
                submitBtn.querySelector(".btn-text").style.display = "inline-block";
                submitBtn.querySelector(".spinner").style.display = "none";

                // Afficher le message de succès de manière interactive
                formStatus.style.display = "block";
                formStatus.className = "form-status-box success";
                formStatus.innerHTML = '<i class="fa-solid fa-circle-check"></i> Merci ! Votre message a été envoyé avec succès.';
                
                contactForm.reset(); // Vide les champs
            })
            .catch(error => {
                submitBtn.disabled = false;
                submitBtn.querySelector(".btn-text").style.display = "inline-block";
                submitBtn.querySelector(".spinner").style.display = "none";

                // Afficher l'erreur de manière interactive
                formStatus.style.display = "block";
                formStatus.className = "form-status-box error";
                formStatus.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Une erreur est survenue, veuillez réessayer.';
            });
        });
    }

    // ==========================================================
    // 3. PROTECTION DU CODE SOURCE AVEC TOAST NOTIFICATION
    // ==========================================================
    // Création dynamique de la div Toast de sécurité
    const toast = document.createElement("div");
    toast.className = "security-toast";
    toast.innerHTML = '<i class="fa-solid fa-shield-halved"></i> <span>Action désactivée pour la sécurité du site.</span>';
    document.body.appendChild(toast);

    function triggerToast() {
        toast.classList.add("show");
        setTimeout(() => {
            toast.classList.remove("show");
        }, 3500); // Reste visible 3,5 secondes
    }

    // Blocage clic droit + Toast
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        triggerToast();
    });

    // Blocage raccourcis inspection (F12, Ctrl+Shift+I, etc.) + Toast
    document.addEventListener('keydown', function(e) {
        if (e.keyCode === 123 || 
           (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) || 
           (e.ctrlKey && e.keyCode === 85)) {
            e.preventDefault();
            triggerToast();
            return false;
        }
    });

    // ==========================================================
    // 4. ANIMATION DES NOUVELLES SECTIONS AU SCROLL
    // ==========================================================
    // Utilise le système IntersectionObserver pour ajouter la classe '.animated' au bon moment
    const animatedElements = document.querySelectorAll('.slide-bottom, .blur-in, .flip-in, .bounce-in');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target); // L'animation ne se joue qu'une seule fois
            }
        });
    }, { threshold: 0.15 });

    animatedElements.forEach(element => {
        observer.observe(element);
    });
});
/* =============================================
   AD SHOP — index.js
   - Burger menu
   - Compteur panier (navbar + barre du bas)
   - Onglet actif de la navigation du bas
   - Barre de recherche navbar
   ============================================= */

// ── BURGER ──
const burger = document.getElementById('burger');
const dropdownMenu = document.getElementById('dropdown-menu');

if (burger && dropdownMenu) {
  burger.addEventListener('click', () => {
    dropdownMenu.classList.toggle('open');
    burger.classList.toggle('active');
  });

  // Fermer le menu si on clique ailleurs
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.remove('open');
      burger.classList.remove('active');
    }
  });

  // Fermer le menu automatiquement si on repasse en desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      dropdownMenu.classList.remove('open');
      burger.classList.remove('active');
    }
  });
}

// ══════════════════════════════
// PANIER — compteur
// ══════════════════════════════
function savePanier(panier) {
  localStorage.setItem('adshop_panier', JSON.stringify(panier));
}

function getPanier() {
  try {
    const p = JSON.parse(localStorage.getItem('adshop_panier') || '[]');
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
}

// Met à jour les compteurs de la navbar/footer (.cart-counter)
// et le badge de la barre du bas (#bn-cart-count)
function updateCartCounter() {
  const panier = getPanier();
  const total = panier.reduce((s, i) => s + (Number(i.qte) || 0), 0);

  document.querySelectorAll('.cart-counter').forEach(el => {
    el.textContent = total;
    el.style.display = total > 0 ? 'inline-flex' : 'none';
  });

  const bnBadge = document.getElementById('bn-cart-count');
  if (bnBadge) {
    bnBadge.textContent = total > 99 ? '99+' : total;
    bnBadge.style.display = total > 0 ? 'flex' : 'none';
  }
}

// ── Initialisation : onglet actif de la barre du bas + compteurs ──
document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const page = path.split('/').pop() || path.split('/').slice(-2)[0] || 'index.html';

  const map = {
    'index.html': 'bn-accueil',
    'produit.html': 'bn-produit',
    'panier.html': 'bn-panier',
    'contact.html': 'bn-contact',
    'chaussures.html': 'bn-produit',
    'mvola.html': 'bn-panier',
  };

  const activeId = map[page];
  if (activeId) {
    const el = document.getElementById(activeId);
    if (el) el.classList.add('active');
  }

  updateCartCounter();
  window.addEventListener('storage', updateCartCounter);

  // Lancer la recherche avec Enter
  const input = document.getElementById('nav-search-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') lancerRecherche();
    });
  }
});

// ── Barre de recherche navbar ──
function toggleSearch() {
  const box = document.getElementById('nav-search-box');
  const input = document.getElementById('nav-search-input');
  box.classList.toggle('open');
  if (box.classList.contains('open')) {
    input.focus();
  }
}

function lancerRecherche() {
  const q = document.getElementById('nav-search-input').value.trim();
  // depuis Products/ il faut remonter d'un dossier
  const base = window.location.pathname.includes('/Products/') ? '../' : '';
  if (q) {
    window.location.href = `${base}recherche.html?q=${encodeURIComponent(q)}`;
  } else {
    window.location.href = `${base}recherche.html`;
  }
}


// ══════════════════════════════
// PAGES PRODUITS — carrousel .tout + flèches (utilisé par produit.html)
// ══════════════════════════════
// ── DRAG SCROLL sur .tout ──
const tout = document.querySelector('.tout');
if (tout) {
  let isDown = false;
  let startX;
  let scrollLeft;

  tout.addEventListener('mousedown', (e) => {
    isDown = true;
    tout.style.cursor = 'grabbing';
    startX = e.pageX - tout.offsetLeft;
    scrollLeft = tout.scrollLeft;
  });

  tout.addEventListener('mouseleave', () => {
    isDown = false;
    tout.style.cursor = 'grab';
  });

  tout.addEventListener('mouseup', () => {
    isDown = false;
    tout.style.cursor = 'grab';
  });

  tout.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - tout.offsetLeft;
    const walk = (x - startX) * 2;
    tout.scrollLeft = scrollLeft - walk;
  });
}

// ── FLÈCHES CARROUSEL ──
const btnGauche = document.getElementById('btnGauche');
const btnDroite = document.getElementById('btnDroite');

if (btnGauche && btnDroite) {
  btnGauche.addEventListener('click', () => {
    document.getElementById('carrousel').scrollBy({ left: -220, behavior: 'smooth' });
  });
  btnDroite.addEventListener('click', () => {
    document.getElementById('carrousel').scrollBy({ left: 220, behavior: 'smooth' });
  });
}


// ══════════════════════════════
// AJOUT AU PANIER — utilisé par produit.html et Products/*.html
// ══════════════════════════════
// ── Fonction globale ajouterAuPanier ──
window.ajouterAuPanier = function ({ nom, prix, img, couleur, taille }) {
  const panier = getPanier();
  const existe = panier.find(
    i => i.nom === nom && i.couleur === couleur && i.taille === taille
  );

  if (existe) {
    existe.qte += 1;
  } else {
    panier.push({
      nom,
      prix,
      img,
      couleur: couleur || '',
      taille: taille || '',
      qte: 1,
    });
  }

  savePanier(panier);
  updateCartCounter();
  showCartToast(nom);
};

// ── Toast global ──
function showCartToast(nom) {
  // Cherche un toast existant, sinon le crée
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position:fixed; bottom:28px; right:28px;
      background:#111827; color:#fff;
      padding:13px 22px; border-radius:10px;
      font-size:0.9rem; font-weight:600;
      box-shadow:0 6px 24px rgba(0,0,0,0.28);
      z-index:9999; opacity:0; transform:translateY(60px);
      transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events:none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = `🛒 "${nom}" ajouté au panier !`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(60px)';
  }, 2500);
}

// ══════════════════════════════
// BOUTONS "Acheter" — détection automatique
// Fonctionne sur .one, .one2, .one3, .one2 dans chaussures
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();

  // Sélectionne tous les boutons / liens "Acheter" dans les cartes produit
  document.querySelectorAll(
    '.one a, .one2 a, .one3 a, .one2-btn, .one3-btn'
  ).forEach(btn => {
    // Ignore les liens de navigation (qui ont un href réel)
    const href = btn.getAttribute('href');
    if (href && href !== '' && href !== '#' && !href.startsWith('javascript')) return;

    btn.addEventListener('click', (e) => {
      e.preventDefault();

      // Remonte jusqu'à la carte parente (.one / .one2 / .one3)
      const card = btn.closest('.one, .one2, .one3');
      if (!card) return;

      // ── Nom du produit ──
      const titreEl = card.querySelector('.one2-titre') || card.querySelector('.one3-titre') || card.querySelector('h2');
      const nom = titreEl ? titreEl.textContent.trim() : 'Produit';

      // ── Prix (extrait le nombre en Fc) ──
      const prixEl = card.querySelector('.one2-prix') || card.querySelector('.one3-prix') || card.querySelectorAll('h2')[1];
      let prix = 0;
      if (prixEl) {
        const match = prixEl.textContent.replace(/\s/g, '').match(/(\d+)/);
        if (match) prix = parseInt(match[1], 10);
      }

      // ── Image ──
      const imgEl = card.querySelector('img');
      const img = imgEl ? imgEl.src : '';

      // ── Couleur & Taille (selects) ──
      const selects = card.querySelectorAll('select');
      let couleur = '';
      let taille = '';
      selects.forEach(sel => {
        const val = sel.value;
        const placeholder = sel.options[0].textContent.toLowerCase();
        if (!val) return;
        if (placeholder.includes('couleur')) couleur = val;
        else taille = val;
      });

      // ── Ajout au panier ──
      window.ajouterAuPanier({ nom, prix, img, couleur, taille });
    });
  });
});


// ══════════════════════════════
// HERO — diaporama, cercle, texte animé, cadeau surprise
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const slides = [...document.querySelectorAll('.slide')];
  const cimgs = [...document.querySelectorAll('.cimg')];
  const dotsBox = document.getElementById('dots');
  if (!slides.length || !dotsBox) return;

  let cur = 0, timer;
  slides.forEach((_, i) => {
    const d = document.createElement('button');
    d.setAttribute('aria-label', 'Image ' + (i + 1));
    d.addEventListener('click', () => { go(i); restart(); });
    dotsBox.appendChild(d);
  });
  function go(n) {
    cur = n;
    slides.forEach((s, i) => s.classList.toggle('active', i === n));
    cimgs.forEach((c, i) => c.classList.toggle('active', i === n));
    [...dotsBox.children].forEach((d, i) => d.classList.toggle('active', i === n));
  }
  function restart() {
    clearInterval(timer);
    timer = setInterval(() => go((cur + 1) % slides.length), 5000);
  }
  go(0); restart();

  // Texte qui s'écrit tout seul
  const words = ['les chaussures', 'les vêtements', 'les accessoires', 'les bonnes affaires'];
  const typed = document.getElementById('typed');
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    c += del ? -1 : 1;
    typed.textContent = word.slice(0, c);
    let delay = del ? 45 : 90;
    if (!del && c === word.length) { del = true; delay = 1500; }
    else if (del && c === 0) { del = false; w = (w + 1) % words.length; delay = 300; }
    setTimeout(tick, delay);
  })();

  // Cadeau surprise : confettis + message
  const gift = document.getElementById('gift');
  const msg = document.getElementById('giftmsg');
  let giftTimer;
  gift.addEventListener('click', () => {
    msg.classList.add('show');
    // le message disparaît tout seul après 4 secondes
    clearTimeout(giftTimer);
    giftTimer = setTimeout(() => msg.classList.remove('show'), 4000);
    const r = gift.getBoundingClientRect();
    const colors = ['#2A8CFF', '#D62828', '#ffffff'];
    for (let i = 0; i < 45; i++) {
      const p = document.createElement('span');
      p.className = 'cf';
      p.style.left = r.left + r.width / 2 + 'px';
      p.style.top = r.top + r.height / 2 + 'px';
      p.style.background = colors[i % 3];
      p.style.setProperty('--x', (Math.random() * 360 - 180) + 'px');
      p.style.setProperty('--y', (Math.random() * 320 - 200) + 'px');
      p.style.setProperty('--r', (Math.random() * 720) + 'deg');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }
  });
});

// ══════════════════════════════
// GALERIE — duplique les photos pour une boucle sans trou
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.photo-track').forEach(track => {
    const originals = [...track.children];
    const add = (list) => list.forEach(el => {
      const c = el.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      c.tabIndex = -1;
      track.appendChild(c);
    });
    // 1) on répète jusqu'à couvrir la largeur de l'écran
    let n = 0;
    while (track.offsetWidth < track.parentElement.offsetWidth && n++ < 10) add(originals);
    // 2) on double le tout : l'animation se déplace de 50 %
    add([...track.children]);
  });
});

// ══════════════════════════════
// COUPS DE CŒUR — inclinaison 3D + reflet qui suit la souris / le doigt
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.holo').forEach(card => {
    const set = (px, py) => {
      card.style.setProperty('--px', px);
      card.style.setProperty('--py', py);
      card.style.setProperty('--rx', ((0.5 - py) * 18) + 'deg');
      card.style.setProperty('--ry', ((px - 0.5) * 22) + 'deg');
    };
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.classList.add('on');
      set((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height);
    });
    const reset = () => { card.classList.remove('on'); set(0.5, 0.5); };
    card.addEventListener('pointerleave', reset);
    card.addEventListener('pointercancel', reset);
  });
});

// ══════════════════════════════
// BLOC FINAL — les photos suivent la souris (effet de profondeur)
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const fin = document.getElementById('final');
  if (!fin) return;
  const fl = [...fin.querySelectorAll('.fl')];
  fin.addEventListener('pointermove', (e) => {
    const r = fin.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    fl.forEach(el => {
      const d = +el.dataset.d;
      el.style.transform = `translate(${-x * d}px, ${-y * d}px)`;
    });
  });
  fin.addEventListener('pointerleave', () => fl.forEach(el => { el.style.transform = ''; }));
});

// ══════════════════════════════
// APPARITION AU SCROLL — les blocs apparaissent quand on descend
// ══════════════════════════════
document.documentElement.classList.add('js');
document.addEventListener('DOMContentLoaded', () => {
  const items = [...document.querySelectorAll('.reveal')];
  if (!('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('show'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      el.classList.add('show');
      io.unobserve(el);
      setTimeout(() => { el.style.transitionDelay = ''; }, 1200);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  items.forEach(el => {
    // les cartes "coup de cœur" apparaissent l'une après l'autre
    if (el.classList.contains('holo')) {
      el.style.transitionDelay = ([...el.parentElement.children].indexOf(el) * 0.12) + 's';
    }
    io.observe(el);
  });
});

// ══════════════════════════════
// FORMES DÉCO — elles sortent de derrière chaque partie quand elle apparaît
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const secs = document.querySelectorAll('.has-deco');
  if (!('IntersectionObserver' in window)) { secs.forEach(s => s.classList.add('in')); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  secs.forEach(s => io.observe(s));
});




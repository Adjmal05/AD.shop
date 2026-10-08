/* ═══════════════════════════════════════════
   AD SHOP — recherche.js
   Lecture automatique des produits depuis
   les pages HTML existantes
═══════════════════════════════════════════ */

// ── Pages à scanner pour trouver les produits ──
const PAGES_A_SCANNER = [
  { url: '/Products/chaussures.html', categorie: 'Chaussures' },
  { url: '/produit.html',             categorie: 'Produits' },
  // Ajoute ici tes autres pages quand tu les crées :
  // { url: '/Products/tshirts.html',  categorie: 'T-shirts' },
  // { url: '/Products/montres.html',  categorie: 'Montres' },
];

let tousLesProduits = [];
let query = '';

// ══════════════════════════════
//  CHARGEMENT DES PRODUITS
// ══════════════════════════════
async function chargerProduits() {
  const loading = document.getElementById('rech-loading');
  const grid    = document.getElementById('rech-grid');

  loading.style.display = 'flex';
  grid.innerHTML = '';
  tousLesProduits = [];

  for (const page of PAGES_A_SCANNER) {
    try {
      const res  = await fetch(page.url);
      const text = await res.text();
      const doc  = new DOMParser().parseFromString(text, 'text/html');

      // Récupère toutes les cartes .one2 et .one3
      doc.querySelectorAll('.one2, .one3').forEach(card => {

        // Nom
        const nomEl =
          card.querySelector('.one2-titre') ||
          card.querySelector('.one3-titre') ||
          card.querySelector('h2');
        const nom = nomEl ? nomEl.textContent.trim() : null;
        if (!nom) return;

        // Prix
        const prixEl =
          card.querySelector('.one2-prix') ||
          card.querySelector('.one3-prix') ||
          card.querySelectorAll('h2')[1];
        const prix = prixEl ? prixEl.textContent.trim() : '';

        // Image
        const imgEl = card.querySelector('img');
        let img = imgEl ? imgEl.getAttribute('src') : '';
        // Corrige les chemins relatifs
        if (img && !img.startsWith('http') && !img.startsWith('/')) {
          const base = page.url.substring(0, page.url.lastIndexOf('/') + 1);
          img = base + img;
        }

        tousLesProduits.push({
          nom,
          prix,
          img,
          categorie: page.categorie,
          lien: page.url,
        });
      });

    } catch (err) {
      console.warn(`Impossible de charger ${page.url}:`, err);
    }
  }

  loading.style.display = 'none';
  afficherProduits(tousLesProduits);
  updateCount(tousLesProduits.length, '');
}

// ══════════════════════════════
//  AFFICHAGE
// ══════════════════════════════
function afficherProduits(produits) {
  const grid  = document.getElementById('rech-grid');
  const empty = document.getElementById('rech-empty');

  grid.innerHTML = '';

  if (produits.length === 0) {
    empty.style.display = 'flex';
    return;
  }
  empty.style.display = 'none';

  produits.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'rech-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const nomHighlight = query
      ? p.nom.replace(new RegExp(`(${query})`, 'gi'), '<mark>$1</mark>')
      : p.nom;

    card.innerHTML = `
      <img
        src="${p.img || 'https://placehold.co/200x160/eaeaf9/1a6fc4?text=AD+Shop'}"
        alt="${p.nom}"
        onerror="this.src='https://placehold.co/200x160/eaeaf9/1a6fc4?text=AD+Shop'"
      />
      <div class="rech-card-info">
        <div class="rech-card-cat">${p.categorie}</div>
        <div class="rech-card-nom">${nomHighlight}</div>
        <div class="rech-card-prix">${p.prix}</div>
      </div>
      <a href="${p.lien}" class="rech-card-btn">
        <i class="fa-solid fa-eye"></i> Voir le produit
      </a>
    `;

    grid.appendChild(card);
  });
}

// ══════════════════════════════
//  RECHERCHE
// ══════════════════════════════
function rechercher(q) {
  query = q.trim().toLowerCase();

  if (!query) {
    afficherProduits(tousLesProduits);
    updateCount(tousLesProduits.length, '');
    return;
  }

  const resultats = tousLesProduits.filter(p =>
    p.nom.toLowerCase().includes(query) ||
    p.categorie.toLowerCase().includes(query)
  );

  afficherProduits(resultats);
  updateCount(resultats.length, query);
}

function updateCount(nb, q) {
  const el = document.getElementById('rech-count');
  if (!el) return;
  if (!q) {
    el.textContent = `${nb} produit${nb !== 1 ? 's' : ''} disponible${nb !== 1 ? 's' : ''}`;
  } else {
    el.textContent = `${nb} résultat${nb !== 1 ? 's' : ''} pour "${q}"`;
  }
}

// ══════════════════════════════
//  ÉVÉNEMENTS
// ══════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  chargerProduits();

  const input   = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearBtn');

  input.addEventListener('input', () => {
    const val = input.value;
    clearBtn.style.display = val ? 'block' : 'none';
    rechercher(val);
  });

  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.style.display = 'none';
    input.focus();
    rechercher('');
  });

  // Recherche depuis l'URL (ex: recherche.html?q=nike)
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    input.value = q;
    clearBtn.style.display = 'block';
    // Attend que les produits soient chargés
    const interval = setInterval(() => {
      if (tousLesProduits.length > 0) {
        rechercher(q);
        clearInterval(interval);
      }
    }, 200);
  }
});
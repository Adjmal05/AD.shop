/* ═══════════════════════════════════════════
   AD SHOP — panier.js
   Gestion complète du panier (localStorage)
═══════════════════════════════════════════ */

// ── Taux de conversion Fc → € ──
const TAUX = 500;

// ── Codes promo disponibles ──
const PROMOS = {
  'ADSHOP10': 10,   // -10%
  'BIENVENUE': 15,  // -15%
  'SOLDES20':  20,  // -20%
};

let remise = 0; // % de remise active

// ══════════════════════════════
//  FRAIS DE TRANSFERT MVOLA
//  Grille tarifaire en vigueur (colonne "Nouveaux tarifs")
//  Chaque palier = [montantMin, montantMax, frais]
// ══════════════════════════════

const MVOLA_FEE_TABLE = [
  { min: 1,      max: 1000,    fee: 700   },
  { min: 1001,   max: 5000,    fee: 800   },
  { min: 5001,   max: 10000,   fee: 900   },
  { min: 10001,  max: 25000,   fee: 1700  },
  { min: 25001,  max: 50000,   fee: 2700  },
  { min: 50001,  max: 100000,  fee: 4700  },
  { min: 100001, max: 150000,  fee: 6500  },
  { min: 150001, max: 200000,  fee: 8500  },
  { min: 200001, max: 300000,  fee: 11000 },
  { min: 300001, max: 500000,  fee: 13000 },
  { min: 500001, max: 800000,  fee: 16000 },
  { min: 800001, max: 1000000, fee: 19350 },
];

/**
 * Retourne les frais MVola pour un montant donné.
 * fee = null si le montant est hors grille (> 1 000 000 Fc).
 */
function getMvolaFee(montant) {
  if (montant <= 0) return { fee: 0, bracket: null };
  const bracket = MVOLA_FEE_TABLE.find(b => montant >= b.min && montant <= b.max);
  if (!bracket) return { fee: null, bracket: null };
  return { fee: bracket.fee, bracket };
}

// ══════════════════════════════
//  PANIER — lecture / écriture
// ══════════════════════════════

function getPanier() {
  return JSON.parse(localStorage.getItem('adshop_panier') || '[]');
}

function savePanier(panier) {
  localStorage.setItem('adshop_panier', JSON.stringify(panier));
}

// ══════════════════════════════
//  RENDU DES ARTICLES
// ══════════════════════════════

function renderPanier() {
  const panier = getPanier();
  const container = document.getElementById('cartItems');
  const panierVide = document.getElementById('panierVide');
  const btnVider = document.getElementById('btnVider');
  const btnCommander = document.getElementById('btnCommander');

  if (!container) return;

  container.innerHTML = '';

  if (panier.length === 0) {
    if (panierVide) panierVide.classList.add('visible');
    if (btnVider) btnVider.style.display = 'none';
    if (btnCommander) btnCommander.disabled = true;
    updateRecap([]);
    updateBadge(0);
    if (typeof updateCartCounter === 'function') updateCartCounter();
    return;
  }

  if (panierVide) panierVide.classList.remove('visible');
  if (btnVider) btnVider.style.display = 'flex';
  if (btnCommander) btnCommander.disabled = false;

  panier.forEach((item, index) => {
    const card = document.createElement('div');
    card.classList.add('cart-item');
    card.style.animationDelay = `${index * 0.07}s`;

    const sousTotalItem = item.prix * item.qte;
    const euroItem = (sousTotalItem / TAUX).toFixed(0);

    card.innerHTML = `
      <img
        src="${item.img || 'https://placehold.co/90x75/eaeaf9/1a6fc4?text=AD+Shop'}"
        alt="${item.nom}"
        class="item-img"
        onerror="this.src='https://placehold.co/90x75/eaeaf9/1a6fc4?text=AD+Shop'"
      />
      <div class="item-info">
        <div class="item-nom">${item.nom}</div>
        <div class="item-options">
          ${item.couleur ? `<span class="item-tag">🎨 ${item.couleur}</span>` : ''}
          ${item.taille  ? `<span class="item-tag">📐 ${item.taille}</span>`  : ''}
        </div>
        <div class="item-prix">${item.prix.toLocaleString('fr-FR')} Fc / ${(item.prix / TAUX).toFixed(0)}€</div>
        <div class="item-subtotal">Sous-total : ${sousTotalItem.toLocaleString('fr-FR')} Fc / ${euroItem}€</div>
      </div>
      <div class="item-actions">
        <div class="qty-control">
          <button class="qty-btn" onclick="changerQte(${index}, -1)">−</button>
          <span class="qty-val">${item.qte}</span>
          <button class="qty-btn" onclick="changerQte(${index}, +1)">+</button>
        </div>
        <button class="btn-supprimer" onclick="supprimerItem(${index})" title="Supprimer">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
    container.appendChild(card);
  });

  updateRecap(panier);
  updateBadge(panier.reduce((s, i) => s + i.qte, 0));
  if (typeof updateCartCounter === 'function') updateCartCounter();
}

// ══════════════════════════════
//  RÉCAPITULATIF
// ══════════════════════════════

function updateRecap(panier) {
  const sous = panier.reduce((s, i) => s + i.prix * i.qte, 0);
  const apresRemise = Math.round(sous * (1 - remise / 100));

  const { fee, bracket } = getMvolaFee(apresRemise);

  const elSous    = document.getElementById('sousTotal');
  const elFrais   = document.getElementById('fraisMvola');
  const elFraisNote = document.getElementById('fraisMvolaNote');
  const elTotal   = document.getElementById('totalFinal');
  const elEuro    = document.getElementById('totalEuro');
  const elAlerte  = document.getElementById('alerteHorsGrille');
  const btnCommander = document.getElementById('btnCommander');

  if (elSous) elSous.textContent = sous.toLocaleString('fr-FR') + ' Fc';

  if (fee === null) {
    // Montant hors grille (> 1 000 000 Fc)
    if (elFrais) elFrais.textContent = '—';
    if (elFraisNote) elFraisNote.textContent = '';
    if (elTotal) elTotal.textContent = '—';
    if (elEuro) elEuro.textContent = '';
    if (elAlerte) elAlerte.style.display = 'flex';
    if (btnCommander) btnCommander.disabled = true;
  } else {
    const total = apresRemise + fee;
    const euro = (total / TAUX).toFixed(0);

    if (elFrais) elFrais.textContent = fee.toLocaleString('fr-FR') + ' Fc';
    if (elFraisNote) {
      elFraisNote.textContent = bracket
        ? `Palier ${bracket.min.toLocaleString('fr-FR')} – ${bracket.max.toLocaleString('fr-FR')} Fc`
        : '';
    }
    if (elTotal) elTotal.textContent = total.toLocaleString('fr-FR') + ' Fc';
    if (elEuro) elEuro.textContent = `≈ ${euro} €`;
    if (elAlerte) elAlerte.style.display = 'none';
    if (btnCommander) btnCommander.disabled = panier.length === 0;
  }
}

function updateBadge(count) {
  const badge = document.getElementById('bannerCount');
  if (badge) badge.textContent = `${count} article${count !== 1 ? 's' : ''}`;
}

// ══════════════════════════════
//  ACTIONS
// ══════════════════════════════

function changerQte(index, delta) {
  const panier = getPanier();
  panier[index].qte = Math.max(1, panier[index].qte + delta);
  savePanier(panier);
  renderPanier();
}

function supprimerItem(index) {
  const panier = getPanier();
  const nom = panier[index].nom;
  panier.splice(index, 1);
  savePanier(panier);
  renderPanier();
  showToast(`🗑️ "${nom}" retiré du panier`);
}

function viderPanier() {
  if (!confirm('Vider tout le panier ?')) return;
  savePanier([]);
  renderPanier();
  showToast('🗑️ Panier vidé');
}

// ══════════════════════════════
//  CODE PROMO
// ══════════════════════════════

function appliquerPromo() {
  const code = document.getElementById('promoInput').value.trim().toUpperCase();
  const msg  = document.getElementById('promoMsg');

  if (PROMOS[code]) {
    remise = PROMOS[code];
    msg.className = 'promo-msg promo-ok';
    msg.textContent = `✅ Code "${code}" appliqué — ${remise}% de réduction !`;
    updateRecap(getPanier());
    showToast(`🎉 Réduction de ${remise}% appliquée !`);
  } else {
    msg.className = 'promo-msg promo-err';
    msg.textContent = '❌ Code promo invalide.';
  }
}

// ══════════════════════════════
//  COMMANDER
// ══════════════════════════════

function commander() {
  const panier = getPanier();
  if (!panier.length) return;

  const sous = panier.reduce((s, i) => s + i.prix * i.qte, 0);
  const apresRemise = Math.round(sous * (1 - remise / 100));

  const { fee } = getMvolaFee(apresRemise);
  if (fee === null) return; // montant hors grille, on ne laisse pas commander

  const total = apresRemise + fee;

  localStorage.setItem('adshop_total', total);
  localStorage.setItem('adshop_frais_mvola', fee);
  window.location.href = 'mvola.html';
}

function fermerModal() {
  document.getElementById('modalOverlay').classList.remove('visible');
  savePanier([]);
  renderPanier();
  window.location.href = 'index.html';
}

// ══════════════════════════════
//  TOAST
// ══════════════════════════════

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// ══════════════════════════════
//  FONCTION GLOBALE : ajouterAuPanier
//  Appelée depuis les pages produit
// ══════════════════════════════

window.ajouterAuPanier = function({ nom, prix, img, couleur, taille }) {
  const panier = getPanier();

  // Chercher si l'article existe déjà (même nom + couleur + taille)
  const existe = panier.find(
    i => i.nom === nom && i.couleur === couleur && i.taille === taille
  );

  if (existe) {
    existe.qte += 1;
  } else {
    panier.push({ nom, prix, img, couleur: couleur || '', taille: taille || '', qte: 1 });
  }

  savePanier(panier);
};

// ══════════════════════════════
//  INIT
// ══════════════════════════════

document.addEventListener('DOMContentLoaded', renderPanier);
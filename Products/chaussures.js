/* =============================================
   AD SHOP — chaussures.js
   - Filtres par marque
   - Toast panier
   ============================================= */

// ── FILTRES ──
function filterCards(btn, cat) {
  // Mettre à jour le bouton actif
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  // Afficher / masquer les cartes
  const cards = document.querySelectorAll('.one2');
  cards.forEach((card, i) => {
    const match = cat === 'all' || card.dataset.cat === cat;
    if (match) {
      card.style.display = 'flex';
      // Petite animation d'entrée
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 40);
    } else {
      card.style.display = 'none';
    }
  });
}

// ── TOAST PANIER ──
function showToast(event) {
  event.preventDefault(); // empêche la navigation sur href="#"
  const toast = document.getElementById('toast');
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

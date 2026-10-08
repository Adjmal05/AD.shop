/* =============================================
   AD SHOP — produit.js
   ============================================= */

// ── FILTRER LES PRODUITS ──
function filtrerProduits(query) {
  const q = query.trim().toLowerCase();

  document.querySelectorAll('.one2').forEach(card => {
    const nom = card.querySelector('.one2-titre')?.textContent.toLowerCase() || '';
    card.style.display = (q === '' || nom.includes(q)) ? 'flex' : 'none';
  });

  document.querySelectorAll('.one3').forEach(card => {
    const nom = card.querySelector('.one3-titre')?.textContent.toLowerCase() || '';
    card.style.display = (q === '' || nom.includes(q)) ? 'flex' : 'none';
  });

  document.querySelectorAll('.one').forEach(card => {
    const nom = card.querySelector('h2')?.textContent.toLowerCase() || '';
    card.style.display = (q === '' || nom.includes(q)) ? 'flex' : 'none';
  });
}

// ── FLÈCHES CARROUSEL ──
const btnG = document.getElementById('btnGauche');
const btnD = document.getElementById('btnDroite');

if (btnG && btnD) {
  btnG.addEventListener('click', () => {
    document.getElementById('carrousel').scrollBy({ left: -220, behavior: 'smooth' });
  });
  btnD.addEventListener('click', () => {
    document.getElementById('carrousel').scrollBy({ left: 220, behavior: 'smooth' });
  });
}

// ── PHOTOS RONDES CLIQUABLES (même lien que le nom) ──
document.querySelectorAll('.poid1').forEach(item => {
  const lien = item.querySelector('a');
  const img = item.querySelector('img');
  if (!lien || !img) return;

  img.addEventListener('click', () => {
    const href = lien.getAttribute('href');
    if (href && href.trim() !== '') {
      window.location.href = href;
    }
  });
});
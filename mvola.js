/* ═══════════════════════════════════════════
   AD SHOP — mvola.js
   Logique page paiement Mvola
   Charger APRÈS panier.js
═══════════════════════════════════════════ */

const EJS_SERVICE  = 'service_tntj6kf';
const EJS_TEMPLATE = 'template_hyjsnud';
const EJS_PUBLIC   = 'kkhG9zr1it2395kww';
const EMAIL_TO     = 'drimsofficiel7@gmail.com';
const WHATSAPP     = '261342070787';
const TAUX_MV      = 500;

document.addEventListener('DOMContentLoaded', () => {
  const total = parseInt(localStorage.getItem('adshop_total') || '0');
  const euro  = (total / TAUX_MV).toFixed(0);

  const elAr = document.getElementById('mv-montant-ar');
  const elEu = document.getElementById('mv-montant-eu');
  const elTot = document.getElementById('mv-total-display');

  if (elAr)  elAr.textContent  = total.toLocaleString('fr-FR') + ' Ar';
  if (elEu)  elEu.textContent  = '≈ ' + euro + ' €';
  if (elTot) elTot.innerHTML   = total.toLocaleString('fr-FR') + ' Ar';
});

function copyNumero() {
  navigator.clipboard.writeText('0342070787').then(() => {
    toast('📋 Numéro copié !');
  });
}

function confirmerPaiement() {
  const nom     = document.getElementById('client-nom').value.trim();
  const tel     = document.getElementById('client-tel').value.trim();
  const adresse = document.getElementById('client-adresse').value.trim();
  const ref     = document.getElementById('ref-transaction').value.trim();

  if (!nom || !tel || !adresse || !ref) {
    toast('⚠️ Remplis tous les champs avant de confirmer.');
    return;
  }

  const btn = document.getElementById('mv-btn-confirm');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi en cours...';

  const panier = typeof getPanier === 'function' ? getPanier() : [];
  const total  = parseInt(localStorage.getItem('adshop_total') || '0');
  const euro   = (total / TAUX_MV).toFixed(0);

  const lignes = panier.map(i =>
    `• ${i.nom}${i.couleur ? ' | '+i.couleur : ''}${i.taille ? ' | '+i.taille : ''} — Qté: ${i.qte} — ${(i.prix*i.qte).toLocaleString('fr-FR')} Fc`
  ).join('\n');

  const params = {
    to_email:    EMAIL_TO,
    client_nom:  nom,
    client_tel:  tel,
    client_adr:  adresse,
    ref_mvola:   ref,
    articles:    lignes || '(aucun article enregistré)',
    total_fc:    total.toLocaleString('fr-FR') + ' Fc',
    total_euro:  euro + ' €',
    date:        new Date().toLocaleString('fr-FR'),
  };

  afficherSucces(nom, tel, total, euro, ref);

  if (typeof emailjs !== 'undefined') {
    emailjs.init(EJS_PUBLIC);
    emailjs.send(EJS_SERVICE, EJS_TEMPLATE, params)
      .then(() => console.log('✅ Email envoyé'))
      .catch(err => console.error('❌ EmailJS:', err));
  }

  if (typeof savePanier === 'function') savePanier([]);
  localStorage.removeItem('adshop_total');
}

function afficherSucces(nom, tel, total, euro, ref) {
  const el = document.getElementById('mv-modal-detail');
  if (el) {
    el.innerHTML =
      `<strong>${nom}</strong><br>` +
      `📞 ${tel}<br>` +
      `💰 ${total.toLocaleString('fr-FR')} Fc — ${euro} €<br>` +
      `🔖 Réf: ${ref}`;
  }
  document.getElementById('mv-modal').classList.add('visible');
}

function ouvrirWhatsApp() {
  const total = parseInt(localStorage.getItem('adshop_total') || '0') || 0;
  const msg = encodeURIComponent(
    `Bonjour AD Shop 👋\nJe viens de confirmer ma commande.\n` +
    `💰 Total payé via Mvola\n` +
    `Merci de confirmer ma livraison !`
  );
  window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
  window.location.href = 'index.html';
}

function toast(msg) {
  const t = document.getElementById('mv-toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

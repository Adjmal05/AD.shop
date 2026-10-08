/* ═══════════════════════════════════════════
   AD SHOP — contact.js
   Formulaire de contact → WhatsApp
═══════════════════════════════════════════ */

const btnEnvoyer = document.querySelector('.btn-envoyer');

btnEnvoyer.addEventListener('click', () => {
  const nom     = document.querySelectorAll('.form-group input')[0].value.trim();
  const prenom  = document.querySelectorAll('.form-group input')[1].value.trim();
  const email   = document.querySelectorAll('.form-group input')[2].value.trim();
  const sujet   = document.querySelector('.form-group select').value;
  const message = document.querySelector('.form-group textarea').value.trim();

  if (!nom || !prenom || !email || !sujet || !message) {
    toast('⚠️ Remplis tous les champs obligatoires.', 'erreur');
    return;
  }

  if (!email.includes('@')) {
    toast('⚠️ Adresse email invalide.', 'erreur');
    return;
  }

  const msg = encodeURIComponent(
    `Bonjour AD Shop 👋\n\n` +
    `👤 Nom : ${nom} ${prenom}\n` +
    `📧 Email : ${email}\n` +
    `📌 Sujet : ${sujet}\n\n` +
    `💬 Message :\n${message}`
  );

  window.open(`https://wa.me/261342070787?text=${msg}`, '_blank');
  toast('✅ Redirection vers WhatsApp...', 'succes');
  resetForm();
});

function resetForm() {
  document.querySelectorAll('.form-group input').forEach(i => i.value = '');
  document.querySelector('.form-group textarea').value = '';
  document.querySelector('.form-group select').value = '';
}

// ══════════════════════════════
//  TOAST
// ══════════════════════════════
function toast(msg, type) {
  let t = document.getElementById('toast-contact');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast-contact';
    t.style.cssText = `
      position:fixed; bottom:28px; right:28px;
      padding:13px 22px; border-radius:12px;
      font-size:14px; font-weight:600;
      box-shadow:0 6px 24px rgba(0,0,0,0.28);
      z-index:9999; opacity:0;
      transform:translateY(60px);
      transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);
      pointer-events:none; font-family:'Poppins',sans-serif;
      max-width:calc(100vw - 40px); color:white;
    `;
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.background = type === 'succes' ? '#16a34a' : '#D62828';
  t.style.opacity = '1';
  t.style.transform = 'translateY(0)';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateY(60px)';
  }, 3500);
}
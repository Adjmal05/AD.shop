/* =============================================
   AD SHOP JS
   - Burger menu
   - Recherche navbar
   - Carrousel
============================================= */


// ── BURGER ──

const burger=document.getElementById('burger');
const dropdownMenu=document.getElementById('dropdown-menu');

if(burger&&dropdownMenu){

  burger.addEventListener('click',()=>{

    dropdownMenu.classList.toggle('open');
    burger.classList.toggle('active');

  });


  document.addEventListener('click',(e)=>{

    if(!burger.contains(e.target)&&!dropdownMenu.contains(e.target)){

      dropdownMenu.classList.remove('open');
      burger.classList.remove('active');

    }

  });

}



// ── DRAG SCROLL CAROUSEL ──

const tout=document.querySelector('.tout');

if(tout){

  let isDown=false;
  let startX;
  let scrollLeft;

  tout.addEventListener('mousedown',(e)=>{

    isDown=true;
    tout.style.cursor='grabbing';
    startX=e.pageX-tout.offsetLeft;
    scrollLeft=tout.scrollLeft;

  });


  tout.addEventListener('mouseleave',()=>{

    isDown=false;
    tout.style.cursor='grab';

  });


  tout.addEventListener('mouseup',()=>{

    isDown=false;
    tout.style.cursor='grab';

  });


  tout.addEventListener('mousemove',(e)=>{

    if(!isDown)return;

    e.preventDefault();

    const x=e.pageX-tout.offsetLeft;
    const walk=(x-startX)*2;

    tout.scrollLeft=scrollLeft-walk;

  });

}



// ── FLECHES CARROUSEL ──

const btnGauche=document.getElementById('btnGauche');
const btnDroite=document.getElementById('btnDroite');

if(btnGauche&&btnDroite){

  btnGauche.addEventListener('click',()=>{

    document.getElementById('carrousel').scrollBy({
      left:-220,
      behavior:'smooth'
    });

  });


  btnDroite.addEventListener('click',()=>{

    document.getElementById('carrousel').scrollBy({
      left:220,
      behavior:'smooth'
    });

  });

}



// ── RECHERCHE ──

function toggleSearch(){

  const box=document.getElementById('nav-search-box');
  const input=document.getElementById('nav-search-input');

  box.classList.toggle('open');

  if(box.classList.contains('open')){

    input.focus();

  }

}


function lancerRecherche(){

  const input=document.getElementById('nav-search-input');
  const q=input.value.trim();

  if(q){

    window.location.href=`recherche.html?q=${encodeURIComponent(q)}`;

  }else{

    window.location.href='recherche.html';

  }

}


document.addEventListener('DOMContentLoaded',()=>{

  const input=document.getElementById('nav-search-input');

  if(input){

    input.addEventListener('keydown',(e)=>{

      if(e.key==='Enter')lancerRecherche();

    });

  }

});

// ── PANIER — utilitaires partagés ──

function getPanier(){
  return JSON.parse(localStorage.getItem('adshop_panier')||'[]');
}

function savePanier(panier){
  localStorage.setItem('adshop_panier',JSON.stringify(panier));
}


// ── Compteur panier navbar ──

function updateCartCounter(){

  const panier=getPanier();
  const total=panier.reduce((s,i)=>s+i.qte,0);

  document.querySelectorAll('.cart-counter').forEach(el=>{

    el.textContent=total;
    el.style.display=total>0?'inline-flex':'none';

  });

}


// ── Ajouter au panier ──

window.ajouterAuPanier=function({nom,prix,img,couleur,taille}){

  const panier=getPanier();

  const existe=panier.find(i=>
    i.nom===nom &&
    i.couleur===couleur &&
    i.taille===taille
  );


  if(existe){

    existe.qte+=1;

  }else{

    panier.push({
      nom,
      prix,
      img,
      couleur:couleur||'',
      taille:taille||'',
      qte:1
    });

  }


  savePanier(panier);
  updateCartCounter();
  updateBadge();
  showCartToast(nom);

};


// ── Toast panier ──

function showCartToast(nom){

  let toast=document.getElementById('toast');

  if(!toast){

    toast=document.createElement('div');
    toast.id='toast';

    toast.style.cssText=`
      position:fixed;
      bottom:28px;
      right:28px;
      background:#111827;
      color:white;
      padding:13px 22px;
      border-radius:10px;
      font-size:.9rem;
      font-weight:600;
      box-shadow:0 6px 24px rgba(0,0,0,.28);
      z-index:9999;
      opacity:0;
      transform:translateY(60px);
      transition:.35s;
      pointer-events:none;
    `;

    document.body.appendChild(toast);

  }


  toast.textContent=`🛒 "${nom}" ajouté au panier !`;
  toast.style.opacity='1';
  toast.style.transform='translateY(0)';


  clearTimeout(toast._timer);

  toast._timer=setTimeout(()=>{

    toast.style.opacity='0';
    toast.style.transform='translateY(60px)';

  },2500);

}



// ── Boutons acheter ──

document.addEventListener('DOMContentLoaded',()=>{

  updateCartCounter();


  document.querySelectorAll(
    '.one a,.one2 a,.one3 a,.one2-btn,.one3-btn'
  ).forEach(btn=>{


    const href=btn.getAttribute('href');

    if(href&&href!==''&&href!=='#'&&!href.startsWith('javascript'))return;


    btn.addEventListener('click',(e)=>{

      e.preventDefault();


      const card=btn.closest('.one,.one2,.one3');

      if(!card)return;


      const titreEl=
      card.querySelector('.one2-titre')||
      card.querySelector('.one3-titre')||
      card.querySelector('h2');


      const nom=titreEl?
      titreEl.textContent.trim():
      'Produit';


      const prixEl=
      card.querySelector('.one2-prix')||
      card.querySelector('.one3-prix')||
      card.querySelectorAll('h2')[1];


      let prix=0;


      if(prixEl){

        const match=prixEl.textContent
        .replace(/\s/g,'')
        .match(/(\d+)/);

        if(match)prix=parseInt(match[1]);

      }


      const imgEl=card.querySelector('img');
      const img=imgEl?imgEl.src:'';


      let couleur='';
      let taille='';


      card.querySelectorAll('select').forEach(sel=>{

        const val=sel.value;

        if(!val)return;

        const placeholder=
        sel.options[0].textContent.toLowerCase();


        if(placeholder.includes('couleur')){

          couleur=val;

        }else{

          taille=val;

        }

      });


      ajouterAuPanier({
        nom,
        prix,
        img,
        couleur,
        taille
      });


    });


  });


});

// ── BADGE PANIER MOBILE ──

function updateBadge(){

  const badge=document.getElementById('bn-cart-count');

  if(!badge)return;


  const panier=getPanier();
  const total=panier.reduce((s,i)=>s+i.qte,0);


  if(total>0){

    badge.textContent=total>99?'99+':total;
    badge.style.display='flex';

  }else{

    badge.style.display='none';

  }

}




// ── NAVIGATION ACTIVE MOBILE ──

document.addEventListener('DOMContentLoaded',()=>{


  const path=window.location.pathname;
  const page=path.split('/').pop()||'index.html';


  const map={

    'index.html':'bn-accueil',
    'produit.html':'bn-produit',
    'panier.html':'bn-panier',
    'contact.html':'bn-contact',
    'chaussures.html':'bn-produit',
    'mvola.html':'bn-panier'

  };


  const activeId=map[page];


  if(activeId){

    const el=document.getElementById(activeId);

    if(el)el.classList.add('active');

  }


  updateBadge();


  window.addEventListener('storage',updateBadge);


  const original=window.ajouterAuPanier;


  if(original){

    window.ajouterAuPanier=function(params){

      original(params);
      updateBadge();

    };

  }


});




// ── COMPTEUR VISITEURS EN LIGNE ──
// Firebase à connecter avec ton projet


function updateVisitorCount(){

  const count=document.getElementById('visitor-count');

  if(!count)return;


  // Exemple temporaire
  // Remplace cette partie avec Firebase Realtime Database

  if(!localStorage.getItem('visitor')){

    localStorage.setItem('visitor','true');

  }


}



// ── INITIALISATION ──

document.addEventListener('DOMContentLoaded',()=>{

  updateCartCounter();
  updateBadge();
  updateVisitorCount();

});

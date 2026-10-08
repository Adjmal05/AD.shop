import { db } from "./firebase.js";

import {
    ref,
    set,
    remove,
    onValue,
    onDisconnect
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

// ID unique du visiteur
const visitorId = Math.random().toString(36).substring(2);

// Référence
const visitorRef = ref(db, "online/" + visitorId);

// Ajouter le visiteur
set(visitorRef, true);

// Supprimer automatiquement lorsqu'il quitte le site
onDisconnect(visitorRef).remove();

// Compteur
const onlineRef = ref(db, "online");

onValue(onlineRef, (snapshot) => {

    const data = snapshot.val();

    let total = 0;

    if (data) {
        total = Object.keys(data).length;
    }

    document.getElementById("visitor-count").textContent = total;

});
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBthfeuVfWG1vouVaFWzvuUss2pFeRCxMw",
    authDomain: "adshop-6f51d.firebaseapp.com",
    databaseURL: "https://adshop-6f51d-default-rtdb.firebaseio.com/",
    projectId: "adshop-6f51d",
    storageBucket: "adshop-6f51d.firebasestorage.app",
    messagingSenderId: "441819690689",
    appId: "1:441819690689:web:649d34252bad5d639ec640"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
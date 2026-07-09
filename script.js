// ============================================
// INITIALISATION
// ============================================

// Données de base
const defaultPassword = 'admin123';
let currentUser = null;
let clients = [];
let operations = [];

// Charger les données au démarrage
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setDefaultDateToday();
    setupEventListeners();
    
    // Si l'utilisateur est connecté, afficher le tableau de bord
    if (currentUser) {
        showScreen('dashboardScreen');
    } else {
        showScreen('loginScreen');
    }
});

// ============================================
// GESTION DU STOCKAGE (LocalStorage)
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('operations', JSON.stringify(operations));
    localStorage.setItem('password', defaultPassword);
}

function loadFromLocalStorage() {
    const savedClients = localStorage.getItem('clients');
    const savedOperations = localStorage.getItem('operations');
    
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedOperations) operations = JSON.parse(savedOperations);
}

// ============================================
// GESTION DES ÉCRANS
// ============================================

function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// ============================================
// CONNEXION
// ============================================

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('loginError');
    
    if (password === defaultPassword) {
        currentUser = username;
        localStorage.setItem('currentUser', username);
        document.getElementById('loginForm').reset();
        errorElement.textContent = '';
        showScreen('dashboardScreen');
    } else {
        errorElement.textContent = '❌ Mot de passe incorrect!';
    }
});

document.getElementById('logoutBtn').addEventListener('

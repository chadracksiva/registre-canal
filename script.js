// ============================================
// INITIALISATION
// ============================================

const defaultPassword = 'admin123';
let currentUser = null;
let clients = [];
let operations = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setDefaultDateToday();
    setupEventListeners();
    
    if (currentUser) {
        showScreen('dashboardScreen');
    } else {
        showScreen('loginScreen');
    }
});

// ============================================
// GESTION DU STOCKAGE
// ============================================

function saveToLocalStorage() {
    localStorage.setItem('clients', JSON.stringify(clients));
    localStorage.setItem('operations', JSON.stringify(operations));
}

function loadFromLocalStorage() {
    const savedClients = localStorage.getItem('clients');
    const savedOperations = localStorage.getItem('operations');
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedClients) clients = JSON.parse(savedClients);
    if (savedOperations) operations = JSON.parse(savedOperations);
    if (savedUser) currentUser = savedUser;
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
// ÉVÉNEMENTS - CONNEXION
// ============================================

function setupEventListeners() {
    // Connexion
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    
    // Navigation tableau de bord
    document.getElementById('registreBtn').addEventListener('click', () => {
        showScreen('registreScreen');
        updateRegistreStats();
    });
    
    document.getElementById('comptabiliteBtn').addEventListener('click', () => {
        showScreen('comptabiliteScreen');
        updateComptabiliteStats();
    });
    
    document.getElementById('statistiquesBtn').addEventListener('click', () => {
        showScreen('statistiquesScreen');
        updateStatistiques();
    });
    
    document.getElementById('parametresBtn').addEventListener('click', () => {
        showScreen('parametresScreen');
    });
    
    // Retour
    document.getElementById('backFromRegistre').addEventListener('click', () => showScreen('dashboardScreen'));
    document.getElementById('backFromComptabilite').addEventListener('click', () => showScreen('dashboardScreen'));
    document.getElementById('backFromStatistiques').addEventListener('click', () => showScreen('dashboardScreen'));
    document.getElementById('backFromParametres').addEventListener('click', () => showScreen('dashboardScreen'));
    
    // Registre
    document.getElementById('newSubscriptionBtn').addEventListener('click', openSubscriptionModal);
    document.getElementById('closeModal').addEventListener('click', closeSubscriptionModal);
    document.getElementById('cancelModal').addEventListener('click', closeSubscriptionModal);
    document.getElementById('subscriptionForm').addEventListener('submit', handleSubscriptionSubmit);
    document.getElementById('searchClients').addEventListener('input', filterClients);
    
    // Comptabilité
    document.getElementById('newOperationBtn').addEventListener('click', openOperationModal);
    document.getElementById('closeOperationModal').addEventListener('click', closeOperationModal);
    document.getElementById('cancelOperationModal').addEventListener('click', closeOperationModal);
    document.getElementById('operationForm').addEventListener('submit', handleOperationSubmit);
    
    // Paramètres
    document.getElementById('changePasswordBtn').addEventListener('click', handleChangePassword);
    document.getElementById('backupBtn').addEventListener('click', handleBackup);
    document.getElementById('restoreBtn').addEventListener('click', () => {
        document.getElementById('restoreFile').click();
    });
    document.getElementById('restoreFile').addEventListener('change', handleRestore);
    document.getElementById('clearDataBtn').addEventListener('click', handleClearData);
}

// ============================================
// CONNEXION / DÉCONNEXION
// ============================================

function handleLogin(e) {
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
}

function handleLogout() {
    if (confirm('Êtes-vous sûr de vouloir vous déconnecter?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        document.getElementById('loginForm').reset();
        showScreen('loginScreen');
    }
}

// ============================================
// REGISTRE CANAL+
// ============================================

function openSubscriptionModal(editId = null) {
    const modal = document.getElementById('subscriptionModal');
    const form = document.getElementById('subscriptionForm');
    const modalTitle = document.getElementById('modalTitle');
    
    if (editId) {
        const client = clients.find(c => c.id === editId);
        document.getElementById('clientName').value = client.name;
        document.getElementById('clientPhone').value = client.phone;
        document.getElementById('decoderNumber').value = client.decoder;
        document.getElementById('startDate').value = client.startDate;
        document.getElementById('duration').value = client.duration;
        modalTitle.textContent = 'Modifier abonnement';
        form.dataset.editId = editId;
    } else {
        form.reset();
        modalTitle.textContent = 'Nouvel abonnement';
        delete form.dataset.editId;
        document.getElementById('startDate').valueAsDate = new Date();
    }
    
    modal.classList.add('active');
}

function closeSubscriptionModal() {
    document.getElementById('subscriptionModal').classList.remove('active');
    document.getElementById('subscriptionForm').reset();
}

function handleSubscriptionSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const decoder = document.getElementById('decoderNumber').value;
    const startDate = document.getElementById('startDate').value;
    const duration = parseInt(document.getElementById('duration').value);
    
    const endDate = addDays(new Date(startDate), duration);
    
    const editId = this.dataset.editId;
    
    if (editId) {
        const index = clients.findIndex(c => c.id === editId);
        clients[index] = {
            id: editId,
            name,
            phone,
            decoder,
            startDate,
            endDate: endDate.toISOString().split('T')[0],
            duration
        };
    } else {
        clients.push({
            id: Date.now(),
            name,
            phone,
            decoder,
            startDate,
            endDate: endDate.toISOString().split('T')[0],
            duration
        });
    }
    
    saveToLocalStorage();
    closeSubscriptionModal();
    updateRegistreTable();
    updateRegistreStats();
}

function updateRegistreTable() {
    const tbody = document.getElementById('clientsTableBody');
    tbody.innerHTML = '';
    
    const filtered = clients.filter(client => {
        const search = document.getElementById('searchClients').value.toLowerCase();
        return client.name.toLowerCase().includes(search) || 
               client.phone.includes(search);
    });
    
    filtered.forEach(client => {
        const status = getSubscriptionStatus(client.endDate);
        const statusClass = status === 'Actif' ? 'status-actif' : 
                           status === 'Expire bientôt' ? 'status-expiration' : 
                           'status-expire';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${client.name}</td>
            <td>${client.phone}</td>
            <td>${client.decoder}</td>
            <td>${formatDate(client.startDate)}</td>
            <td>${formatDate(client.endDate)}</td>
            <td><span class="status-badge ${statusClass}">${status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-secondary" onclick="openSubscriptionModal(${client.id})">✏️</button>
                    <button class="btn btn-small btn-danger" onclick="deleteClient(${client.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function deleteClient(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce client?')) {
        clients = clients.filter(c => c.id !== id);
        saveToLocalStorage();
        updateRegistreTable();
        updateRegistreStats();
    }
}

function filterClients() {
    updateRegistreTable();
}

function updateRegistreStats() {
    const active = clients.filter(c => getSubscriptionStatus(c.endDate) === 'Actif').length;
    const expired = clients.filter(c => getSubscriptionStatus(c.endDate) === 'Expiré').length;
    
    document.getElementById('totalClients').textContent = clients.length;
    document.getElementById('activeSubscriptions').textContent = active;
    document.getElementById('expiredSubscriptions').textContent = expired;
    
    updateRegistreTable();
}

function getSubscriptionStatus(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expiré';
    if (diffDays <= 7) return 'Expire bientôt';
    return 'Actif';
}

// ============================================
// COMPTABILITÉ
// ============================================

function openOperationModal(editId = null) {
    const modal = document.getElementById('operationModal');
    const form = document.getElementById('operationForm');
    
    if (editId) {
        const operation = operations.find(o => o.id === editId);
        document.getElementById('operationDate').value = operation.date;
        document.getElementById('operationType').value = operation.type;
        document.getElementById('operationCategory').value = operation.category;
        document.getElementById('operationDescription').value = operation.description;
        document.getElementById('operationAmount').value = operation.amount;
        document.getElementById('operationPerson').value = operation.person || '';
        document.getElementById('operationObservations').value = operation.observations || '';
        form.dataset.editId = editId;
    } else {
        form.reset();
        document.getElementById('operationDate').valueAsDate = new Date();
        delete form.dataset.editId;
    }
    
    modal.classList.add('active');
}

function closeOperationModal() {
    document.getElementById('operationModal').classList.remove('active');
    document.getElementById('operationForm').reset();
}

function handleOperationSubmit(e) {
    e.preventDefault();
    
    const date = document.getElementById('operationDate').value;
    const type = document.getElementById('operationType').value;
    const category = document.getElementById('operationCategory').value;
    const description = document.getElementById('operationDescription').value;
    const amount = parseFloat(document.getElementById('operationAmount').value);
    const person = document.getElementById('operationPerson').value;
    const observations = document.getElementById('operationObservations').value;
    
    const editId = this.dataset.editId;
    
    if (editId) {
        const index = operations.findIndex(o => o.id === editId);
        operations[index] = {
            id: editId,
            date, type, category, description, amount, person, observations
        };
    } else {
        operations.push({
            id: Date.now(),
            date, type, category, description, amount, person, observations
        });
    }
    
    saveToLocalStorage();
    closeOperationModal();
    updateComptabiliteTable();
    updateComptabiliteStats();
}

function deleteOperation(id) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette opération?')) {
        operations = operations.filter(o => o.id !== id);
        saveToLocalStorage();
        updateComptabiliteTable();
        updateComptabiliteStats();
    }
}

function updateComptabiliteTable() {
    const tbody = document.getElementById('operationsTableBody');
    tbody.innerHTML = '';
    
    operations.sort((a, b) => new Date(b.date) - new Date(a.date)).forEach(op => {
        const row = document.createElement('tr');
        const amountClass = op.type === 'Entrée' ? 'positive' : 'negative';
        const amountPrefix = op.type === 'Entrée' ? '+' : '-';
        
        row.innerHTML = `
            <td>${formatDate(op.date)}</td>
            <td>${op.type}</td>
            <td>${op.category}</td>
            <td>${op.description}</td>
            <td class="${amountClass}">${amountPrefix}${op.amount.toFixed(2)} MAD</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-small btn-secondary" onclick="openOperationModal(${op.id})">✏️</button>
                    <button class="btn btn-small btn-danger" onclick="deleteOperation(${op.id})">🗑️</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateComptabiliteStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const entreeDay = operations
        .filter(o => o.date === today && o.type === 'Entrée')
        .reduce((sum, o) => sum + o.amount, 0);
    
    const retraitDay = operations
        .filter(o => o.date === today && o.type === 'Retrait')
        .reduce((sum, o) => sum + o.amount, 0);
    
    const soldeDay = entreeDay - retraitDay;
    
    const soldeGeneral = operations.reduce((sum, o) => {
        return sum + (o.type === 'Entrée' ? o.amount : -o.amount);
    }, 0);
    
    document.getElementById('entreeDay').textContent = entreeDay.toFixed(2) + ' MAD';
    document.getElementById('retraitDay').textContent = retraitDay.toFixed(2) + ' MAD';
    document.getElementById('soldeDay').textContent = soldeDay.toFixed(2) + ' MAD';
    document.getElementById('soldeGeneral').textContent = soldeGeneral.toFixed(2) + ' MAD';
    
    updateComptabiliteTable();
}

// ============================================
// STATISTIQUES
// ============================================

function updateStatistiques() {
    const active = clients.filter(c => getSubscriptionStatus(c.endDate) === 'Actif').length;
    const expired = clients.filter(c => getSubscriptionStatus(c.endDate) === 'Expiré').length;
    
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);
    
    const revenueDay = operations
        .filter(o => o.date === today && o.type === 'Entrée')
        .reduce((sum, o) => sum + o.amount, 0);
    
    const revenueMonth = operations
        .filter(o => o.date.startsWith(currentMonth) && o.type === 'Entrée')
        .reduce((sum, o) => sum + o.amount, 0);
    
    const expensesMonth = operations
        .filter(o => o.date.startsWith(currentMonth) && o.type === 'Retrait')
        .reduce((sum, o) => sum + o.amount, 0);
    
    const balance = operations.reduce((sum, o) => {
        return sum + (o.type === 'Entrée' ? o.amount : -o.amount);
    }, 0);
    
    document.getElementById('statTotalClients').textContent = clients.length;
    document.getElementById('statActiveSubscriptions').textContent = active;
    document.getElementById('statExpiredSubscriptions').textContent = expired;
    document.getElementById('statRevenueDay').textContent = revenueDay.toFixed(2) + ' MAD';
    document.getElementById('statRevenueMonth').textContent = revenueMonth.toFixed(2) + ' MAD';
    document.getElementById('statExpensesMonth').textContent = expensesMonth.toFixed(2) + ' MAD';
    document.getElementById('statCurrentBalance').textContent = balance.toFixed(2) + ' MAD';
}

// ============================================
// PARAMÈTRES
// ============================================

function handleChangePassword() {
    const newPassword = document.getElementById('newPassword').value;
    
    if (!newPassword) {
        alert('Entrez un nouveau mot de passe!');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('Le mot de passe doit avoir au moins 4 caractères!');
        return;
    }
    
    const currentPassword = prompt('Entrez le mot de passe actuel:');
    
    if (currentPassword !== defaultPassword) {
        alert('Mot de passe incorrect!');
        return;
    }
    
    // Dans une vraie app, il faudrait stocker ça de manière sécurisée
    // Pour cette version simple, on l'affiche juste
    alert('Nouveau mot de passe défini: ' + newPassword + '\n\n(Note: Dans une vraie app, il faudrait le sauvegarder de manière sécurisée)');
    document.getElementById('newPassword').value = '';
}

function handleBackup() {
    const data = {
        clients,
        operations,
        date: new Date().toLocaleString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sauvegarde-canal-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

function handleRestore(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            clients = data.clients || [];
            operations = data.operations || [];
            saveToLocalStorage();
            alert('✅ Sauvegarde restaurée avec succès!');
        } catch (error) {
            alert('❌ Erreur lors de la restauration!');
        }
    };
    reader.readAsText(file);
}

function handleClearData() {
    if (confirm('⚠️ Êtes-vous VRAIMENT sûr? Cela supprimera TOUTES les données!')) {
        if (confirm('Dernière confirmation: Supprimer toutes les données?')) {
            clients = [];
            operations = [];
            saveToLocalStorage();
            alert('✅ Toutes les données ont été supprimées!');
        }
    }
}

// ============================================
// UTILITAIRES
// ============================================

function setDefaultDateToday() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').valueAsDate = new Date();
    document.getElementById('operationDate').valueAsDate = new Date();
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
}

function addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

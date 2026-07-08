// Récupération des éléments
const form = document.getElementById("clientForm");
const tableBody = document.getElementById("clientTableBody");

let clients = JSON.parse(localStorage.getItem("clients")) || [];

// Afficher les clients
function afficherClients() {
    tableBody.innerHTML = "";

    clients.forEach((client, index) => {
        const ligne = document.createElement("tr");

        ligne.innerHTML = `
            <td>${client.nom}</td>
            <td>${client.telephone}</td>
            <td>${client.bouquet}</td>
            <td>${client.code}</td>
            <td>
                <button onclick="supprimerClient(${index})">
                    Supprimer
                </button>
            </td>
        `;

        tableBody.appendChild(ligne);
    });
}

// Ajouter un client
form.addEventListener("submit", function(e) {
    e.preventDefault();

    const nom = document.getElementById("nom").value;
    const telephone = document.getElementById("telephone").value;
    const bouquet = document.getElementById("bouquet").value;
    const code = document.getElementById("code").value;

    const nouveauClient = {
        nom: nom,
        telephone: telephone,
        bouquet: bouquet,
        code: code
    };

    clients.push(nouveauClient);

    localStorage.setItem("clients", JSON.stringify(clients));

    afficherClients();

    form.reset();
});

// Supprimer un client
function supprimerClient(index) {
    clients.splice(index, 1);
    localStorage.setItem("clients", JSON.stringify(clients));
    afficherClients();
}

// Chargement initial
afficherClients();

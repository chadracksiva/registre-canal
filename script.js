const form = document.getElementById("clientForm");
const listeClients = document.getElementById("listeClients");
const recherche = document.getElementById("recherche");
const compteur = document.getElementById("compteur");

let clients = [];


// Ajouter un client
form.addEventListener("submit", function(event) {

    event.preventDefault();

    let nom = document.getElementById("nom").value;
    let telephone = document.getElementById("telephone").value;
    let bouquet = document.getElementById("bouquet").value;
    let dateDebut = document.getElementById("dateDebut").value;


    let date = new Date(dateDebut);
    date.setMonth(date.getMonth() + 1);

    let dateFin = date.toISOString().split("T")[0];


    let client = {
        nom,
        telephone,
        bouquet,
        dateDebut,
        dateFin
    };


    clients.push(client);

    afficherClients();

    form.reset();

});


// Afficher les clients
function afficherClients(liste = clients) {

    listeClients.innerHTML = "";

    liste.forEach((client, index) => {

        let ligne = document.createElement("tr");

        ligne.innerHTML = `

            <td>${client.nom}</td>
            <td>${client.telephone}</td>
            <td>${client.bouquet}</td>
            <td>${client.dateDebut}</td>
            <td>${client.dateFin}</td>

            <td>
                <button onclick="imprimerFiche(${index})">
                    Imprimer
                </button>
            </td>

        `;

        listeClients.appendChild(ligne);

    });


    compteur.textContent = liste.length;

}


// Recherche d'un client
recherche.addEventListener("input", function() {

    let texte = recherche.value.toLowerCase();


    let resultat = clients.filter(client =>

        client.nom.toLowerCase().includes(texte) ||
        client.telephone.includes(texte)

    );


    afficherClients(resultat);

});


// Impression de la fiche client
function imprimerFiche(index) {

    let client = clients[index];


    let fiche = `
    
    REGISTRE CANAL+

    Nom : ${client.nom}
    Téléphone : ${client.telephone}
    Bouquet : ${client.bouquet}
    Date début : ${client.dateDebut}
    Date fin : ${client.dateFin}

    `;


    let fenetre = window.open("");

    fenetre.document.write("<pre>" + fiche + "</pre>");

    fenetre.print();

}

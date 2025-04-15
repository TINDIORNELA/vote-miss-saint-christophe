function openModal(name, imgSrc) {
    document.getElementById("modalImage").src = imgSrc;
    document.getElementById("modalName").textContent = name;
    document.getElementById("candidateInput").value = name;
    document.getElementById("voteModal").style.display = "block";
}

function closeModal() {
    document.getElementById("voteModal").style.display = "none";
}

// Ferme si on clique hors de la modale
window.onclick = function(event) {
    const modal = document.getElementById("voteModal");
    if (event.target === modal) {
        closeModal();
        function checkout() {
            console.log(11111111111)
            alert()
            CinetPay.setConfig({
                apikey: '194383593267fcb68d42c7a4.01104042',//   YOUR APIKEY
                site_id: '105892293',//YOUR_SITE_ID
                notify_url: 'http://mondomaine.com/notify/',
                mode: 'PRODUCTION'
            });
            console.log(11111111111)
            CinetPay.getCheckout({
                transaction_id: Math.floor(Math.random() * 100000000).toString(),
                amount: 100,
                currency: 'XAF',
                channels: 'ALL',
                description: 'Test de paiement',   
                 //Fournir ces variables pour le paiements par carte bancaire
                customer_name:"Joe",//Le nom du client
                customer_surname:"Down",//Le prenom du client
                customer_email: "down@test.com",//l'email du client
                customer_phone_number: "088767611",//l'email du client
                customer_address : "BP 0024",//addresse du client
                customer_city: "Antananarivo",// La ville du client
                customer_country : "CM",// le code ISO du pays
                customer_state : "CM",// le code ISO l'état
                customer_zip_code : "06510", // code postal

            });
            console.log(11111111111)
            CinetPay.waitResponse(function(data) {
                if (data.status == "REFUSED") {
                    if (alert("Votre paiement a échoué")) {
                        window.location.reload();
                    }
                } else if (data.status == "ACCEPTED") {
                    if (alert("Votre paiement a été effectué avec succès")) {
                        window.location.reload();
                    }
                }
            });
            CinetPay.onError(function(data) {
                console.log(data);
            });
        }
    }
}
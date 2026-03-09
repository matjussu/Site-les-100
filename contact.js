document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contact-form');
    const isOrderMode = new URLSearchParams(window.location.search).has('panier');

    // Animation des champs au focus
    const formInputs = document.querySelectorAll('.form-group input, .form-group select, .form-group textarea');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            gsap.to(this.parentElement, {
                y: -2,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        input.addEventListener('blur', function() {
            gsap.to(this.parentElement, {
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    });

    if (isOrderMode) {
        initOrderMode();
    }

    // Animation du bouton au clic
    form.addEventListener('submit', function(e) {
        if (isOrderMode) {
            localStorage.setItem('orderSubmitted', 'true');
        }

        const submitButton = form.querySelector('.submit-button');
        submitButton.classList.add('loading');

        const timeline = gsap.timeline({
            defaults: { duration: 0.3, ease: 'power2.inOut' }
        });

        timeline
            .to(submitButton, { width: '50px', borderRadius: '25px' })
            .to(submitButton, {
                innerHTML: '<div class="loader"></div>'
            });
    });

    function initOrderMode() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Modifier le hero
        const heroTitle = document.getElementById('contact-hero-title');
        const heroSubtitle = document.getElementById('contact-hero-subtitle');
        if (heroTitle) heroTitle.textContent = 'Votre commande';
        if (heroSubtitle) heroSubtitle.textContent = 'Vérifiez votre panier et envoyez-nous votre commande';

        // Modifier le heading du formulaire
        const formHeading = document.getElementById('form-heading');
        if (formHeading) formHeading.textContent = 'Complétez votre commande';

        const orderSummary = document.getElementById('order-summary');

        if (cart.length === 0) {
            // Panier vide
            if (orderSummary) {
                orderSummary.style.display = 'block';
                orderSummary.innerHTML = `
                    <div class="empty-order">
                        <p>Votre panier est vide.</p>
                        <a href="Goukie.html" class="modify-cart-link">Découvrir nos Goukies</a>
                    </div>
                `;
            }
            return;
        }

        // Panier non vide : afficher le récapitulatif
        renderOrderSummary(cart);

        // Pré-sélectionner "Commande spéciale"
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) subjectSelect.value = 'Commande spéciale';

        // Modifier le _subject hidden field
        const subjectHidden = form.querySelector('input[name="_subject"]');
        if (subjectHidden) subjectHidden.value = 'Nouvelle commande du site Les 100';

        // Modifier le placeholder du message
        const messageField = document.getElementById('message');
        if (messageField) messageField.placeholder = 'Précisions sur votre commande, horaire de retrait souhaité...';

        // Modifier le bouton submit
        const submitButton = form.querySelector('.submit-button');
        if (submitButton) submitButton.textContent = 'Envoyer ma commande';

        // Injecter les champs cachés pour FormSubmit
        injectHiddenFields(cart);

        // Bouton modifier le panier
        const modifyBtn = document.getElementById('modify-cart-btn');
        if (modifyBtn) {
            modifyBtn.addEventListener('click', function() {
                if (typeof Cart !== 'undefined' && Cart.showModal) {
                    Cart.showModal();

                    // Observer la fermeture du modal pour rafraîchir
                    const observer = new MutationObserver(function(mutations) {
                        mutations.forEach(function(mutation) {
                            mutation.removedNodes.forEach(function(node) {
                                if (node.classList && node.classList.contains('cart-modal')) {
                                    observer.disconnect();
                                    refreshOrder();
                                }
                            });
                        });
                    });
                    observer.observe(document.body, { childList: true });
                }
            });
        }
    }

    function renderOrderSummary(cart) {
        const orderSummary = document.getElementById('order-summary');
        const orderItems = document.getElementById('order-items');
        const orderTotalValue = document.getElementById('order-total-value');

        if (!orderSummary || !orderItems || !orderTotalValue) return;

        orderSummary.style.display = 'block';

        let itemsHTML = '';
        let total = 0;
        cart.forEach(function(item) {
            const lineTotal = (item.prix * item.quantity).toFixed(2);
            total += item.prix * item.quantity;
            itemsHTML += `
                <div class="order-item-row">
                    <span class="order-item-name">${item.nom} (${item.taille})</span>
                    <span class="order-item-qty">x${item.quantity}</span>
                    <span class="order-item-price">${lineTotal}€</span>
                </div>
            `;
        });
        orderItems.innerHTML = itemsHTML;
        orderTotalValue.textContent = total.toFixed(2) + '€';
    }

    function injectHiddenFields(cart) {
        // Supprimer les anciens champs cachés de commande
        form.querySelectorAll('input[name^="Commande"]').forEach(function(el) {
            el.remove();
        });

        let total = 0;
        cart.forEach(function(item, index) {
            const lineTotal = (item.prix * item.quantity).toFixed(2);
            total += item.prix * item.quantity;
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'Commande - Article ' + (index + 1);
            input.value = item.nom + ' (' + item.taille + ') x' + item.quantity + ' = ' + lineTotal + '€';
            form.appendChild(input);
        });

        const totalInput = document.createElement('input');
        totalInput.type = 'hidden';
        totalInput.name = 'Commande - Total';
        totalInput.value = total.toFixed(2) + '€';
        form.appendChild(totalInput);
    }

    function refreshOrder() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) {
            const orderSummary = document.getElementById('order-summary');
            if (orderSummary) {
                orderSummary.innerHTML = `
                    <div class="empty-order">
                        <p>Votre panier est vide.</p>
                        <a href="Goukie.html" class="modify-cart-link">Découvrir nos Goukies</a>
                    </div>
                `;
            }
            // Supprimer les champs cachés
            form.querySelectorAll('input[name^="Commande"]').forEach(function(el) {
                el.remove();
            });
            return;
        }
        renderOrderSummary(cart);
        injectHiddenFields(cart);
    }
});

// Fonction pour le Goukie du mois
function initGoukieOfTheMonth() {
    const GoukieOfTheMonth = {
        id: "avril",
        nom: "Avril - Le 69",
        description: "Un Goukie aux éclats de pistache et fleur d'oranger, célébrant l'arrivée du printemps",
        image: "image/Goukie PNG/AVRIL.png",
        featured: true
    };

    // Ajoutez ici le code pour afficher le Goukie du mois si nécessaire
}

// Appeler la fonction au chargement de la page
document.addEventListener('DOMContentLoaded', initGoukieOfTheMonth);

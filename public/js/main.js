/**
 * main.js — Logique frontend pour toutes les pages publiques.
 * Détecte quelle page est chargée et exécute le code approprié.
 */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;

  switch (page) {
    case 'home':
      loadHomePage();
      break;
    case 'cagnotte':
      loadCagnottePage();
      break;
    case 'don':
      loadDonPage();
      break;
    case 'confirmation':
      loadConfirmationPage();
      break;
  }
});

/* ============================================
   Utilitaires
   ============================================ */

/** Formate des centimes en euros affichables */
function formatEuros(cents) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

/** Formate une date ISO en date relative lisible */
function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaine${Math.floor(diffDays / 7) > 1 ? 's' : ''}`;
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

/** Récupère un paramètre d'URL */
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

/* ============================================
   PAGE D'ACCUEIL
   ============================================ */
async function loadHomePage() {
  const grid = document.getElementById('cagnottes-grid');
  if (!grid) return;

  try {
    const res = await fetch('/api/cagnottes');
    const cagnottes = await res.json();

    grid.innerHTML = cagnottes.map(c => `
      <a href="/cagnotte.html?slug=${c.slug}" class="cagnotte-card block no-underline">
        <div class="card-image">
          <img src="${c.image_url}" alt="${c.title}" loading="lazy">
        </div>
        <div class="p-5">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">${c.title}</h3>
          <div class="progress-bar mb-3">
            <div class="progress-fill" data-progress="${c.progress}"></div>
          </div>
          <div class="flex justify-between items-center text-sm">
            <span class="font-bold text-green-600">${formatEuros(c.collected_cents)}</span>
            <span class="text-gray-500">sur ${formatEuros(c.goal_cents)}</span>
          </div>
          <div class="flex justify-between items-center text-sm mt-1">
            <span class="text-gray-600">${c.donors_count} donateur${c.donors_count > 1 ? 's' : ''}</span>
            <span class="font-semibold text-green-600">${c.progress}%</span>
          </div>
        </div>
      </a>
    `).join('');

    // Animer les barres de progression
    requestAnimationFrame(() => {
      grid.querySelectorAll('.progress-fill').forEach(bar => {
        bar.style.width = bar.dataset.progress + '%';
      });
    });

  } catch (err) {
    grid.innerHTML = '<p class="text-center text-red-500 col-span-full">Erreur de chargement. Réessayez.</p>';
  }
}

/* ============================================
   PAGE D'UNE CAGNOTTE
   ============================================ */
async function loadCagnottePage() {
  const slug = getParam('slug');
  if (!slug) return window.location.href = '/';

  try {
    const res = await fetch(`/api/cagnottes/${slug}`);
    if (!res.ok) return window.location.href = '/';
    const c = await res.json();

    // Remplir les données
    document.getElementById('cagnotte-title').textContent = c.title;
    document.getElementById('cagnotte-image').src = c.image_url;
    document.getElementById('cagnotte-image').alt = c.title;
    document.getElementById('cagnotte-story').innerHTML = c.story.replace(/\n/g, '<br>');
    document.getElementById('cagnotte-collected').textContent = formatEuros(c.collected_cents);
    document.getElementById('cagnotte-goal').textContent = `sur ${formatEuros(c.goal_cents)}`;
    document.getElementById('cagnotte-donors').textContent = `${c.donors_count} donateur${c.donors_count > 1 ? 's' : ''}`;
    document.getElementById('cagnotte-percent').textContent = `${c.progress}%`;

    // Barre de progression
    const bar = document.getElementById('cagnotte-progress-fill');
    requestAnimationFrame(() => { bar.style.width = c.progress + '%'; });

    // Bouton de don
    document.getElementById('btn-contribuer').href = `/don.html?id=${c.id}&slug=${c.slug}`;

    // Flux des dons
    const donsList = document.getElementById('dons-list');
    if (c.dons && c.dons.length > 0) {
      donsList.innerHTML = c.dons.map((d, i) => `
        <div class="don-item" style="animation-delay: ${i * 0.08}s">
          <img class="don-avatar" src="${d.avatar_url}" alt="${d.prenom}" loading="lazy">
          <div class="flex-1 min-w-0">
            <div class="flex justify-between items-start">
              <span class="font-semibold text-gray-800">${d.prenom}</span>
              <span class="don-amount">${formatEuros(d.amount_cents)}</span>
            </div>
            ${d.message ? `<p class="don-message">${d.message}</p>` : ''}
            <span class="don-date">${formatDate(d.created_at)}</span>
          </div>
        </div>
      `).join('');
    } else {
      donsList.innerHTML = '<p class="text-gray-500 text-center py-8">Sois le premier à donner ta sadaqa ! 🤲</p>';
    }

    // Meta title
    document.title = `${c.title} — Ma Sadaqa`;

  } catch (err) {
    document.getElementById('cagnotte-content').innerHTML =
      '<p class="text-center text-red-500 py-8">Impossible de charger cette cagnotte.</p>';
  }
}

/* ============================================
   PAGE DE DON
   ============================================ */
function loadDonPage() {
  const cagnotteId = getParam('id');
  const slug = getParam('slug');
  if (!cagnotteId) return window.location.href = '/';

  // Lien retour
  const backLink = document.getElementById('back-link');
  if (backLink && slug) backLink.href = `/cagnotte.html?slug=${slug}`;

  // === MONTANTS ===
  const amountBtns = document.querySelectorAll('.amount-btn');
  const customInput = document.getElementById('custom-amount');
  const hiddenAmount = document.getElementById('amount-value');
  const errorEl = document.getElementById('don-error');

  // Sélection montant prédéfini
  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      hiddenAmount.value = btn.dataset.amount;
      customInput.value = '';
    });
  });

  // Montant libre — symbole € quand on sort du champ
  let rawCustomValue = '';
  customInput.addEventListener('focus', () => {
    amountBtns.forEach(b => b.classList.remove('selected'));
    // Enlever le symbole € quand on clique dedans
    customInput.value = rawCustomValue;
  });

  customInput.addEventListener('input', () => {
    // Garder que les chiffres
    rawCustomValue = customInput.value.replace(/[^0-9]/g, '');
    customInput.value = rawCustomValue;
    const val = parseInt(rawCustomValue);
    if (!isNaN(val) && val >= 1) {
      hiddenAmount.value = val;
    } else {
      hiddenAmount.value = '';
    }
  });

  customInput.addEventListener('blur', () => {
    // Ajouter le symbole € quand on quitte le champ
    if (rawCustomValue && parseInt(rawCustomValue) >= 1) {
      customInput.value = rawCustomValue + ' €';
    }
  });

  // === BOUTON "Je donne" → ouvre la popup ===
  const btnContinuer = document.getElementById('btn-continuer');
  const modal = document.getElementById('payment-modal');
  const modalClose = document.getElementById('modal-close');
  const modalAmountDisplay = document.getElementById('modal-amount-display');
  const btnPayAmount = document.getElementById('btn-pay-amount');

  btnContinuer.addEventListener('click', () => {
    const amount = hiddenAmount.value;
    if (!amount || parseInt(amount) < 1) {
      errorEl.textContent = 'Choisis un montant (minimum 1 €).';
      errorEl.classList.remove('hidden');
      return;
    }
    errorEl.classList.add('hidden');

    // Afficher le montant dans la popup
    modalAmountDisplay.textContent = amount + ' €';
    btnPayAmount.textContent = amount + ' €';
    modal.classList.remove('hidden');
    document.getElementById('pay-prenom').focus();
  });

  // Fermer la popup
  modalClose.addEventListener('click', () => modal.classList.add('hidden'));
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.classList.add('hidden');
  });

  // === FORMAT CARTE BANCAIRE (espaces auto) ===
  const cardInput = document.getElementById('pay-card');
  cardInput.addEventListener('input', () => {
    let v = cardInput.value.replace(/\D/g, '').substring(0, 16);
    cardInput.value = v.replace(/(.{4})/g, '$1 ').trim();
  });

  // Format expiration MM/AA
  const expiryInput = document.getElementById('pay-expiry');
  expiryInput.addEventListener('input', () => {
    let v = expiryInput.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 3) v = v.substring(0, 2) + '/' + v.substring(2);
    expiryInput.value = v;
  });

  // CVC chiffres seulement
  const cvcInput = document.getElementById('pay-cvc');
  cvcInput.addEventListener('input', () => {
    cvcInput.value = cvcInput.value.replace(/\D/g, '').substring(0, 4);
  });

  // === SOUMISSION DU PAIEMENT ===
  const paymentForm = document.getElementById('payment-form');
  const btnPayer = document.getElementById('btn-payer');
  const payError = document.getElementById('pay-error');

  paymentForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    payError.classList.add('hidden');

    const prenom = document.getElementById('pay-prenom').value.trim();
    const nom = document.getElementById('pay-nom').value.trim();
    const card = cardInput.value.replace(/\s/g, '');
    const expiry = expiryInput.value;
    const cvc = cvcInput.value;
    const message = document.getElementById('pay-message').value.trim();
    const amount = parseFloat(hiddenAmount.value);

    // Validation
    if (!prenom || !nom) {
      payError.textContent = 'Merci de renseigner ton prénom et nom.';
      payError.classList.remove('hidden');
      return;
    }
    if (card.length < 13) {
      payError.textContent = 'Numéro de carte invalide.';
      payError.classList.remove('hidden');
      return;
    }
    if (!expiry || expiry.length < 4) {
      payError.textContent = 'Date d\'expiration invalide.';
      payError.classList.remove('hidden');
      return;
    }
    if (!cvc || cvc.length < 3) {
      payError.textContent = 'CVC invalide.';
      payError.classList.remove('hidden');
      return;
    }

    // Désactiver le bouton
    btnPayer.disabled = true;
    btnPayer.innerHTML = '<span class="spinner"></span> Traitement en cours...';

    try {
      const res = await fetch('/api/dons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cagnotte_id: parseInt(cagnotteId),
          prenom: prenom + ' ' + nom,
          amount,
          message
        })
      });

      const data = await res.json();

      if (data.success) {
        // Rediriger vers la page de remerciement
        const redirectUrl = data.checkout_url || `/confirmation.html?don_id=${data.don_id}`;
        window.location.href = redirectUrl;
      } else {
        throw new Error(data.error || 'Erreur inconnue');
      }
    } catch (err) {
      payError.textContent = err.message || 'Une erreur est survenue. Réessaye.';
      payError.classList.remove('hidden');
      btnPayer.disabled = false;
      btnPayer.innerHTML = '🔒 Payer <span id="btn-pay-amount">' + amount + ' €</span>';
    }
  });

  // Message d'annulation
  if (getParam('canceled')) {
    errorEl.textContent = 'Le paiement a été annulé. Tu peux réessayer.';
    errorEl.classList.remove('hidden');
  }
}

/* ============================================
   PAGE DE CONFIRMATION
   ============================================ */
async function loadConfirmationPage() {
  const donId = getParam('don_id');
  if (!donId) return;

  try {
    const res = await fetch(`/api/dons/${donId}`);
    const don = await res.json();

    document.getElementById('conf-prenom').textContent = don.prenom;
    document.getElementById('conf-amount').textContent = formatEuros(don.amount_cents);
    document.getElementById('conf-cagnotte').textContent = don.cagnotte_title;

    const statusEl = document.getElementById('conf-status');
    if (don.status === 'confirmed') {
      statusEl.innerHTML = '<span class="status-badge status-confirmed">Confirmé ✓</span>';
    } else if (don.status === 'pending') {
      statusEl.innerHTML = '<span class="status-badge status-pending">En cours de confirmation...</span>';
    }

    document.getElementById('conf-back-link').href = `/cagnotte.html?slug=${don.cagnotte_slug}`;

  } catch (err) {
    document.getElementById('confirmation-content').innerHTML =
      '<p class="text-red-500 text-center">Impossible de charger les détails du don.</p>';
  }
}

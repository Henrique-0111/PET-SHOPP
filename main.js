/* ==========================================================================
   PetCare — main.js
   Utilitários globais compartilhados por todas as páginas.
   Preparado para futura integração com Supabase (sem dependências ainda).
   ========================================================================== */

/* ---------- Menu mobile ---------- */
function initMobileNav() {
  const toggle = document.querySelector('[data-nav-toggle]');
  const nav = document.querySelector('[data-nav-menu]');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
}

/* ---------- Modais ---------- */
function initModals() {
  document.querySelectorAll('[data-modal-open]').forEach((btn) => {
    const modal = document.querySelector(`#${btn.dataset.modalOpen}`);
    if (!modal) return;
    btn.addEventListener('click', () => modal.classList.add('is-open'));
  });

  document.querySelectorAll('[data-modal-close]').forEach((btn) => {
    const modal = btn.closest('.modal-overlay');
    btn.addEventListener('click', () => modal?.classList.remove('is-open'));
  });

  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('is-open');
    });
  });
}

/* ---------- Helpers genéricos ---------- */
const PetCare = {
  formatCurrency(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  },
  formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
  },
  showLoading(container) {
    container.innerHTML = '<div class="spinner" role="status" aria-label="Carregando"></div>';
  },
  showEmptyState(container, { title, message, icon = '' }) {
    container.innerHTML = `
      <div class="empty-state">
        ${icon}
        <h3>${title}</h3>
        <p>${message}</p>
      </div>`;
  },
};

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  initModals();
});

/* ==========================================================================
   PetCare — produto.js
   Galeria de imagens, abas, seletor de quantidade e feedback de "adicionar
   ao carrinho". Nesta etapa o produto é fixo no HTML; futuramente o id virá
   da URL (?id=) e os dados serão buscados no Supabase.
   ========================================================================== */

function initGallery() {
  const main = document.querySelector('[data-gallery-main]');
  const thumbs = document.querySelectorAll('[data-thumb]');
  if (!main || thumbs.length === 0) return;

  main.style.backgroundColor = thumbs[0].style.backgroundColor;

  thumbs.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      thumbs.forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      main.style.backgroundColor = thumb.style.backgroundColor;
    });
  });
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');
  if (tabButtons.length === 0) return;

  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-selected', 'false'); });
      panels.forEach((p) => { p.classList.remove('is-active'); p.hidden = true; });

      btn.classList.add('is-active');
      btn.setAttribute('aria-selected', 'true');

      const panel = document.getElementById(`tab-${btn.dataset.tab}`);
      if (panel) { panel.classList.add('is-active'); panel.hidden = false; }
    });
  });
}

function initQuantityStepper() {
  const input = document.querySelector('[data-qty-input]');
  const decreaseBtn = document.querySelector('[data-qty-decrease]');
  const increaseBtn = document.querySelector('[data-qty-increase]');
  if (!input) return;

  const clamp = (value) => Math.min(Math.max(value, 1), 10);

  decreaseBtn?.addEventListener('click', () => {
    input.value = clamp(parseInt(input.value || '1', 10) - 1);
  });
  increaseBtn?.addEventListener('click', () => {
    input.value = clamp(parseInt(input.value || '1', 10) + 1);
  });
  input.addEventListener('change', () => {
    input.value = clamp(parseInt(input.value || '1', 10));
  });
}

function showToast(message) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

function initAddToCart() {
  const btn = document.querySelector('[data-add-to-cart]');
  const qtyInput = document.querySelector('[data-qty-input]');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const qty = qtyInput ? qtyInput.value : 1;
    // TODO: persistir item no carrinho (Supabase ou localStorage) com id do produto
    showToast(`${qty}x adicionado ao carrinho`);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initGallery();
  initTabs();
  initQuantityStepper();
  initAddToCart();
});

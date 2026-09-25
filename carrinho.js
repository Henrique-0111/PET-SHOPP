/* ==========================================================================
   PetCare — carrinho.js
   Cálculo de totais, quantidade por item, remoção, cupom e estado vazio.
   Os itens aqui vêm fixos do HTML; a persistência real (Supabase ou
   localStorage) entra depois sem mudar esta lógica de cálculo.
   ========================================================================== */

const SHIPPING_COST = 19.90;
const VALID_COUPONS = { PETCARE10: 0.10 };

let appliedDiscountRate = 0;

function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function recalculateCart() {
  const items = [...document.querySelectorAll('[data-cart-item]')];
  let subtotal = 0;

  items.forEach((item) => {
    const price = parseFloat(item.dataset.price);
    const qtyInput = item.querySelector('[data-qty-input]');
    const qty = parseInt(qtyInput?.value || '1', 10);
    const total = price * qty;
    subtotal += total;

    const totalEl = item.querySelector('[data-item-total]');
    if (totalEl) totalEl.textContent = formatBRL(total);
  });

  const shipping = items.length > 0 ? SHIPPING_COST : 0;
  const discount = subtotal * appliedDiscountRate;
  const total = subtotal + shipping - discount;

  document.querySelector('[data-summary-subtotal]').textContent = formatBRL(subtotal);
  document.querySelector('[data-summary-shipping]').textContent = shipping > 0 ? formatBRL(shipping) : 'Grátis';
  document.querySelector('[data-summary-total]').textContent = formatBRL(total);

  const discountRow = document.querySelector('[data-summary-discount-row]');
  const discountEl = document.querySelector('[data-summary-discount]');
  if (discount > 0) {
    discountRow.hidden = false;
    discountEl.textContent = `– ${formatBRL(discount)}`;
  } else {
    discountRow.hidden = true;
  }

  toggleEmptyState(items.length === 0);
}

function toggleEmptyState(isEmpty) {
  const layout = document.querySelector('[data-cart-layout]');
  const emptyState = document.querySelector('[data-cart-empty]');
  if (!layout || !emptyState) return;
  layout.hidden = isEmpty;
  emptyState.hidden = !isEmpty;
}

function initQuantitySteppers() {
  document.querySelectorAll('[data-cart-item]').forEach((item) => {
    const input = item.querySelector('[data-qty-input]');
    const decreaseBtn = item.querySelector('[data-qty-decrease]');
    const increaseBtn = item.querySelector('[data-qty-increase]');
    if (!input) return;

    const clamp = (value) => Math.min(Math.max(value, 1), 10);

    decreaseBtn?.addEventListener('click', () => {
      input.value = clamp(parseInt(input.value || '1', 10) - 1);
      recalculateCart();
    });
    increaseBtn?.addEventListener('click', () => {
      input.value = clamp(parseInt(input.value || '1', 10) + 1);
      recalculateCart();
    });
    input.addEventListener('change', () => {
      input.value = clamp(parseInt(input.value || '1', 10));
      recalculateCart();
    });
  });
}

function initRemoveButtons() {
  document.querySelectorAll('[data-remove-item]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-cart-item]');
      item?.remove();
      recalculateCart();
    });
  });
}

function initPromoForm() {
  const form = document.querySelector('[data-promo-form]');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('promo-code');
    const hint = document.querySelector('[data-promo-hint]');
    const code = input.value.trim().toUpperCase();

    if (VALID_COUPONS[code]) {
      appliedDiscountRate = VALID_COUPONS[code];
      hint.textContent = `Cupom aplicado: ${Math.round(appliedDiscountRate * 100)}% de desconto.`;
      hint.style.color = 'var(--success)';
    } else {
      appliedDiscountRate = 0;
      hint.textContent = 'Cupom inválido ou expirado.';
      hint.style.color = 'var(--danger)';
    }
    recalculateCart();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initQuantitySteppers();
  initRemoveButtons();
  initPromoForm();
  recalculateCart();
});

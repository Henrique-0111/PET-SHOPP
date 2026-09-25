/* ==========================================================================
   PetCare — produtos.js
   Busca, filtros e ordenação client-side sobre os cards renderizados no HTML.
   Quando integrado ao Supabase, a listagem de .product-card passa a ser
   gerada dinamicamente a partir da tabela "produtos", mas a lógica de
   filtro/ordenação abaixo pode continuar operando sobre o DOM ou ser
   migrada para uma query com filtros equivalentes.
   ========================================================================== */

function initFiltersDrawer() {
  const filters = document.querySelector('[data-filters]');
  const toggleBtn = document.querySelector('[data-filters-toggle]');
  if (!filters || !toggleBtn) return;

  toggleBtn.addEventListener('click', () => filters.classList.add('is-open'));

  const closeOnApply = document.querySelector('[data-filters-apply]');
  closeOnApply?.addEventListener('click', () => filters.classList.remove('is-open'));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') filters.classList.remove('is-open');
  });
}

function getActiveFilters(form) {
  const categories = [...form.querySelectorAll('input[name="category"]:checked')].map((i) => i.value);
  const species = [...form.querySelectorAll('input[name="species"]:checked')].map((i) => i.value);
  const min = parseFloat(document.getElementById('price-min').value) || 0;
  const max = parseFloat(document.getElementById('price-max').value) || Infinity;
  return { categories, species, min, max };
}

function applyFilters() {
  const filtersPanel = document.querySelector('[data-filters]');
  const grid = document.querySelector('[data-products-grid]');
  const emptyState = document.querySelector('[data-empty-state]');
  const countLabel = document.querySelector('[data-results-count]');
  const searchInput = document.querySelector('[data-search]');
  if (!grid) return;

  const { categories, species, min, max } = getActiveFilters(filtersPanel);
  const term = (searchInput?.value || '').trim().toLowerCase();
  const cards = [...grid.querySelectorAll('.product-card')];

  let visibleCount = 0;

  cards.forEach((card) => {
    const category = card.dataset.category;
    const cardSpecies = card.dataset.species;
    const price = parseFloat(card.dataset.price);
    const name = card.dataset.name.toLowerCase();

    const matches =
      categories.includes(category) &&
      species.includes(cardSpecies) &&
      price >= min && price <= max &&
      (term === '' || name.includes(term));

    card.hidden = !matches;
    if (matches) visibleCount++;
  });

  if (countLabel) {
    countLabel.textContent = `${visibleCount} produto${visibleCount === 1 ? '' : 's'} encontrado${visibleCount === 1 ? '' : 's'}`;
  }
  if (emptyState) emptyState.hidden = visibleCount !== 0;
  grid.hidden = visibleCount === 0;
}

function initSort() {
  const select = document.querySelector('[data-sort]');
  const grid = document.querySelector('[data-products-grid]');
  if (!select || !grid) return;

  select.addEventListener('change', () => {
    const cards = [...grid.querySelectorAll('.product-card')];
    const sorted = cards.sort((a, b) => {
      switch (select.value) {
        case 'price-asc':
          return parseFloat(a.dataset.price) - parseFloat(b.dataset.price);
        case 'price-desc':
          return parseFloat(b.dataset.price) - parseFloat(a.dataset.price);
        case 'name':
          return a.dataset.name.localeCompare(b.dataset.name, 'pt-BR');
        default:
          return 0;
      }
    });
    sorted.forEach((card) => grid.appendChild(card));
  });
}

function initFilterEvents() {
  const filtersPanel = document.querySelector('[data-filters]');
  const applyBtn = document.querySelector('[data-filters-apply]');
  const clearBtns = document.querySelectorAll('[data-filters-clear]');
  const searchInput = document.querySelector('[data-search]');

  applyBtn?.addEventListener('click', applyFilters);
  searchInput?.addEventListener('input', applyFilters);

  clearBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      filtersPanel.querySelectorAll('input[type="checkbox"]').forEach((cb) => (cb.checked = true));
      document.getElementById('price-min').value = '';
      document.getElementById('price-max').value = '';
      if (searchInput) searchInput.value = '';
      applyFilters();
      filtersPanel.classList.remove('is-open');
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initFiltersDrawer();
  initFilterEvents();
  initSort();
});

/* ==========================================================================
   PetCare — agendamento.js
   Wizard de 4 etapas: serviço, pet, data/horário e confirmação.
   O calendário e os horários são gerados em memória; a disponibilidade
   real virá do Supabase (tabela de agendamentos) futuramente — a função
   getAvailableSlots() é o ponto de troca para essa integração.
   ========================================================================== */

const SERVICE_LABELS = {
  consulta: 'Consulta veterinária',
  'banho-tosa': 'Banho e tosa',
  vacina: 'Vacinação',
  exame: 'Exames laboratoriais',
};

const PET_LABELS = { nina: 'Nina', thor: 'Thor' };

const WEEKDAYS_OFF = [0]; // domingo indisponível
const MONTH_NAMES = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];

let currentStep = 1;
const totalSteps = 4;
let calendarDate = new Date();
let selectedDate = null;
let selectedTime = null;

/* ---------- Navegação entre etapas ---------- */
function goToStep(step) {
  currentStep = step;

  document.querySelectorAll('.booking-step').forEach((el) => {
    el.classList.toggle('is-active', Number(el.dataset.step) === step);
  });

  document.querySelectorAll('[data-step-indicator]').forEach((li) => {
    const n = Number(li.dataset.stepIndicator);
    li.classList.toggle('is-active', n === step);
    li.classList.toggle('is-complete', n < step);
  });

  const backBtn = document.querySelector('[data-step-back]');
  const nextBtn = document.querySelector('[data-step-next]');
  const submitBtn = document.querySelector('[data-step-submit]');

  backBtn.hidden = step === 1;
  nextBtn.hidden = step === totalSteps;
  submitBtn.hidden = step !== totalSteps;

  if (step === totalSteps) updateSummary();

  document.querySelector('.booking-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
  const form = document.getElementById('booking-form');

  if (step === 1) {
    const ok = form.service?.value;
    toggleStepError('service', !ok);
    return Boolean(ok);
  }
  if (step === 2) {
    const ok = form.pet?.value;
    toggleStepError('pet', !ok);
    return Boolean(ok);
  }
  if (step === 3) {
    const ok = selectedDate && selectedTime;
    toggleStepError('datetime', !ok);
    return Boolean(ok);
  }
  return true;
}

function toggleStepError(key, hasError) {
  const el = document.querySelector(`[data-error-for="${key}"]`);
  if (!el) return;
  el.hidden = !hasError;
  el.textContent = hasError ? 'Selecione uma opção para continuar.' : '';
}

function initStepperNav() {
  document.querySelector('[data-step-next]')?.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < totalSteps) goToStep(currentStep + 1);
  });
  document.querySelector('[data-step-back]')?.addEventListener('click', () => {
    if (currentStep > 1) goToStep(currentStep - 1);
  });
}

/* ---------- Calendário ---------- */
function getAvailableSlots(date) {
  // Placeholder de disponibilidade — será substituído por consulta real.
  const base = ['09:00', '09:40', '10:20', '11:00', '13:30', '14:10', '14:50', '15:30', '16:10'];
  const day = date.getDate();
  return base.filter((_, i) => (day + i) % 4 !== 0);
}

function renderCalendar() {
  const grid = document.querySelector('[data-calendar-grid]');
  const label = document.querySelector('[data-calendar-label]');
  if (!grid || !label) return;

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  label.textContent = `${MONTH_NAMES[month]} de ${year}`;

  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  grid.innerHTML = '';

  for (let i = 0; i < startOffset; i++) {
    const empty = document.createElement('span');
    empty.className = 'calendar-day is-empty';
    grid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-day';
    btn.textContent = String(day);

    const isPast = date < today;
    const isOff = WEEKDAYS_OFF.includes(date.getDay());
    if (isPast || isOff) btn.disabled = true;

    if (selectedDate && date.toDateString() === selectedDate.toDateString()) {
      btn.classList.add('is-selected');
    }

    btn.addEventListener('click', () => {
      selectedDate = date;
      selectedTime = null;
      renderCalendar();
      renderTimeSlots();
      toggleStepError('datetime', false);
    });

    grid.appendChild(btn);
  }
}

function renderTimeSlots() {
  const container = document.querySelector('[data-time-slots]');
  if (!container) return;

  if (!selectedDate) {
    container.innerHTML = '<p class="field-hint">Selecione uma data para ver os horários.</p>';
    return;
  }

  const slots = getAvailableSlots(selectedDate);
  if (slots.length === 0) {
    container.innerHTML = '<p class="field-hint">Sem horários disponíveis nesta data.</p>';
    return;
  }

  container.innerHTML = '';
  slots.forEach((time) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'time-slot';
    btn.textContent = time;
    if (time === selectedTime) btn.classList.add('is-selected');

    btn.addEventListener('click', () => {
      selectedTime = time;
      renderTimeSlots();
      toggleStepError('datetime', false);
    });

    container.appendChild(btn);
  });
}

function initCalendarNav() {
  document.querySelector('[data-calendar-prev]')?.addEventListener('click', () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1);
    renderCalendar();
  });
  document.querySelector('[data-calendar-next]')?.addEventListener('click', () => {
    calendarDate = new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1);
    renderCalendar();
  });
}

/* ---------- Resumo ---------- */
function updateSummary() {
  const form = document.getElementById('booking-form');
  const service = SERVICE_LABELS[form.service?.value] || '—';
  const pet = PET_LABELS[form.pet?.value] || '—';
  const date = selectedDate
    ? selectedDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : '—';
  const time = selectedTime || '—';

  document.querySelector('[data-summary-service]').textContent = service;
  document.querySelector('[data-summary-pet]').textContent = pet;
  document.querySelector('[data-summary-date]').textContent = date;
  document.querySelector('[data-summary-time]').textContent = time;
}

/* ---------- Envio ---------- */
function initFormSubmit() {
  const form = document.getElementById('booking-form');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateStep(3)) { goToStep(3); return; }

    // TODO: persistir o agendamento no Supabase (tabela "agendamentos")
    form.hidden = true;
    document.querySelector('[data-stepper-nav]').hidden = true;
    document.querySelector('.booking-heading').hidden = true;
    document.querySelector('[data-booking-success]').hidden = false;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initStepperNav();
  initCalendarNav();
  initFormSubmit();
  renderCalendar();
  renderTimeSlots();
  goToStep(1);
});

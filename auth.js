/* ==========================================================================
   PetCare — auth.js
   Validação e comportamento das páginas login.html / cadastro.html.
   A submissão real (Supabase Auth) será conectada posteriormente;
   por ora, apenas valida e simula o estado de carregamento.
   ========================================================================== */

function initPasswordToggle() {
  document.querySelectorAll('[data-password-toggle]').forEach((btn) => {
    const input = btn.closest('.password-field')?.querySelector('input');
    if (!input) return;
    btn.addEventListener('click', () => {
      const isVisible = input.type === 'text';
      input.type = isVisible ? 'password' : 'text';
      btn.setAttribute('aria-label', isVisible ? 'Mostrar senha' : 'Ocultar senha');
    });
  });
}

function setFieldError(input, message) {
  const errorEl = document.querySelector(`[data-error-for="${input.id}"]`);
  input.classList.toggle('input-error', Boolean(message));
  if (errorEl) {
    errorEl.textContent = message || '';
    errorEl.hidden = !message;
  }
}

function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setLoading(form, isLoading) {
  const btn = form.querySelector('button[type="submit"]');
  const label = btn.querySelector('[data-btn-label]');
  btn.disabled = isLoading;
  if (label) label.textContent = isLoading ? 'Entrando...' : 'Entrar';
}

function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  const alertBox = document.getElementById('login-alert');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    alertBox.hidden = true;

    const email = form.email;
    const password = form.password;
    let hasError = false;

    if (!validateEmail(email.value)) {
      setFieldError(email, 'Informe um e-mail válido.');
      hasError = true;
    } else {
      setFieldError(email, '');
    }

    if (password.value.length < 6) {
      setFieldError(password, 'A senha deve ter pelo menos 6 caracteres.');
      hasError = true;
    } else {
      setFieldError(password, '');
    }

    if (hasError) return;

    // TODO: integrar com Supabase Auth (signInWithPassword)
    setLoading(form, true);
    setTimeout(() => {
      setLoading(form, false);
      // Placeholder: em caso de falha real, exibir alertBox
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLoginForm();
});

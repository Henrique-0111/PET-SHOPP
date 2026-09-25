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

/* ---------- Força de senha ---------- */
function getPasswordStrength(value) {
  if (value.length === 0) return 0;
  let score = 0;
  if (value.length >= 6) score++;
  if (value.length >= 10 && /[A-Z]/.test(value) && /[0-9]/.test(value)) score++;
  if (value.length >= 10 && /[^A-Za-z0-9]/.test(value)) score++;
  return Math.min(score, 3);
}

function initPasswordStrength() {
  const input = document.getElementById('password');
  const wrap = document.querySelector('[data-password-strength]');
  const label = document.querySelector('[data-strength-label]');
  if (!input || !wrap) return;

  const bars = wrap.querySelectorAll('.password-strength-bar');
  const levels = ['is-weak', 'is-medium', 'is-strong'];
  const labels = ['Mínimo de 6 caracteres', 'Senha razoável', 'Senha forte'];

  input.addEventListener('input', () => {
    const score = getPasswordStrength(input.value);
    bars.forEach((bar, i) => {
      bar.className = 'password-strength-bar';
      if (i < score) bar.classList.add(levels[score - 1]);
    });
    if (label) label.textContent = input.value.length === 0
      ? 'Mínimo de 6 caracteres'
      : labels[Math.max(score - 1, 0)];
  });
}

/* ---------- Formulário de cadastro ---------- */
function initSignupForm() {
  const form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasError = false;

    const name = form.name;
    if (name.value.trim().length < 3) {
      setFieldError(name, 'Informe seu nome completo.');
      hasError = true;
    } else {
      setFieldError(name, '');
    }

    const email = form.email;
    if (!validateEmail(email.value)) {
      setFieldError(email, 'Informe um e-mail válido.');
      hasError = true;
    } else {
      setFieldError(email, '');
    }

    const phone = form.phone;
    if (phone.value.replace(/\D/g, '').length < 10) {
      setFieldError(phone, 'Informe um telefone válido com DDD.');
      hasError = true;
    } else {
      setFieldError(phone, '');
    }

    const password = form.password;
    if (password.value.length < 6) {
      setFieldError(password, 'A senha deve ter pelo menos 6 caracteres.');
      hasError = true;
    } else {
      setFieldError(password, '');
    }

    const confirmPassword = form.confirmPassword;
    if (confirmPassword.value !== password.value || confirmPassword.value.length === 0) {
      setFieldError(confirmPassword, 'As senhas não coincidem.');
      hasError = true;
    } else {
      setFieldError(confirmPassword, '');
    }

    const terms = form.terms;
    const termsError = document.querySelector('[data-error-for="terms"]');
    if (!terms.checked) {
      if (termsError) { termsError.textContent = 'É necessário aceitar os termos para continuar.'; termsError.hidden = false; }
      hasError = true;
    } else if (termsError) {
      termsError.hidden = true;
    }

    if (hasError) return;

    // TODO: integrar com Supabase Auth (signUp) + criação do registro em "clientes"
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.querySelector('[data-btn-label]');
    btn.disabled = true;
    if (label) label.textContent = 'Criando conta...';
    setTimeout(() => {
      btn.disabled = false;
      if (label) label.textContent = 'Criar conta';
      window.location.href = 'perfil.html';
    }, 900);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initPasswordToggle();
  initLoginForm();
  initPasswordStrength();
  initSignupForm();
});

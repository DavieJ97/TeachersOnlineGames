document.querySelectorAll('[data-password-toggle]').forEach((toggle) => {
    const input = document.getElementById(toggle.getAttribute('aria-controls'));
    const icon = toggle.querySelector('i');
    if (!input || !icon) return;

    toggle.addEventListener('click', () => {
        const showPassword = input.type === 'password';
        input.type = showPassword ? 'text' : 'password';
        toggle.setAttribute('aria-label', showPassword ? 'Hide password' : 'Show password');
        toggle.setAttribute('aria-pressed', String(showPassword));
        icon.classList.toggle('bi-eye', !showPassword);
        icon.classList.toggle('bi-eye-slash', showPassword);
    });
});

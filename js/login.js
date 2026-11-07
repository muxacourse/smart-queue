/* =========================================================
   Smart Queue – Login step 1 (send OTP by email)
   Used by visitor/login.html and organization/login.html.
   The form tells the script who is logging in:
     data-role="visitor" | "organization" | "admin"
     data-remember-key = where "Remember me" keeps the email
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('emailForm');
  if (!form) return;

  var role        = form.dataset.role;
  var rememberKey = form.dataset.rememberKey;
  var emailInput  = form.elements['email'];
  var remember    = form.elements['remember'];
  var errorBox    = form.querySelector('.error[data-for="email"]');

  // Remember me: pre-fill email (admin page has no Remember me)
  try {
    var saved = rememberKey ? localStorage.getItem(rememberKey) : null;
    if (saved) {
      emailInput.value = saved;
      remember.checked = true;
    }
  } catch (e) { /* storage blocked */ }

  form.addEventListener('submit', function (event) {
    errorBox.textContent = '';
    errorBox.closest('.field').classList.remove('has-error');

    var email = emailInput.value.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      event.preventDefault();
      errorBox.textContent = 'Enter a valid email address.';
      errorBox.closest('.field').classList.add('has-error');
      emailInput.focus();
      return;
    }

    try {
      if (remember && rememberKey) {
        if (remember.checked) localStorage.setItem(rememberKey, email);
        else localStorage.removeItem(rememberKey);
      }

      // otp.html reads this to show "We sent a code to ..."
      sessionStorage.setItem('sq_otp_email_' + role, email);
    } catch (e) { /* storage blocked */ }

    // Until PHP is connected: go straight to the OTP page.
    // Later: set the form action to send_otp.php, which
    // sends the email and redirects to otp.html itself.
    if (form.getAttribute('action') === '#') {
      event.preventDefault();
      window.location.href = 'otp.html';
    }
  });

});

/* =========================================================
   Smart Queue – Organization registration
   Client-side checks only. The PHP side must validate again.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('orgRegisterForm');
  if (!form) return;

  var f = form.elements;

  // Phone: digits only, max 10
  f['phone'].addEventListener('input', function () {
    f['phone'].value = f['phone'].value.replace(/\D/g, '').slice(0, 10);
  });

  // Remember me: pre-fill email if saved earlier
  try {
    var saved = localStorage.getItem('sq_org_email');
    if (saved) {
      f['email'].value = saved;
      f['remember'].checked = true;
    }
  } catch (e) { /* storage blocked */ }

  function showError(name, message) {
    var box = form.querySelector('.error[data-for="' + name + '"]');
    if (box) {
      box.textContent = message;
      box.closest('.field').classList.add('has-error');
    }
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(function (el) { el.textContent = ''; });
    form.querySelectorAll('.has-error').forEach(function (el) { el.classList.remove('has-error'); });
  }

  form.addEventListener('submit', function (event) {
    clearErrors();
    var ok = true;

    var orgName = f['org_name'].value.trim();
    var contact = f['contact_name'].value.trim();
    var email   = f['email'].value.trim();
    var phone   = f['phone'].value.trim();
    var address = f['address'].value.trim();

    if (orgName.length < 3) {
      showError('org_name', 'Enter the organization name (at least 3 letters).'); ok = false;
    }
    if (contact.length < 3) {
      showError('contact_name', 'Enter the contact person’s full name.'); ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Enter a valid email address, like office@organization.com.'); ok = false;
    }
    if (!/^[6-9]\d{9}$/.test(phone)) {
      showError('phone', 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'); ok = false;
    }
    if (address.length < 10) {
      showError('address', 'Enter the full address with city and PIN code.'); ok = false;
    }

    if (!ok) {
      event.preventDefault();
      var first = form.querySelector('.has-error input, .has-error textarea');
      if (first) first.focus();
      return;
    }

    try {
      if (f['remember'].checked) localStorage.setItem('sq_org_email', email);
      else localStorage.removeItem('sq_org_email');
    } catch (e) { /* storage blocked */ }

    // Until the PHP file is connected, stop here and show a message
    if (form.getAttribute('action') === '#') {
      event.preventDefault();
      alert('Form is valid. Connect the action to your PHP file to save the organization.');
    }
  });

});

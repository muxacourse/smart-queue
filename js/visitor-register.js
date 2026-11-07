/* =========================================================
   Smart Queue – Visitor registration
   Client-side checks only. The PHP side must validate again.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('visitorRegisterForm');
  if (!form) return;

  // Date of birth cannot be in the future
  var dob = document.getElementById('dob');
  dob.max = new Date().toISOString().split('T')[0];

  // Phone: allow digits only, max 10
  var phone = document.getElementById('phone');
  phone.addEventListener('input', function () {
    phone.value = phone.value.replace(/\D/g, '').slice(0, 10);
  });

  // "Remember me": pre-fill email if saved earlier
  try {
    var savedEmail = localStorage.getItem('sq_visitor_email');
    if (savedEmail) {
      document.getElementById('email').value = savedEmail;
      document.getElementById('remember').checked = true;
    }
  } catch (e) { /* storage blocked */ }

  // ---- helpers ----
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

  // ---- validation ----
  form.addEventListener('submit', function (event) {
    clearErrors();
    var ok = true;

    var name    = form.elements['name'].value.trim();
    var address = form.elements['address'].value.trim();
    var gender  = form.querySelector('input[name="gender"]:checked');
    var dobVal  = form.elements['dob'].value;
    var email   = form.elements['email'].value.trim();
    var phoneNo = form.elements['phone'].value.trim();

    if (name.length < 3) {
      showError('name', 'Enter your full name (at least 3 letters).'); ok = false;
    }
    if (address.length < 10) {
      showError('address', 'Enter your full address with city and PIN code.'); ok = false;
    }
    if (!gender) {
      showError('gender', 'Select your gender.'); ok = false;
    }
    if (!dobVal) {
      showError('dob', 'Select your date of birth.'); ok = false;
    } else if (dobVal > dob.max) {
      showError('dob', 'Date of birth cannot be in the future.'); ok = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email', 'Enter a valid email address, like you@example.com.'); ok = false;
    }
    if (!/^[6-9]\d{9}$/.test(phoneNo)) {
      showError('phone', 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'); ok = false;
    }

    if (!ok) {
      event.preventDefault();
      var first = form.querySelector('.has-error input, .has-error textarea');
      if (first) first.focus();
      return;
    }

    // Remember me
    try {
      if (form.elements['remember'].checked) {
        localStorage.setItem('sq_visitor_email', email);
      } else {
        localStorage.removeItem('sq_visitor_email');
      }
    } catch (e) { /* storage blocked */ }

    // Until the PHP file is connected, stop here and show a message
    if (form.getAttribute('action') === '#') {
      event.preventDefault();
      alert('Form is valid. Connect the action to your PHP file to save the visitor.');
    }
  });

});

/* =========================================================
   Smart Queue – Visitor: Profile
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var V = window.SQ_VIS;
  var state = V.load();
  V.fillSidebar(state);

  var form = document.getElementById('profileForm');
  var f = form.elements;
  var note = document.getElementById('saveNote');
  var dob = f['dob'];
  dob.max = new Date().toISOString().split('T')[0];

  function fill() {
    var p = state.profile;
    f['name'].value = p.name;
    f['address'].value = p.address;
    form.querySelectorAll('input[name="gender"]').forEach(function (r) { r.checked = r.value === p.gender; });
    dob.value = p.dob;
    f['email'].value = p.email;
    f['phone'].value = p.phone;
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
    form.querySelectorAll('.has-error').forEach(function (e) { e.classList.remove('has-error'); });
  }

  function err(name, msg) {
    var box = form.querySelector('.error[data-for="' + name + '"]');
    box.textContent = msg;
    box.closest('.field').classList.add('has-error');
  }

  f['phone'].addEventListener('input', function () {
    f['phone'].value = f['phone'].value.replace(/\D/g, '').slice(0, 10);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    note.textContent = '';
    var ok = true;

    var name = f['name'].value.trim();
    var address = f['address'].value.trim();
    var gender = form.querySelector('input[name="gender"]:checked');
    var phone = f['phone'].value.trim();

    if (name.length < 3) { err('name', 'Enter your full name (at least 3 letters).'); ok = false; }
    if (address.length < 10) { err('address', 'Enter your full address with city and PIN code.'); ok = false; }
    if (!gender) { err('gender', 'Select your gender.'); ok = false; }
    if (!dob.value) { err('dob', 'Select your date of birth.'); ok = false; }
    else if (dob.value > dob.max) { err('dob', 'Date of birth can’t be in the future.'); ok = false; }
    if (!/^[6-9]\d{9}$/.test(phone)) { err('phone', 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'); ok = false; }
    if (!ok) {
      var first = form.querySelector('.has-error input, .has-error textarea');
      if (first) first.focus();
      return;
    }

    var p = state.profile;
    p.name = name; p.address = address; p.gender = gender.value; p.dob = dob.value; p.phone = phone;
    V.save(state);
    // TODO: save to MySQL through PHP (AJAX)
    V.fillSidebar(state);
    note.textContent = '✓ Changes saved';
  });

  document.getElementById('profileReset').addEventListener('click', function () {
    clearErrors();
    note.textContent = '';
    fill();
  });

  fill();
});

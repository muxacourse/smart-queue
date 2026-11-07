/* =========================================================
   Smart Queue – Organization profile
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var state = O.load();
  O.fillSidebar(state);

  var form = document.getElementById('profileForm');
  var f = form.elements;
  var note = document.getElementById('saveNote');

  function fill() {
    var p = state.profile;
    f['org_name'].value = p.name;
    f['contact_name'].value = p.contact;
    f['email'].value = p.email;
    f['phone'].value = p.phone;
    f['address'].value = p.address;
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

    var name = f['org_name'].value.trim();
    var contact = f['contact_name'].value.trim();
    var phone = f['phone'].value.trim();
    var address = f['address'].value.trim();

    if (name.length < 3) { err('org_name', 'Enter the organization name (at least 3 letters).'); ok = false; }
    if (contact.length < 3) { err('contact_name', 'Enter the contact person’s full name.'); ok = false; }
    if (!/^[6-9]\d{9}$/.test(phone)) { err('phone', 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.'); ok = false; }
    if (address.length < 10) { err('address', 'Enter the full address with city and PIN code.'); ok = false; }
    if (!ok) {
      var first = form.querySelector('.has-error input, .has-error textarea');
      if (first) first.focus();
      return;
    }

    state.profile.name = name;
    state.profile.contact = contact;
    state.profile.phone = phone;
    state.profile.address = address;
    O.save(state);
    // TODO: save to MySQL through PHP
    O.fillSidebar(state);
    note.textContent = '✓ Changes saved';
  });

  document.getElementById('profileReset').addEventListener('click', function () {
    clearErrors();
    note.textContent = '';
    fill();
  });

  fill();
});

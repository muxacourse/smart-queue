/* =========================================================
   Smart Queue – Login step 2 (enter OTP)
   Used by visitor/otp.html and organization/otp.html.
   Checking the OTP must be done in PHP (verify_otp.php).
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var form = document.getElementById('otpForm');
  if (!form) return;

  var role      = form.dataset.role;
  var sentTo    = document.getElementById('sentTo');
  var boxes     = document.querySelectorAll('#otpBoxes input');
  var otpValue  = document.getElementById('otpValue');
  var timerEl   = document.getElementById('resendTimer');
  var resendBtn = document.getElementById('resendBtn');
  var errorBox  = form.querySelector('.error[data-for="otp"]');

  var RESEND_SECONDS = 30;
  var timerId = null;

  // ---------- Which email was the code sent to? ----------
  var email = null;
  try { email = sessionStorage.getItem('sq_otp_email_' + role); } catch (e) {}

  if (!email) {
    // Opened directly without entering an email first
    window.location.replace('login.html');
    return;
  }
  sentTo.textContent = email;

  // ---------- Resend timer ----------
  function startTimer() {
    var left = RESEND_SECONDS;
    clearInterval(timerId);
    resendBtn.hidden = true;
    timerEl.hidden = false;

    function tick() {
      timerEl.textContent = 'Resend OTP in 00:' + (left < 10 ? '0' + left : left);
      if (left <= 0) {
        clearInterval(timerId);
        timerEl.hidden = true;
        resendBtn.hidden = false;
      }
      left--;
    }
    tick();
    timerId = setInterval(tick, 1000);
  }

  resendBtn.addEventListener('click', function () {
    // TODO: call send_otp.php again for this email
    console.log('Resend OTP to', email);
    boxes.forEach(function (b) { b.value = ''; });
    boxes[0].focus();
    startTimer();
  });

  startTimer();
  boxes[0].focus();

  // ---------- OTP boxes: auto-move, backspace, paste ----------
  boxes.forEach(function (box, i) {

    box.addEventListener('input', function () {
      box.value = box.value.replace(/\D/g, '').slice(-1);
      if (box.value && i < boxes.length - 1) boxes[i + 1].focus();
    });

    box.addEventListener('keydown', function (e) {
      if (e.key === 'Backspace' && !box.value && i > 0) {
        boxes[i - 1].focus();
        boxes[i - 1].value = '';
      }
      if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
      if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
    });

    box.addEventListener('paste', function (e) {
      e.preventDefault();
      var digits = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
      digits.split('').forEach(function (d, k) { if (boxes[k]) boxes[k].value = d; });
      boxes[Math.min(digits.length, boxes.length - 1)].focus();
    });
  });

  // ---------- Verify ----------
  form.addEventListener('submit', function (event) {
    errorBox.textContent = '';
    errorBox.closest('.field').classList.remove('has-error');

    var code = '';
    boxes.forEach(function (b) { code += b.value; });

    if (!/^\d{6}$/.test(code)) {
      event.preventDefault();
      errorBox.textContent = 'Enter the 6-digit code from your email.';
      errorBox.closest('.field').classList.add('has-error');
      var empty = Array.prototype.find.call(boxes, function (b) { return !b.value; });
      (empty || boxes[0]).focus();
      return;
    }

    otpValue.value = code;

    // Until PHP is connected, stop here
    if (form.getAttribute('action') === '#') {
      event.preventDefault();
      if (role === 'admin' || role === 'organization') {   // demo: open the portal
        window.location.href = 'dashboard.html';
        return;
      }
      if (role === 'visitor') {
        window.location.href = 'my-token.html';
        return;
      }
      alert('OTP entered: ' + code + '\nConnect this form to verify_otp.php to check it and open the ' + role + ' dashboard.');
    }
  });

});

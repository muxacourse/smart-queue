/* =========================================================
   Smart Queue – Organization tokens + Issue token
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var state = O.load();
  O.fillSidebar(state);
  document.getElementById('tokensSub').textContent = 'All tokens issued by ' + state.profile.name + '.';

  var list = O.list({
    colCount: 7,
    getRows: function () {
      return state.tokens.slice().sort(function (a, b) { return b.issuedAt - a.issuedAt; });
    },
    filter: function (t, s) { return t.status === s; },
    dateOf: function (t) { return t.tokenDate; },
    match: function (t) { return [t.token, t.visitor.name, t.visitor.email, t.visitor.phone, 'counter ' + t.counter].join(' '); },
    rowHtml: function (t, i) {
      var c = O.counterByNo(state, t.counter) || { no: t.counter, service: '' };
      return '<tr><td>' + (i + 1) + '</td><td class="strong">' + O.esc(t.token) + '</td><td>' + O.stack(t.visitor) +
             '</td><td>' + O.counterCell(c) + '</td><td>' + O.keyLabel(t.tokenDate) + '</td><td>' + O.dateTime(t.issuedAt) +
             '</td><td>' + O.statusBadge(t.status) + '</td></tr>';
    }
  });

  // ================= Issue token pop-up =================
  var modal    = document.getElementById('issueModal');
  var form     = document.getElementById('issueForm');
  var findEl   = document.getElementById('findVisitor');
  var foundBox = document.getElementById('foundBox');
  var dateEl   = document.getElementById('issueDate');
  var optsEl   = document.getElementById('counterOptions');
  var preview  = document.getElementById('previewBox');
  var warnEl   = document.getElementById('dupWarn');
  var submit   = document.getElementById('issueSubmit');
  var visitor  = null;
  var busy     = false;

  O.bindModal(modal);

  function setErr(name, msg) { form.querySelector('.error[data-for="' + name + '"]').textContent = msg || ''; }
  function chosenCounter() { var r = form.querySelector('input[name="counter"]:checked'); return r ? r.value : null; }

  function renderCounters() {
    var keep = chosenCounter();
    var key = dateEl.value || O.todayKey();
    var open = state.counters.filter(function (c) { return c.open; });
    optsEl.innerHTML = open.length ? open.map(function (c) {
      var w = O.waitingAt(state, c.no, key).length;
      return '<label class="counter-option"><input type="radio" name="counter" value="' + O.esc(c.no) + '"' + (c.no === keep ? ' checked' : '') + '>' +
             O.counterBadge(c.no) + '<span class="counter-option-text"><strong>Counter ' + O.esc(c.no) + '</strong>' +
             '<small>' + O.esc(c.service) + ' · ' + w + ' waiting</small></span></label>';
    }).join('') : '<p class="next-line">No open counters. Open one in Services / Counters.</p>';
  }

  // Same visitor + same counter + same date, still active?
  function duplicate() {
    var no = chosenCounter();
    if (!visitor || !no || !dateEl.value) return null;
    for (var i = 0; i < state.tokens.length; i++) {
      var t = state.tokens[i];
      if (t.visitor.email === visitor.email && t.counter === no && t.tokenDate === dateEl.value &&
          (t.status === 'Waiting' || t.status === 'Called')) return t;
    }
    return null;
  }

  function update() {
    var no = chosenCounter();
    var key = dateEl.value;

    // Preview
    if (no && key) {
      var c = O.counterByNo(state, no);
      var w = O.waitingAt(state, c.no, key).length;
      document.getElementById('pvToken').textContent = O.nextTokenNo(state, key);
      document.getElementById('pvCounter').textContent = 'Counter ' + c.no + ' · ' + O.keyLabel(key);
      document.getElementById('pvWait').textContent = 'Est. wait ~' + (w + 1) * c.avg + ' min';
      preview.hidden = false;
      setErr('counter');
    } else {
      preview.hidden = true;
    }

    // Duplicate warning (allowed, but staff must confirm)
    var d = duplicate();
    if (d) {
      warnEl.innerHTML = '<strong>' + O.esc(visitor.name) + '</strong> already has <strong>' + O.esc(d.token) + ' (' + d.status +
        ')</strong> at Counter ' + O.esc(d.counter) + ' on ' + O.keyLabel(d.tokenDate) + '. Issue another token only if it’s really needed.';
      warnEl.hidden = false;
      submit.lastChild.textContent = 'Issue another token';
    } else {
      warnEl.hidden = true;
      submit.lastChild.textContent = 'Issue token';
    }
  }

  function findVisitor() {
    var q = findEl.value.trim().toLowerCase();
    var digits = q.replace(/\D/g, '').slice(-10);
    visitor = null;
    setErr('visitor');
    foundBox.hidden = true;
    if (!q) { setErr('visitor', 'Enter the visitor’s email or phone number.'); update(); return; }

    for (var i = 0; i < state.visitors.length; i++) {
      var v = state.visitors[i];
      if (v.email.toLowerCase() === q || (digits.length === 10 && v.phone === digits)) { visitor = v; break; }
    }
    // TODO: search registered visitors in MySQL through PHP (AJAX)

    if (!visitor) { setErr('visitor', 'No registered visitor found with this email or phone.'); update(); return; }
    foundBox.innerHTML = O.stack(visitor) + '<span class="found-tag">✓ Registered visitor</span>';
    foundBox.hidden = false;
    update();
  }

  document.getElementById('issueBtn').addEventListener('click', function () {
    form.reset();
    visitor = null;
    busy = false;
    submit.disabled = false;
    foundBox.hidden = true;
    preview.hidden = true;
    warnEl.hidden = true;
    submit.lastChild.textContent = 'Issue token';
    setErr('visitor'); setErr('counter'); setErr('date');
    dateEl.min = O.todayKey();
    dateEl.value = O.todayKey();
    renderCounters();
    O.openModal(modal);
  });

  document.getElementById('findBtn').addEventListener('click', findVisitor);
  findEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); findVisitor(); } });
  findEl.addEventListener('input', function () { if (visitor) { visitor = null; foundBox.hidden = true; update(); } });
  optsEl.addEventListener('change', update);
  dateEl.addEventListener('change', function () { setErr('date'); renderCounters(); update(); });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;                       // stops double clicks

    var no = chosenCounter();
    var key = dateEl.value;
    var ok = true;
    setErr('date');
    if (!visitor) { setErr('visitor', 'Find a registered visitor first.'); ok = false; }
    if (!key) { setErr('date', 'Choose the token date.'); ok = false; }
    else if (key < O.todayKey()) { setErr('date', 'The token date can’t be in the past.'); ok = false; }
    if (!no) { setErr('counter', 'Choose a counter.'); ok = false; }
    if (!ok) return;

    busy = true;
    submit.disabled = true;

    var tokenNo = O.takeTokenNo(state, key);
    state.tokens.push({
      id: state.tokens.length + 1,
      token: tokenNo,
      visitor: visitor,
      counter: no,
      tokenDate: key,
      issuedAt: Date.now(),
      status: 'Waiting',
      calledAt: null,
      doneAt: null
    });
    O.save(state);
    // TODO: save in MySQL through PHP (AJAX) and notify the visitor

    O.closeModal(modal);
    list.render();
    document.querySelector('.table-wrap').scrollTop = 0;
    O.toast('Token ' + tokenNo + ' issued to ' + visitor.name + ' for Counter ' + no + ' on ' + O.keyLabel(key) + '.');
  });
});

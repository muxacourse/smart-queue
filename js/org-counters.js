/* =========================================================
   Smart Queue – Services / Counters
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var state = O.load();
  O.fillSidebar(state);

  var modal   = document.getElementById('counterModal');
  var form    = document.getElementById('counterForm');
  var title   = document.getElementById('counterModalTitle');
  var submit  = document.getElementById('counterSubmit');
  var noEl    = document.getElementById('cNo');
  var svcEl   = document.getElementById('cService');
  var avgEl   = document.getElementById('cAvg');
  var openSw  = document.getElementById('cOpen');
  var openLbl = document.getElementById('cOpenLabel');
  var noHint  = document.getElementById('cNoHint');
  var editing = null;   // counter being edited, or null when adding

  O.bindModal(modal);

  function servedToday(no) {
    return state.tokens.filter(function (t) {
      return t.counter === no && t.status === 'Served' && t.doneAt && O.isToday(t.doneAt);
    }).length;
  }

  var list = O.list({
    colCount: 7,
    empty: 'No counters yet. Click “Add counter” to create one.',
    getRows: function () {
      return state.counters.slice().sort(function (a, b) { return a.no.localeCompare(b.no, undefined, { numeric: true }); });
    },
    match: function (c) { return 'counter ' + c.no + ' ' + c.service; },
    rowHtml: function (c) {
      return '<tr>' +
        '<td><div class="status-cell"><button type="button" class="switch" role="switch" data-no="' + O.esc(c.no) + '" aria-checked="' + c.open + '" aria-label="Counter ' + O.esc(c.no) + ' open"></button>' +
        '<span class="switch-label ' + (c.open ? 'switch-label--open">Open' : 'switch-label--closed">Closed') + '</span></div></td>' +
        '<td>' + O.counterBadge(c.no) + '</td>' +
        '<td class="strong">' + O.esc(c.service) + '</td>' +
        '<td>' + c.avg + ' min</td>' +
        '<td>' + O.waitingAt(state, c.no).length + '</td>' +
        '<td>' + servedToday(c.no) + '</td>' +
        '<td><button type="button" class="btn btn--outline btn--sm" data-edit="' + O.esc(c.no) + '">Edit</button></td>' +
      '</tr>';
    }
  });

  // ---- Open / Closed switch in the table ----
  document.getElementById('tableBody').addEventListener('click', function (e) {
    var sw = e.target.closest('.switch');
    if (sw) {
      var c = O.counterByNo(state, sw.dataset.no);
      if (c.open) {
        var w = O.waitingAt(state, c.no).length;
        if (w && !confirm('Counter ' + c.no + ' has ' + w + ' waiting. Close it anyway? They stay in the queue.')) return;
      }
      c.open = !c.open;
      O.save(state);
      list.render();
      return;
    }
    var ed = e.target.closest('[data-edit]');
    if (ed) openForm(O.counterByNo(state, ed.dataset.edit));
  });

  // ---- Add / Edit pop-up ----
  function nextFreeNo() {
    for (var n = 1; n < 100; n++) {
      var no = n < 10 ? '0' + n : '' + n;
      if (!O.counterByNo(state, no)) return no;
    }
    return '';
  }

  function setSwitch(on) {
    openSw.setAttribute('aria-checked', String(on));
    openLbl.textContent = on ? 'Open' : 'Closed';
    openLbl.className = 'switch-label ' + (on ? 'switch-label--open' : 'switch-label--closed');
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach(function (e) { e.textContent = ''; });
    form.querySelectorAll('.has-error').forEach(function (e) { e.classList.remove('has-error'); });
  }

  function openForm(c) {
    editing = c || null;
    clearErrors();
    var free = nextFreeNo();
    title.textContent = c ? 'Edit counter' : 'Add counter';
    submit.lastChild.textContent = c ? 'Save changes' : 'Add counter';
    noEl.value = c ? c.no : free;
    noEl.readOnly = !!c;
    noEl.classList.toggle('is-locked', !!c);
    svcEl.value = c ? c.service : '';
    avgEl.value = c ? c.avg : 5;
    setSwitch(c ? c.open : true);
    noHint.textContent = c
      ? 'Counter no. can’t be changed because tokens are linked to it.'
      : 'Counter no. must be unique. Next free number: ' + free + '. Counters with the same service name share that service.';
    O.openModal(modal);
    if (c) svcEl.focus();
  }

  document.getElementById('addCounterBtn').addEventListener('click', function () { openForm(null); });
  openSw.addEventListener('click', function () { setSwitch(openSw.getAttribute('aria-checked') !== 'true'); });

  noEl.addEventListener('input', function () { noEl.value = noEl.value.replace(/\D/g, '').slice(0, 2); });

  function err(name, msg, input) {
    form.querySelector('.error[data-for="' + name + '"]').textContent = msg;
    if (input) input.closest('.field').classList.add('has-error');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    clearErrors();
    var ok = true;

    var no = noEl.value.trim();
    if (no.length === 1) no = '0' + no;
    var service = svcEl.value.trim();
    var avg = parseInt(avgEl.value, 10);

    if (!editing) {
      if (!/^\d{2}$/.test(no) || no === '00') { err('no', 'Enter a counter number from 01 to 99.', noEl); ok = false; }
      else if (O.counterByNo(state, no)) { err('no', 'Counter ' + no + ' already exists. Use a unique number.', noEl); ok = false; }
    }
    if (service.length < 2) { err('service', 'Enter the service name, like OPD or Billing.', svcEl); ok = false; }
    if (!(avg >= 1 && avg <= 240)) { err('avg', 'Enter the average time in minutes (1–240).', avgEl); ok = false; }
    if (!ok) return;

    var open = openSw.getAttribute('aria-checked') === 'true';
    if (editing) {
      editing.service = service;
      editing.avg = avg;
      editing.open = open;
      O.toast('Counter ' + editing.no + ' updated.');
    } else {
      state.counters.push({ no: no, service: service, avg: avg, open: open });
      O.toast('Counter ' + no + ' added.');
    }
    O.save(state);
    O.closeModal(modal);
    list.render();
  });
});

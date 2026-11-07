/* =========================================================
   Smart Queue – Organization Live Queue
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var state = O.load();
  O.fillSidebar(state);

  var select   = document.getElementById('counterSelect');
  var nowEl    = document.getElementById('nowServing');
  var actions  = document.getElementById('liveActions');
  var nextEl   = document.getElementById('nextInLine');
  var callBtn  = document.getElementById('callNext');
  var current  = null;   // counter no.

  function openCounters() { return state.counters.filter(function (c) { return c.open; }); }

  function fillSelect() {
    var list = openCounters();
    var saved = null;
    try { saved = sessionStorage.getItem('sq_live_counter'); } catch (e) {}
    select.innerHTML = list.map(function (c) {
      return '<option value="' + O.esc(c.no) + '">Counter ' + O.esc(c.no) + ' – ' + O.esc(c.service) + '</option>';
    }).join('');
    if (!list.length) { select.innerHTML = '<option value="">No open counters</option>'; current = null; return; }
    current = list.some(function (c) { return c.no === saved; }) ? saved : list[0].no;
    select.value = current;
  }

  function renderNow() {
    var c = current && O.counterByNo(state, current);
    var t = c && O.nowServing(state, c.no);
    var waiting = c ? O.waitingAt(state, c.no) : [];

    if (t) {
      var mins = Math.max(0, Math.round((Date.now() - t.calledAt) / 60000));
      nowEl.innerHTML =
        '<div class="live-top"><div>' +
          '<div class="live-label">Now serving · Counter ' + O.esc(c.no) + '</div>' +
          '<div class="live-token">' + O.bigToken(t.token) + '</div>' +
          '<div class="live-meta">Called at ' + O.time(t.calledAt) + ' · serving for ' + mins + ' min</div>' +
        '</div><div class="live-visitor">' + O.stack(t.visitor) + '</div></div>';
    } else {
      nowEl.innerHTML =
        '<div class="live-top"><div>' +
          '<div class="live-label">Now serving' + (c ? ' · Counter ' + O.esc(c.no) : '') + '</div>' +
          '<div class="live-token live-token--idle">' + (c ? 'No token called yet' : 'Open a counter first') + '</div>' +
        '</div></div>';
    }

    actions.querySelectorAll('button').forEach(function (b) { b.disabled = !t; });
    callBtn.disabled = !c || !waiting.length;

    nextEl.innerHTML = waiting.length
      ? 'Next in line: <strong>' + O.esc(waiting[0].token) + ' · ' + O.esc(waiting[0].visitor.name) + '</strong>'
      : 'No one is waiting at this counter.';

    // Stats
    var servedToday = state.tokens.filter(function (x) {
      return x.counter === current && x.status === 'Served' && x.doneAt && O.isToday(x.doneAt);
    }).length;
    document.getElementById('statsTitle').textContent = c ? 'Queue at Counter ' + c.no : 'Queue';
    document.getElementById('lsWaiting').textContent = waiting.length;
    document.getElementById('lsServed').textContent = servedToday;
    document.getElementById('lsAvg').textContent = c ? c.avg + ' min' : '–';
    document.getElementById('lsLast').textContent = c && waiting.length ? '~' + waiting.length * c.avg + ' min' : '–';
  }

  // Waiting list of the selected counter
  var list = O.list({
    colCount: 6,
    empty: 'No one is waiting at this counter.',
    getRows: function () { return current ? O.waitingAt(state, current) : []; },
    match: function (t) { return [t.token, t.visitor.name, t.visitor.email, t.visitor.phone].join(' '); },
    rowHtml: function (t, i) {
      return '<tr><td>' + (i + 1) + '</td><td class="strong">' + O.esc(t.token) + '</td><td>' + O.stack(t.visitor) +
             '</td><td>' + O.time(t.issuedAt) + '</td><td>~' + O.estWait(state, t) + ' min</td><td>' + O.statusBadge(t.status) + '</td></tr>';
    }
  });

  function refresh() { renderNow(); list.render(); }

  function finish(status) {
    var t = O.nowServing(state, current);
    if (!t) return;
    if (status === 'Cancelled' && !confirm('Cancel token ' + t.token + '?')) return;
    t.status = status;
    t.doneAt = Date.now();
    O.save(state);
    O.toast(t.token + ' marked as ' + status.toLowerCase() + '.');
    refresh();
  }

  actions.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-action]');
    if (b && !b.disabled) finish(b.dataset.action);
  });

  callBtn.addEventListener('click', function () {
    var cur = O.nowServing(state, current);
    if (cur) {
      if (!confirm(cur.token + ' is still being served. Mark it as served and call the next token?')) return;
      cur.status = 'Served';
      cur.doneAt = Date.now();
    }
    var next = O.waitingAt(state, current)[0];
    if (!next) { O.save(state); refresh(); return; }
    next.status = 'Called';
    next.calledAt = Date.now();
    O.save(state);
    // TODO: notify the visitor (live update / email) from PHP
    O.toast('Called ' + next.token + ' to Counter ' + current + '.');
    refresh();
  });

  select.addEventListener('change', function () {
    current = select.value || null;
    try { sessionStorage.setItem('sq_live_counter', current); } catch (e) {}
    refresh();
    document.querySelector('.table-wrap').scrollTop = 0;
  });

  window.addEventListener('storage', function () {
    state = O.load();
    fillSelect();
    refresh();
  });

  fillSelect();
  refresh();
});

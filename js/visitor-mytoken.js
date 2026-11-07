/* =========================================================
   Smart Queue – Visitor: My Token
   Today:    "Called now" (only when a token is called) + Waiting cards
   Upcoming: future tokens in a paged table
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;          // shared helpers (format, list)
  var V = window.SQ_VIS;
  var state = V.load();
  V.fillSidebar(state);

  var today = O.todayKey();
  document.getElementById('todayTitle').textContent = 'Today · ' + O.keyLabel(today);

  function active(t) { return t.status === 'Waiting' || t.status === 'Called'; }

  function head(t) {
    return '<div class="tok-head"><span class="tok-org">' + O.esc(t.org) + '</span>' + V.statusBadge(t.status) + '</div>';
  }

  function cancelBtn(t, small) {
    return '<button type="button" class="btn btn--red' + (small ? ' btn--sm' : '') + '" data-cancel="' + O.esc(t.token) + '|' + O.esc(t.org) + '">Cancel token</button>';
  }

  function calledCard(t) {
    return '<article class="tok-card tok-card--called">' + head(t) +
      '<div class="called-banner">It’s your turn! Please go to Counter ' + O.esc(t.counter.no) + ' now.</div>' +
      '<div class="called-row">' +
        '<div><div class="tok-label">Your token</div><div class="tok-big">' + O.bigToken(t.token) + '</div></div>' +
        V.counterCell(t.counter, true) +
        '<span class="tok-meta">Called at ' + O.time(t.calledAt) + '</span>' +
        cancelBtn(t) +
      '</div></article>';
  }

  function waitCard(t) {
    return '<article class="tok-card">' + head(t) +
      '<div class="tok-big tok-big--sm">' + O.bigToken(t.token) + '</div>' +
      V.counterCell(t.counter, true) +
      '<div class="tok-stats">' +
        '<div class="ts ts--amber"><span>Ahead</span><strong>' + t.ahead + '</strong></div>' +
        '<div class="ts ts--teal"><span>Est. wait</span><strong>~' + t.estWait + ' min</strong></div>' +
        '<div class="ts"><span>Serving</span><strong>' + O.esc(t.nowServing || '–') + '</strong></div>' +
      '</div>' + cancelBtn(t, true) + '</article>';
  }

  function renderToday() {
    var list = state.tokens.filter(function (t) { return t.tokenDate === today && active(t); });
    var called = list.filter(function (t) { return t.status === 'Called'; });
    var waiting = list.filter(function (t) { return t.status === 'Waiting'; })
                      .sort(function (a, b) { return a.estWait - b.estWait; });

    document.getElementById('todayCount').textContent = list.length + (list.length === 1 ? ' token today' : ' tokens today');

    document.getElementById('calledWrap').hidden = !called.length;
    document.getElementById('calledList').innerHTML = called.map(calledCard).join('');

    document.getElementById('waitingWrap').hidden = !waiting.length;
    document.getElementById('waitingTitle').textContent = 'Waiting · ' + waiting.length;
    document.getElementById('waitingList').innerHTML = waiting.map(waitCard).join('');

    document.getElementById('noToday').hidden = list.length > 0;
  }

  // Upcoming: future tokens, nearest date first
  var upcoming = O.list({
    colCount: 7,
    empty: 'No upcoming tokens.',
    getRows: function () {
      return state.tokens
        .filter(function (t) { return t.tokenDate > today && active(t); })
        .sort(function (a, b) { return a.tokenDate < b.tokenDate ? -1 : a.tokenDate > b.tokenDate ? 1 : a.issuedAt - b.issuedAt; });
    },
    match: function (t) { return t.token + ' ' + t.org; },
    rowHtml: function (t, i) {
      return '<tr><td>' + (i + 1) + '</td><td class="strong">' + O.esc(t.token) + '</td><td>' + O.keyLabel(t.tokenDate) +
        '</td><td class="strong">' + O.esc(t.org) + '</td><td>' + V.counterCell(t.counter, false) + '</td><td>' + O.dateTime(t.issuedAt) +
        '</td><td><button type="button" class="btn btn--red btn--sm" data-cancel="' + O.esc(t.token) + '|' + O.esc(t.org) + '">Cancel</button></td></tr>';
    }
  });

  // Cancel (today cards and upcoming table)
  document.querySelector('.admin-main').addEventListener('click', function (e) {
    var b = e.target.closest('[data-cancel]');
    if (!b) return;
    var parts = b.dataset.cancel.split('|');
    var tok = state.tokens.find(function (t) { return t.token === parts[0] && t.org === parts[1]; });
    if (!tok || !confirm('Cancel token ' + tok.token + ' at ' + tok.org + '?')) return;
    tok.status = 'Cancelled';
    V.save(state);
    // TODO: send the cancel to PHP (AJAX) so the organization's queue updates
    O.toast('Token ' + tok.token + ' cancelled.');
    renderToday();
    upcoming.render();
  });

  // Live updates: in the real app, ask PHP every few seconds, e.g.
  // setInterval(function () { fetch('../api/my_tokens.php').then(...).then(renderToday); }, 5000);
  window.addEventListener('storage', function () { state = V.load(); renderToday(); upcoming.render(); });

  renderToday();
});

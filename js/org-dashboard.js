/* =========================================================
   Smart Queue – Organization dashboard
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var state = O.load();
  O.fillSidebar(state);

  function renderTop() {
    var today = state.tokens.filter(function (t) { return O.isToday(t.issuedAt); });
    var count = function (s) { return today.filter(function (t) { return t.status === s; }).length; };

    // Average waiting time = time from issue to being called (today's tokens)
    var called = state.tokens.filter(function (t) { return t.calledAt && O.isToday(t.calledAt) && t.tokenDate === O.todayKey(); });
    var avg = called.length
      ? Math.round(called.reduce(function (sum, t) { return sum + (t.calledAt - t.issuedAt); }, 0) / called.length / 60000)
      : 0;

    document.getElementById('todayLine').textContent = 'Today at ' + state.profile.name + ' · ' + O.date(Date.now());
    document.getElementById('stIssued').textContent  = today.length;
    var todayKey = O.todayKey();
    document.getElementById('stWaiting').textContent = state.tokens.filter(function (t) { return t.status === 'Waiting' && t.tokenDate === todayKey; }).length;
    document.getElementById('stServed').textContent  = count('Served');
    document.getElementById('stNoShow').textContent  = count('No show');
    document.getElementById('stAvgWait').textContent = avg + ' min';

    // Now serving cards: only counters that are serving a token right now
    document.getElementById('counterCards').innerHTML = state.counters
      .filter(function (c) { return c.open && O.nowServing(state, c.no); })
      .map(function (c) {
        var t = O.nowServing(state, c.no);
        return '<div class="counter-card"><div class="counter-card-head"><span class="counter-cell">' + O.counterBadge(c.no) +
               '<span>Counter ' + O.esc(c.no) + '</span></span><small>' + O.esc(c.service) + '</small></div>' +
               '<div class="now-box"><span>Now serving</span><strong>' + O.bigToken(t.token) + '</strong></div>' +
               '<div class="counter-card-foot"><span><strong>' + O.esc(t.visitor.name) + '</strong></span><span>since ' + O.time(t.calledAt) + '</span></div></div>';
      }).join('') || '<p class="next-line">No counter is serving a token right now.</p>';
  }

  // Up next: every waiting token, oldest first
  var list = O.list({
    colCount: 6,
    empty: 'No one is waiting right now.',
    getRows: function () {
      return state.tokens
        .filter(function (t) { return t.status === 'Waiting' && t.tokenDate === O.todayKey(); })
        .sort(function (a, b) { return a.issuedAt - b.issuedAt; });
    },
    match: function (t) { return [t.token, t.visitor.name, t.visitor.email, t.visitor.phone].join(' '); },
    rowHtml: function (t, i) {
      var c = O.counterByNo(state, t.counter) || { no: t.counter, service: '' };
      return '<tr><td>' + (i + 1) + '</td><td class="strong">' + O.esc(t.token) + '</td><td>' + O.stack(t.visitor) +
             '</td><td>' + O.counterCell(c) + '</td><td>' + O.time(t.issuedAt) + '</td><td>~' + O.estWait(state, t) + ' min</td></tr>';
    }
  });

  renderTop();

  // Refresh when another tab (e.g. Live Queue) changes the data
  window.addEventListener('storage', function () {
    state = O.load();
    renderTop();
    list.render();
  });
});

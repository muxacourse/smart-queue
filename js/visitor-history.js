/* =========================================================
   Smart Queue – Visitor: Token History
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var O = window.SQ_ORG;
  var V = window.SQ_VIS;
  var state = V.load();
  V.fillSidebar(state);

  O.list({
    colCount: 7,
    getRows: function () {
      return state.tokens.slice().sort(function (a, b) { return b.issuedAt - a.issuedAt; });
    },
    filter: function (t, s) { return t.status === s; },
    dateOf: function (t) { return t.tokenDate; },
    match: function (t) { return t.token + ' ' + t.org + ' counter ' + t.counter.no + ' ' + t.counter.service; },
    rowHtml: function (t, i) {
      return '<tr><td>' + (i + 1) + '</td><td class="strong">' + O.esc(t.token) + '</td><td class="strong">' + O.esc(t.org) +
        '</td><td>' + V.counterCell(t.counter, false) + '</td><td>' + O.keyLabel(t.tokenDate) + '</td><td>' + O.dateTime(t.issuedAt) +
        '</td><td>' + V.statusBadge(t.status) + '</td></tr>';
    }
  });
});

/* =========================================================
   Smart Queue – Admin listing (Tokens / Visitors / Organizations)
   Per-page dropdown, search and pagination.
   Organizations also have an Active / Blocked switch.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var isOrg   = !!document.getElementById('organizationsList');
  var isToken = !!document.getElementById('tokensList');
  var data    = window.SQ_DATA || { visitors: [], organizations: [], tokens: [] };
  var all     = isToken ? data.tokens : isOrg ? data.organizations : data.visitors;

  var perPageEl = document.getElementById('perPage');
  var searchEl  = document.getElementById('search');
  var tbody     = document.getElementById('tableBody');
  var infoEl    = document.getElementById('pageInfo');
  var pagerEl   = document.getElementById('pagination');
  var statusEl  = document.getElementById('statusFilter');   // Tokens page only
  var dateEl    = document.getElementById('dateFilter');     // Tokens page only

  var state = { page: 1, perPage: 50, query: '', status: '', date: '' };
  var colCount = isOrg ? 6 : 7;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function filtered() {
    var q = state.query.toLowerCase();
    var rows = all.filter(function (r) {
      if (state.status && r.status !== state.status) return false;
      if (state.date && r.tokenDateKey !== state.date) return false;
      return true;
    });
    if (!q) return rows;
    return rows.filter(function (r) {
      var text = isToken
        ? [r.token, r.visitor.name, r.visitor.email, r.visitor.phone, r.org.name, r.org.email, r.org.phone]
        : isOrg
          ? [r.name, r.contact, r.email, r.phone]
          : [r.name, r.email, r.phone];
      return text.join(' ').toLowerCase().indexOf(q) !== -1;
    });
  }

  function stack(p) {
    return '<div class="cell-stack"><span class="cell-main">' + esc(p.name) + '</span>' +
           '<span>' + esc(p.email) + '</span><span>' + esc(p.phone) + '</span></div>';
  }

  function rowHtml(r) {
    if (isToken) {
      return '<tr>' +
        '<td>' + r.id + '</td>' +
        '<td class="strong">' + esc(r.token) + '</td>' +
        '<td>' + stack(r.visitor) + '</td>' +
        '<td>' + stack(r.org) + '</td>' +
        '<td>' + esc(r.tokenDate) + '</td>' +
        '<td>' + esc(r.issued) + '</td>' +
        '<td><span class="status status--' + r.status.toLowerCase().replace(/\s+/g, '-') + '">' + esc(r.status) + '</span></td>' +
      '</tr>';
    }
    if (isOrg) {
      var on = r.active;
      return '<tr>' +
        '<td><div class="status-cell">' +
          '<button type="button" class="switch" role="switch" data-id="' + r.id + '" aria-checked="' + on + '" aria-label="Active status for ' + esc(r.name) + '"></button>' +
          '<span class="switch-label ' + (on ? 'switch-label--active">Active' : 'switch-label--blocked">Blocked') + '</span>' +
        '</div></td>' +
        '<td class="strong">' + esc(r.name) + '</td>' +
        '<td>' + esc(r.contact) + '</td>' +
        '<td>' + esc(r.email) + '</td>' +
        '<td>' + esc(r.phone) + '</td>' +
        '<td>' + esc(r.registered) + '</td>' +
      '</tr>';
    }
    return '<tr>' +
      '<td>' + r.id + '</td>' +
      '<td class="strong">' + esc(r.name) + '</td>' +
      '<td>' + esc(r.email) + '</td>' +
      '<td>' + esc(r.phone) + '</td>' +
      '<td>' + esc(r.gender) + '</td>' +
      '<td>' + esc(r.dob) + '</td>' +
      '<td>' + esc(r.registered) + '</td>' +
    '</tr>';
  }

  // Page numbers like: 1 2 3 … 25  (with the current page and its neighbours)
  function pageList(current, total) {
    var pages = [];
    for (var p = 1; p <= total; p++) {
      if (p === 1 || p === total || Math.abs(p - current) <= 1 || (current <= 3 && p <= 3)) {
        pages.push(p);
      } else if (pages[pages.length - 1] !== '…') {
        pages.push('…');
      }
    }
    return pages;
  }

  function render() {
    var rows = filtered();
    var total = rows.length;
    var pages = Math.max(1, Math.ceil(total / state.perPage));
    if (state.page > pages) state.page = pages;

    var start = (state.page - 1) * state.perPage;
    var slice = rows.slice(start, start + state.perPage);

    tbody.innerHTML = slice.length
      ? slice.map(rowHtml).join('')
      : '<tr class="empty-row"><td colspan="' + colCount + '">No results found.</td></tr>';

    infoEl.innerHTML = total
      ? 'Showing <strong>' + (start + 1) + '–' + (start + slice.length) + '</strong> of <strong>' + total.toLocaleString('en-IN') + '</strong>'
      : 'Showing <strong>0</strong> results';

    var html = '<button type="button" class="page-btn" data-page="' + (state.page - 1) + '"' + (state.page === 1 ? ' disabled' : '') + '>‹ Prev</button>';
    pageList(state.page, pages).forEach(function (p) {
      html += p === '…'
        ? '<span class="page-gap">…</span>'
        : '<button type="button" class="page-btn" data-page="' + p + '"' + (p === state.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
    });
    html += '<button type="button" class="page-btn" data-page="' + (state.page + 1) + '"' + (state.page === pages ? ' disabled' : '') + '>Next ›</button>';
    pagerEl.innerHTML = html;
  }

  // ---- Events ----
  perPageEl.addEventListener('change', function () {
    state.perPage = parseInt(perPageEl.value, 10);
    state.page = 1;
    render();
    document.querySelector('.table-wrap').scrollTop = 0;
  });

  if (dateEl) {
    dateEl.addEventListener('change', function () {
      state.date = dateEl.value;
      state.page = 1;
      render();
      document.querySelector('.table-wrap').scrollTop = 0;
    });
  }

  if (statusEl) {
    statusEl.addEventListener('change', function () {
      state.status = statusEl.value;
      state.page = 1;
      render();
      document.querySelector('.table-wrap').scrollTop = 0;
    });
  }

  var timer;
  searchEl.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () {
      state.query = searchEl.value.trim();
      state.page = 1;
      render();
    }, 200);
  });

  pagerEl.addEventListener('click', function (e) {
    var btn = e.target.closest('.page-btn');
    if (!btn || btn.disabled) return;
    state.page = parseInt(btn.dataset.page, 10);
    render();
    document.querySelector('.table-wrap').scrollTop = 0;
  });

  // Organization Active / Blocked switch
  if (isOrg) {
    tbody.addEventListener('click', function (e) {
      var sw = e.target.closest('.switch');
      if (!sw) return;

      var org = all.find(function (o) { return String(o.id) === sw.dataset.id; });
      if (!org) return;

      var next = !org.active;
      if (!next && !confirm('Block "' + org.name + '"? They will not be able to log in.')) return;

      org.active = next;
      // TODO: save to database, e.g.
      // fetch('api/org_status.php', { method: 'POST', body: new URLSearchParams({ id: org.id, active: next ? 1 : 0 }) });

      sw.setAttribute('aria-checked', String(next));
      var label = sw.nextElementSibling;
      label.className = 'switch-label ' + (next ? 'switch-label--active' : 'switch-label--blocked');
      label.textContent = next ? 'Active' : 'Blocked';
    });
  }

  render();
});

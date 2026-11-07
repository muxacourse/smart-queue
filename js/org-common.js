/* =========================================================
   Smart Queue – Organization portal: shared helpers
   ========================================================= */

window.SQ_ORG = (function () {

  var KEY = 'sq_org_demo_v3';

  // ---------- Data (kept in this browser for the demo) ----------
  function load() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* storage blocked */ }
    var fresh = window.SQ_ORG_SEED();
    save(fresh);
    return fresh;
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    // TODO: replace with fetch() calls to your PHP API
  }

  // ---------- Formatting ----------
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  function time(ms) {
    var d = new Date(ms), h = d.getHours(), ap = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return pad(h) + ':' + pad(d.getMinutes()) + ' ' + ap;
  }

  function date(ms) {
    var d = new Date(ms);
    return pad(d.getDate()) + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function dateTime(ms) { return date(ms) + ', ' + time(ms); }

  // 'YYYY-MM-DD' for a time (local date)
  function dateKey(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  function todayKey() { return dateKey(Date.now()); }

  // '2026-11-06' -> '06 Nov 2026'
  function keyLabel(key) {
    var p = key.split('-');
    return p[2] + ' ' + MONTHS[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }

  // Token number shown big: small date part + big running number
  function bigToken(no) {
    var p = String(no).split('-');
    return '<span class="big-token"><span class="bt-date">' + esc(p[0]) + '-</span><span class="bt-num">' + esc(p[1] || '') + '</span></span>';
  }

  function isToday(ms) {
    var a = new Date(ms), b = new Date();
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function phone(p) {
    var d = String(p).replace(/\D/g, '').slice(-10);
    return '+91 ' + d.slice(0, 5) + ' ' + d.slice(5);
  }

  function counterBadge(no) { return '<span class="counter-no">' + esc(no) + '</span>'; }

  // Counter badge + service name + Open / Closed label
  function counterCell(c) {
    var state = c.open === false
      ? '<span class="oc-badge oc-badge--closed">Closed</span>'
      : '<span class="oc-badge oc-badge--open">Open</span>';
    return '<div class="counter-cell">' + counterBadge(c.no) + '<span>' + esc(c.service) + '</span>' + state + '</div>';
  }

  function stack(v) {
    return '<div class="cell-stack"><span class="cell-main">' + esc(v.name) + '</span>' +
           '<span>' + esc(v.email) + '</span><span>' + esc(phone(v.phone)) + '</span></div>';
  }

  function statusBadge(s) {
    return '<span class="status status--' + s.toLowerCase().replace(/\s+/g, '-') + '">' + esc(s) + '</span>';
  }

  // ---------- Queue maths ----------
  function counterByNo(state, no) {
    for (var i = 0; i < state.counters.length; i++) if (state.counters[i].no === no) return state.counters[i];
    return null;
  }

  // Waiting tokens of one counter, oldest first
  function waitingAt(state, no, key) {
    key = key || todayKey();
    return state.tokens
      .filter(function (t) { return t.status === 'Waiting' && t.counter === no && t.tokenDate === key; })
      .sort(function (a, b) { return a.issuedAt - b.issuedAt; });
  }

  // Estimated wait = people up to and including you × average service time
  function estWait(state, token) {
    var c = counterByNo(state, token.counter);
    var list = waitingAt(state, token.counter, token.tokenDate);
    var pos = list.indexOf(token) + 1;
    return c ? pos * c.avg : 0;
  }

  function nowServing(state, no) {
    var today = todayKey();
    var called = state.tokens.filter(function (t) { return t.status === 'Called' && t.counter === no && t.tokenDate === today; });
    called.sort(function (a, b) { return b.calledAt - a.calledAt; });
    return called[0] || null;
  }

  // Next number for a token date: YYMMDD-NNN (NNN starts at 001 for every date)
  function nextTokenNo(state, key) {
    var n = ((state.daySeq && state.daySeq[key]) || 0) + 1;
    return key.slice(2).replace(/-/g, '') + '-' + (n < 10 ? '00' + n : n < 100 ? '0' + n : n);
  }

  function takeTokenNo(state, key) {
    var no = nextTokenNo(state, key);
    state.daySeq = state.daySeq || {};
    state.daySeq[key] = (state.daySeq[key] || 0) + 1;
    return no;
  }

  // ---------- Sidebar ----------
  function fillSidebar(state) {
    var parts = state.profile.name.split(' – ');
    document.getElementById('sideOrgName').textContent = parts[0];
    document.getElementById('sideOrgSub').textContent = parts.slice(1).join(' – ');
  }

  // ---------- Small message at the bottom ----------
  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('sqToast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sqToast';
      el.setAttribute('role', 'status');
      el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:60;background:#0F172A;color:#fff;padding:12px 18px;border-radius:12px;font-weight:600;font-size:14px;box-shadow:0 12px 30px rgba(15,23,42,.25);max-width:90vw';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.hidden = true; }, 3000);
  }

  // ---------- Pop-ups ----------
  function openModal(el) {
    el.hidden = false;
    var first = el.querySelector('input:not([readonly]), select, button:not([data-close])');
    if (first) first.focus();
  }

  function closeModal(el) { el.hidden = true; }

  function bindModal(el) {
    el.addEventListener('click', function (e) {
      if (e.target === el || e.target.closest('[data-close]')) closeModal(el);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !el.hidden) closeModal(el);
    });
  }

  // ---------- Paged, searchable list ----------
  // opts: getRows(), match(row, q), filter(row, status), rowHtml(row, i), colCount, empty
  function list(opts) {
    var perPageEl = document.getElementById('perPage');
    var searchEl  = document.getElementById('search');
    var statusEl  = document.getElementById('statusFilter');
    var dateEl    = document.getElementById('dateFilter');
    var tbody     = document.getElementById('tableBody');
    var infoEl    = document.getElementById('pageInfo');
    var pagerEl   = document.getElementById('pagination');
    var wrap      = tbody.closest('.table-wrap');

    var st = { page: 1, perPage: perPageEl ? parseInt(perPageEl.value, 10) : 50, q: '', status: '', date: '' };

    function pages(cur, total) {
      var out = [];
      for (var p = 1; p <= total; p++) {
        if (p === 1 || p === total || Math.abs(p - cur) <= 1 || (cur <= 3 && p <= 3)) out.push(p);
        else if (out[out.length - 1] !== '…') out.push('…');
      }
      return out;
    }

    function render() {
      var rows = opts.getRows();
      if (st.status && opts.filter) rows = rows.filter(function (r) { return opts.filter(r, st.status); });
      if (st.date && opts.dateOf) rows = rows.filter(function (r) { return opts.dateOf(r) === st.date; });
      if (st.q) {
        var q = st.q.toLowerCase();
        rows = rows.filter(function (r) { return opts.match(r).toLowerCase().indexOf(q) !== -1; });
      }

      var total = rows.length;
      var last = Math.max(1, Math.ceil(total / st.perPage));
      if (st.page > last) st.page = last;
      var start = (st.page - 1) * st.perPage;
      var slice = rows.slice(start, start + st.perPage);

      tbody.innerHTML = slice.length
        ? slice.map(function (r, i) { return opts.rowHtml(r, start + i); }).join('')
        : '<tr class="empty-row"><td colspan="' + opts.colCount + '">' + (opts.empty || 'No results found.') + '</td></tr>';

      infoEl.innerHTML = total
        ? 'Showing <strong>' + (start + 1) + '–' + (start + slice.length) + '</strong> of <strong>' + total.toLocaleString('en-IN') + '</strong>'
        : 'Showing <strong>0</strong> results';

      var h = '<button type="button" class="page-btn" data-page="' + (st.page - 1) + '"' + (st.page === 1 ? ' disabled' : '') + '>‹ Prev</button>';
      pages(st.page, last).forEach(function (p) {
        h += p === '…' ? '<span class="page-gap">…</span>'
          : '<button type="button" class="page-btn" data-page="' + p + '"' + (p === st.page ? ' aria-current="page"' : '') + '>' + p + '</button>';
      });
      h += '<button type="button" class="page-btn" data-page="' + (st.page + 1) + '"' + (st.page === last ? ' disabled' : '') + '>Next ›</button>';
      pagerEl.innerHTML = h;
    }

    function toTop() { if (wrap) wrap.scrollTop = 0; }

    if (perPageEl) perPageEl.addEventListener('change', function () {
      st.perPage = parseInt(perPageEl.value, 10); st.page = 1; render(); toTop();
    });
    if (dateEl) dateEl.addEventListener('change', function () {
      st.date = dateEl.value; st.page = 1; render(); toTop();
    });
    if (statusEl) statusEl.addEventListener('change', function () {
      st.status = statusEl.value; st.page = 1; render(); toTop();
    });
    var timer;
    if (searchEl) searchEl.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { st.q = searchEl.value.trim(); st.page = 1; render(); toTop(); }, 200);
    });
    pagerEl.addEventListener('click', function (e) {
      var b = e.target.closest('.page-btn');
      if (!b || b.disabled) return;
      st.page = parseInt(b.dataset.page, 10); render(); toTop();
    });

    render();
    return { render: render };
  }

  return {
    load: load, save: save, esc: esc, time: time, date: date, dateTime: dateTime, isToday: isToday,
    phone: phone, counterBadge: counterBadge, counterCell: counterCell, stack: stack, statusBadge: statusBadge,
    counterByNo: counterByNo, waitingAt: waitingAt, estWait: estWait, nowServing: nowServing,
    nextTokenNo: nextTokenNo, takeTokenNo: takeTokenNo, dateKey: dateKey, todayKey: todayKey,
    keyLabel: keyLabel, bigToken: bigToken, fillSidebar: fillSidebar, toast: toast,
    openModal: openModal, closeModal: closeModal, bindModal: bindModal, list: list
  };
})();

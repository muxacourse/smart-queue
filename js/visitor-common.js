/* =========================================================
   Smart Queue – Visitor portal: data + sidebar
   (uses the shared list / format helpers in org-common.js)
   ========================================================= */

window.SQ_VIS = (function () {

  var KEY = 'sq_visitor_demo_v1';

  function load() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) { /* storage blocked */ }
    var fresh = window.SQ_VISITOR_SEED();
    save(fresh);
    return fresh;
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    // TODO: replace with AJAX calls to your PHP API
  }

  function fillSidebar(state) {
    var p = state.profile;
    var initials = p.name.trim().split(/\s+/).map(function (w) { return w.charAt(0); }).slice(0, 2).join('').toUpperCase();
    document.getElementById('visAvatar').textContent = initials;
    document.getElementById('visName').textContent = p.name;
    document.getElementById('visEmail').textContent = p.email;
  }

  // Counter badge + service (+ Open / Closed when asked)
  function counterCell(c, withState) {
    var O = window.SQ_ORG;
    var st = '';
    if (withState) {
      st = c.open
        ? '<span class="oc-badge oc-badge--open">Open</span>'
        : '<span class="oc-badge oc-badge--closed">Closed</span>';
    }
    return '<div class="counter-cell">' + O.counterBadge(c.no) + '<span>' + O.esc(c.service) + '</span>' + st + '</div>';
  }

  function statusBadge(s) {
    return window.SQ_ORG.statusBadge(s).replace('status--called', 'status--called status--called-vis');
  }

  return { load: load, save: save, fillSidebar: fillSidebar, counterCell: counterCell, statusBadge: statusBadge };
})();

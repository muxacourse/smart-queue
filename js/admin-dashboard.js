/* =========================================================
   Smart Queue – Admin dashboard
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  var data = window.SQ_DATA || { visitors: [], organizations: [], tokens: [] };

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Counts
  document.getElementById('totalTokens').textContent = data.tokens.length.toLocaleString('en-IN');
  document.getElementById('totalOrgs').textContent = data.organizations.length.toLocaleString('en-IN');
  document.getElementById('totalVisitors').textContent = data.visitors.length.toLocaleString('en-IN');

  // Latest 5 organizations (data is newest first)
  document.getElementById('latestOrgs').innerHTML = data.organizations.slice(0, 5).map(function (o) {
    var st = o.active
      ? '<span class="status status--active">Active</span>'
      : '<span class="status status--blocked">Blocked</span>';
    return '<tr><td class="strong">' + esc(o.name) + '</td><td>' + esc(o.contact) + '</td><td>' + esc(o.email) +
           '</td><td>' + st + '</td><td>' + esc(o.registered) + '</td></tr>';
  }).join('');

  // Latest 5 visitors
  document.getElementById('latestVisitors').innerHTML = data.visitors.slice(0, 5).map(function (v) {
    return '<tr><td class="strong">' + esc(v.name) + '</td><td>' + esc(v.email) + '</td><td>' +
           esc(v.phone) + '</td><td>' + esc(v.registered) + '</td></tr>';
  }).join('');

});

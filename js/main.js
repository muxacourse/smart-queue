/* =========================================================
   Smart Queue – Home page script
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {

  // 1. Keep the footer year current
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 2. Remember which portal the user picked (organization / visitor).
  //    The login & register pages can read this to show the right title,
  //    but the SERVER must still check the role after login.
  var portalLinks = document.querySelectorAll('.portal .btn');

  portalLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var portal = link.closest('.portal');
      var role = portal.classList.contains('portal--org') ? 'organization' : 'visitor';
      try {
        sessionStorage.setItem('sq_selected_role', role);
      } catch (e) {
        /* storage blocked – safe to ignore */
      }
    });
  });

});

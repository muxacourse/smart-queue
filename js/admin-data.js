/* =========================================================
   Smart Queue – Admin SAMPLE DATA (for testing the pages)
   Replace this file with real data from PHP / MySQL later,
   e.g. fetch('api/visitors.php') returning the same shape.
   ========================================================= */

window.SQ_DATA = (function () {

  var first = ['Ananya','Rahul','Priya','Soumik','Riya','Arjun','Sneha','Amit','Debjani','Sourav','Pooja','Ankit','Moumita','Ritam','Tania','Sayan'];
  var last  = ['Sen','Das','Mukherjee','Ghosh','Banerjee','Paul','Roy','Chatterjee','Bose','Saha','Dey','Pal'];
  var orgNames = ['City Care Clinic','Lakeview Diagnostics','Sunrise Bank','Metro Passport Seva','Green Leaf Hospital','QuickFix Service Centre','Apex Dental Studio','Behala Health Point','Unity Eye Care','Prime Pathology Lab','Southern Avenue Bank','Riverside Polyclinic'];
  var branches = ['Behala','Tollygunge','Salt Lake','Garia','Howrah','Park Street','Jadavpur','New Town'];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function dateDaysAgo(d) {
    var dt = new Date(2026, 10, 2);           // 2 Nov 2026
    dt.setDate(dt.getDate() - d);
    return dt;
  }

  function fmt(dt) {
    var m = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return pad(dt.getDate()) + ' ' + m[dt.getMonth()] + ' ' + dt.getFullYear();
  }

  function phone(i) {
    var n = String(9830000000 + i * 7919).slice(0, 10);
    return '+91 ' + n.slice(0, 5) + ' ' + n.slice(5);
  }

  // ---- Visitors (newest first) ----
  var visitors = [];
  for (var i = 0; i < 1248; i++) {
    var fn = first[i % first.length];
    var ln = last[(i * 7) % last.length];
    var dob = new Date(1980 + (i % 25), (i * 3) % 12, 1 + (i % 28));
    visitors.push({
      id: i + 1,
      name: fn + ' ' + ln,
      email: (fn + '.' + ln + (i > 15 ? i : '')).toLowerCase() + '@gmail.com',
      phone: phone(i),
      gender: i % 3 === 2 ? 'Other' : (i % 2 ? 'Male' : 'Female'),
      dob: fmt(dob),
      registered: fmt(dateDaysAgo(Math.floor(i / 6)))
    });
  }

  // ---- Organizations (newest first) ----
  var organizations = [];
  for (var j = 0; j < 186; j++) {
    var base = orgNames[j % orgNames.length];
    var br = branches[Math.floor(j / orgNames.length) % branches.length];
    var cfn = first[(j * 5) % first.length];
    var cln = last[(j * 3) % last.length];
    organizations.push({
      id: j + 1,
      name: base + ' – ' + br,
      contact: cfn + ' ' + cln,
      email: 'office' + (j + 1) + '@' + base.toLowerCase().replace(/[^a-z]/g, '') + '.in',
      phone: phone(j + 500),
      active: j % 7 !== 2,
      registered: fmt(dateDaysAgo(j))
    });
  }

  // ---- Tokens ----
  // Token number = YYMMDD-NNN: token date + running number per organization and date
  function dateKey(dt) { return dt.getFullYear() + '-' + pad(dt.getMonth() + 1) + '-' + pad(dt.getDate()); }

  var statuses = ['Waiting', 'Called', 'Served', 'Served', 'Served', 'No show', 'Cancelled'];
  var tokens = [];
  var start = new Date(2026, 10, 2, 10, 45);
  for (var k = 24614; k >= 0; k--) {                         // oldest first, so numbers follow issue order
    var org = organizations[(k * 7) % organizations.length];
    var vis = visitors[(k * 13) % visitors.length];
    var issued = new Date(start.getTime() - k * 4 * 60000);  // one token every 4 minutes
    var tDate = new Date(issued.getTime());
    if (k % 9 === 4) tDate.setDate(tDate.getDate() + 1 + (k % 5));   // some tokens are for a later date
    var h = issued.getHours(), ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    tokens.push({
      id: 0,
      orgId: org.id,
      tokenDateKey: dateKey(tDate),
      tokenDate: fmt(tDate),
      visitor: { name: vis.name, email: vis.email, phone: vis.phone },
      org: { name: org.name, email: org.email, phone: org.phone },
      issued: fmt(issued) + ', ' + pad(h) + ':' + pad(issued.getMinutes()) + ' ' + ampm,
      status: k < 6 ? (k % 2 ? 'Called' : 'Waiting') : (tDate > issued && tDate.getDate() !== issued.getDate() ? 'Waiting' : statuses[k % statuses.length])
    });
  }

  var seq = {};
  tokens.forEach(function (t) {
    var key = t.orgId + '|' + t.tokenDateKey;
    seq[key] = (seq[key] || 0) + 1;
    var n = seq[key];
    t.token = t.tokenDateKey.slice(2).replace(/-/g, '') + '-' + (n < 10 ? '00' + n : n < 100 ? '0' + n : n);
  });
  tokens.reverse();                                           // newest first for the list
  tokens.forEach(function (t, i) { t.id = i + 1; });

  return { visitors: visitors, organizations: organizations, tokens: tokens };
})();

/* =========================================================
   Smart Queue – Visitor SAMPLE DATA (demo only)
   The logged-in visitor and their tokens. Later this comes
   from PHP / MySQL; the live numbers (people ahead, now
   serving, called) will be refreshed from the server.
   ========================================================= */

window.SQ_VISITOR_SEED = function () {

  var now = Date.now();
  var MIN = 60000, DAY = 24 * 60 * MIN;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function key(ms) { var d = new Date(ms); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function no(k, n) { return k.slice(2).replace(/-/g, '') + '-' + (n < 10 ? '00' + n : n < 100 ? '0' + n : n); }

  var profile = {
    name: 'Ananya Sen',
    email: 'ananya.sen@gmail.com',
    phone: '9831022451',
    address: '22 Sarsuna Main Road, Behala, Kolkata 700061',
    gender: 'Female',
    dob: '1998-03-14'
  };

  var tokens = [];
  function t(org, cNo, service, open, daysAhead, n, issuedMinAgo, status, extra) {
    var k = key(now + daysAhead * DAY);
    var tok = {
      token: no(k, n),
      org: org,
      counter: { no: cNo, service: service, open: open },
      tokenDate: k,
      issuedAt: now - issuedMinAgo * MIN,
      status: status,
      ahead: null, estWait: null, nowServing: null, calledAt: null
    };
    for (var p in extra || {}) tok[p] = extra[p];
    tokens.push(tok);
  }

  // ---- Today: 1 called + 7 waiting ----
  t('City Care Clinic – Behala', '02', 'OPD', true, 0, 64, 70, 'Called', { calledAt: now - 2 * MIN });
  t('Lakeview Diagnostics – Garia', '01', 'Blood test', true, 0, 19, 95, 'Waiting', { ahead: 3, estWait: 18, nowServing: '016' });
  t('Sunrise Bank – Behala', '03', 'Cash deposit', true, 0, 44, 60, 'Waiting', { ahead: 5, estWait: 20, nowServing: '039' });
  t('City Care Clinic – Behala', '03', 'Billing', true, 0, 71, 40, 'Waiting', { ahead: 6, estWait: 24, nowServing: '063' });
  t('Metro Passport Seva – Salt Lake', '02', 'Document check', false, 0, 112, 180, 'Waiting', { ahead: 9, estWait: 45, nowServing: '103' });
  t('Green Leaf Hospital – Howrah', '01', 'OPD', true, 0, 58, 120, 'Waiting', { ahead: 11, estWait: 55, nowServing: '047' });
  t('Apex Dental Studio – Jadavpur', '01', 'Consultation', true, 0, 14, 150, 'Waiting', { ahead: 2, estWait: 30, nowServing: '012' });
  t('Unity Eye Care – Tollygunge', '02', 'Eye test', true, 0, 27, 100, 'Waiting', { ahead: 7, estWait: 35, nowServing: '020' });

  // ---- Upcoming ----
  t('Green Leaf Hospital – Howrah', '03', 'Physiotherapy', true, 1, 5, 400, 'Waiting');
  t('City Care Clinic – Behala', '05', 'Lab sample collection', true, 1, 18, 1000, 'Waiting');
  t('Sunrise Bank – Behala', '01', 'Loan desk', false, 3, 2, 2900, 'Waiting');
  t('City Care Clinic – Behala', '02', 'OPD', true, 4, 3, 30, 'Waiting');
  t('Metro Passport Seva – Salt Lake', '02', 'Document check', true, 6, 9, 4300, 'Waiting');
  t('Apex Dental Studio – Jadavpur', '01', 'Consultation', true, 9, 1, 120, 'Waiting');

  // ---- History (past days) ----
  var orgs = [
    ['City Care Clinic – Behala', '01', 'OPD'], ['Metro Passport Seva – Salt Lake', '04', 'Document check'],
    ['Sunrise Bank – Behala', '02', 'Cash deposit'], ['City Care Clinic – Behala', '03', 'Billing'],
    ['Green Leaf Hospital – Howrah', '01', 'OPD'], ['Lakeview Diagnostics – Garia', '02', 'X-ray']
  ];
  var ends = ['Served', 'Served', 'Served', 'No show', 'Served', 'Cancelled'];
  for (var i = 1; i <= 40; i++) {
    var o = orgs[i % orgs.length];
    var ago = i * 2 + (i % 3);                          // days ago
    t(o[0], o[1], o[2], true, -ago, 5 + (i * 7) % 60, 60 * 24 + 90, ends[i % ends.length]);
    tokens[tokens.length - 1].issuedAt = now - ago * DAY - 90 * MIN;
  }

  return { profile: profile, tokens: tokens };
};

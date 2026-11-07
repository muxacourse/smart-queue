/* =========================================================
   Smart Queue – Organization SAMPLE DATA (demo only)
   Used the first time the portal opens. Changes you make
   (calling tokens, adding counters, issuing tokens, profile)
   are kept in this browser so you can test the full flow.
   Later, PHP / MySQL will return the same shape.

   Token number = YYMMDD-NNN
     YYMMDD = the token date (the day the token is for)
     NNN    = running number for that organization and date,
              starting at 001 for every date
   ========================================================= */

window.SQ_ORG_SEED = function () {

  var now = Date.now();
  var MIN = 60000, DAY = 24 * 60 * MIN;

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function dateKey(ms) {
    var d = new Date(ms);
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }

  var profile = {
    name: 'City Care Clinic – Behala',
    contact: 'Dr. Sanjay Bose',
    email: 'office@citycareclinic.in',
    phone: '9830041275',
    address: '14 Diamond Harbour Road, Behala, Kolkata 700034'
  };

  var counters = [
    { no: '01', service: 'OPD', avg: 6, open: true },
    { no: '02', service: 'OPD', avg: 6, open: true },
    { no: '03', service: 'Billing', avg: 4, open: true },
    { no: '04', service: 'Pharmacy', avg: 5, open: false },
    { no: '05', service: 'Lab sample collection', avg: 8, open: true }
  ];

  // Registered visitors (for "Issue token → Find")
  var first = ['Ananya','Rahul','Priya','Soumik','Riya','Arjun','Sneha','Amit','Debjani','Sourav','Pooja','Ankit','Moumita','Ritam','Tania','Sayan','Ishita','Kunal','Payel','Rohan'];
  var last  = ['Sen','Das','Mukherjee','Ghosh','Banerjee','Paul','Roy','Chatterjee','Bose','Saha','Dey','Pal'];
  var visitors = [];
  for (var i = 0; i < 60; i++) {
    var fn = first[i % first.length], ln = last[(i * 7) % last.length];
    visitors.push({
      name: fn + ' ' + ln,
      email: (fn + '.' + ln + (i >= first.length ? i : '')).toLowerCase() + '@gmail.com',
      phone: String(9830010000 + i * 7919).slice(0, 10)
    });
  }

  var tokens = [];
  function add(counterIdx, issuedMinAgo, daysAhead, status, calledAfter, doneAfter, v) {
    var issued = now - issuedMinAgo * MIN;
    tokens.push({
      token: '',
      visitor: visitors[v % visitors.length],
      counter: counters[counterIdx].no,
      tokenDate: dateKey(issued + daysAhead * DAY),
      issuedAt: issued,
      status: status,
      calledAt: calledAfter != null ? issued + calledAfter * MIN : null,
      doneAt: doneAfter != null ? issued + doneAfter * MIN : null
    });
  }

  var open = [0, 1, 2, 4];

  // History: past ~30 days
  for (var d = 2300; d > 0; d--) {
    var r = d % 10;
    add(open[d % 4], 24 * 60 + d * 18, 0, r === 0 ? 'No show' : r === 5 ? 'Cancelled' : 'Served', 5 + (d % 15), 10 + (d % 15), d);
  }

  // Today: finished tokens
  for (var k = 0; k < 67; k++) {
    var s2 = k % 16 === 3 ? 'No show' : k === 20 || k === 41 ? 'Cancelled' : 'Served';
    add(open[k % 4], 420 - k * 5, 0, s2, 6 + (k % 12), 12 + (k % 12), k + 3);
  }

  // Now being served at counters 01, 02, 03
  add(0, 52, 0, 'Called', 45, null, 6);
  add(1, 50, 0, 'Called', 44, null, 7);
  add(2, 30, 0, 'Called', 26, null, 1);

  // Waiting now (today)
  var waitPlan = [0, 1, 2, 0, 1, 4, 0, 2, 1, 4, 0, 1, 2, 0];
  for (var w = 0; w < waitPlan.length; w++) add(waitPlan[w], 28 - w * 2, 0, 'Waiting', null, null, 10 + w);

  // Tokens issued for future dates
  var future = [[1, 120, 1, 0], [4, 95, 1, 4], [0, 60, 2, 8], [1, 25, 4, 0], [2, 18, 4, 12], [0, 6, 6, 15]];
  future.forEach(function (f) { add(f[0], f[1], f[2], 'Waiting', null, null, f[3]); });

  // Give numbers in issue order: 001, 002 … for each token date
  var daySeq = {};
  tokens.sort(function (a, b) { return a.issuedAt - b.issuedAt; });
  tokens.forEach(function (t, idx) {
    daySeq[t.tokenDate] = (daySeq[t.tokenDate] || 0) + 1;
    var n = daySeq[t.tokenDate];
    t.id = idx + 1;
    t.token = t.tokenDate.slice(2).replace(/-/g, '') + '-' + (n < 10 ? '00' + n : n < 100 ? '0' + n : n);
  });

  return { profile: profile, counters: counters, visitors: visitors, tokens: tokens, daySeq: daySeq };
};

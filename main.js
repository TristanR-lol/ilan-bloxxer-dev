// ── Custom cursor ────────────────────────────────────────────
(function () {
  const outer = document.getElementById('cursor-outer');
  const inner = document.getElementById('cursor-inner');
  if (!outer || !inner) return;

  let mx = 0, my = 0, ox = 0, oy = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    inner.style.left = mx + 'px';
    inner.style.top  = my + 'px';
  });

  (function animate() {
    ox += (mx - ox) * 0.12;
    oy += (my - oy) * 0.12;
    outer.style.left = Math.round(ox * 10) / 10 + 'px';
    outer.style.top  = Math.round(oy * 10) / 10 + 'px';
    requestAnimationFrame(animate);
  })();

  function addHover(el) {
    if (!el) return;
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  }
  function addText(el) {
    if (!el) return;
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-text'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-text'));
  }

  document.querySelectorAll('a, button, .btn, .card').forEach(addHover);
  document.querySelectorAll('input, textarea, select').forEach(addText);
})();


// ── Toast ────────────────────────────────────────────────────
function toast(msg, duration) {
  duration = duration || 3200;
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('show'), duration);
}


// ── TfL live status ──────────────────────────────────────────
var REFRESH_MS = 60000; // 60 s

function badgeLabel(name) {
  if (!name) return 'UNKNOWN';
  var s = name.toLowerCase();
  if (s.includes('good') || s.includes('normal')) return 'GOOD SERVICE';
  if (s.includes('strike'))   return 'STRIKE';
  if (s.includes('suspend'))  return 'SUSPENDED';
  if (s.includes('severe'))   return 'SEVERE DELAYS';
  if (s.includes('minor'))    return 'MINOR DELAYS';
  if (s.includes('part'))     return 'PART CLOSURE';
  return name.toUpperCase();
}

function isDisrupted(name) {
  if (!name) return false;
  var s = name.toLowerCase();
  return !(s.includes('good') || s.includes('normal'));
}

function badgeClass(name) {
  if (!name) return 'status-warn';
  var s = name.toLowerCase();
  if (s.includes('good') || s.includes('normal')) return 'status-ok';
  if (s.includes('minor')) return 'status-warn';
  return 'status-err';
}

function fetchStatus() {
  var bar     = document.getElementById('status-bar');
  var spinner = document.getElementById('status-spinner');
  var barText = document.getElementById('status-text');

  if (!bar) return;

  bar.className = 'status-bar loading';
  if (spinner) spinner.style.display = 'inline-block';
  if (barText) barText.textContent   = 'PINGING TFL SYSTEMS...';

  fetch('https://api.tfl.gov.uk/Line/northern,district/Status')
    .then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    })
    .then(function (data) {
      if (spinner) spinner.style.display = 'none';

      var northernOk = true, districtOk = true;

      data.forEach(function (line) {
        var primary    = (line.lineStatuses || [])[0] || {};
        var statusName = primary.statusSeverityDescription || 'Unknown';
        var reason     = primary.reason || '';
        var shortMsg   = reason
          ? reason.replace(/^.*?:/, '').trim().split('.')[0]
          : statusName;
        var disrupted  = isDisrupted(statusName);
        var label      = badgeLabel(statusName);
        var cls        = badgeClass(statusName);

        if (line.id === 'northern') {
          northernOk = !disrupted;
          var el = document.getElementById('northern-msg');
          var bd = document.getElementById('northern-badge');
          var wn = document.getElementById('northern-warn');
          var wt = document.getElementById('northern-warn-text');
          if (el) el.textContent = shortMsg;
          if (bd) { bd.textContent = label; bd.className = 'status ' + cls; }
          if (wn) wn.style.display = disrupted ? 'inline-flex' : 'none';
          if (wt) wt.textContent   = label;
          var tv = document.getElementById('total-time');
          if (tv) tv.innerHTML = disrupted
            ? '<span class="hl-red mono" style="font-size:28px;font-weight:900;">~75</span><div class="metric-label" style="margin-top:4px;">MIN (DISRUPTED)</div>'
            : '<span class="metric-val" style="font-size:28px;">55</span><div class="metric-label" style="margin-top:4px;">MINUTES</div>';
        }

        if (line.id === 'district') {
          districtOk = !disrupted;
          var el2 = document.getElementById('district-msg');
          var bd2 = document.getElementById('district-badge');
          var wn2 = document.getElementById('district-warn');
          var wt2 = document.getElementById('district-warn-text');
          if (el2) el2.textContent = shortMsg;
          if (bd2) { bd2.textContent = label; bd2.className = 'status ' + cls; }
          if (wn2) wn2.style.display = disrupted ? 'inline-flex' : 'none';
          if (wt2) wt2.textContent   = label;
        }
      });

      // Alt route box
      var altBox  = document.getElementById('alt-box');
      var altN    = document.getElementById('alt-northern');
      var altD    = document.getElementById('alt-district');
      var altB    = document.getElementById('alt-both');
      var bothBad = !northernOk && !districtOk;

      if (altB) altB.style.display = bothBad                            ? 'block' : 'none';
      if (altN) altN.style.display = (!northernOk && districtOk)        ? 'block' : 'none';
      if (altD) altD.style.display = (northernOk  && !districtOk)       ? 'block' : 'none';
      if (altBox) altBox.classList.toggle('visible', !northernOk || !districtOk);

      // Route label
      var rl = document.getElementById('route-label');
      if (rl) rl.textContent = (!northernOk || !districtOk)
        ? '// DISRUPTION ACTIVE'
        : '// NORMAL ROUTE';

      // Top status bar
      if (!northernOk || !districtOk) {
        bar.className = 'status-bar warn';
        barText.textContent = 'DISRUPTION — ' + (bothBad ? 'NORTHERN + DISTRICT' : !northernOk ? 'NORTHERN LINE' : 'DISTRICT LINE');
      } else {
        bar.className = 'status-bar ok';
        barText.textContent = 'ALL SYSTEMS NOMINAL — GOOD SERVICE ON BOTH LINES';
      }

      // Timestamp
      var ts = document.getElementById('last-updated');
      if (ts) {
        var now = new Date();
        ts.textContent = 'UPDATED ' + now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
      }
    })
    .catch(function () {
      if (spinner) spinner.style.display = 'none';
      if (bar)     bar.className = 'status-bar loading';
      if (barText) barText.textContent = 'TFL API UNREACHABLE — CHECK tfl.gov.uk MANUALLY';
    });
}

// Boot
document.addEventListener('DOMContentLoaded', function () {
  fetchStatus();
  setInterval(fetchStatus, REFRESH_MS);
});

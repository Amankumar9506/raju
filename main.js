// ── PAGE NAVIGATION ──────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const t = document.getElementById(pageId + '-page');
  if (t) { t.classList.add('active'); window.scrollTo(0, 0); }
}

// ── MOBILE MENU ───────────────────────────────────────────────────
function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  const open  = links.classList.contains('open');
  if (open) {
    links.classList.remove('open');
    links.style.display = '';
  } else {
    links.classList.add('open');
    links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:#fff;padding:16px 5vw;box-shadow:0 8px 24px rgba(0,0,0,0.1);gap:16px;z-index:998;';
  }
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.style.background = type === 'error'
    ? 'linear-gradient(135deg,#dc2626,#991b1b)'
    : 'linear-gradient(135deg,#c9607e,#c9a84c)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3500);
}

// ── LOAD SERVICES INTO BOOKING FORM ──────────────────────────────
async function loadServicesIntoForm() {
  try {
    const { data } = await Services.getAll();
    const select   = document.getElementById('serviceSelect');
    if (!select || !data.length) return;

    const groups = {};
    data.forEach(s => {
      if (!groups[s.category]) groups[s.category] = [];
      groups[s.category].push(s);
    });

    select.innerHTML = '<option value="">-- Choose a Service --</option>';
    Object.entries(groups).forEach(([cat, svcs]) => {
      const og = document.createElement('optgroup');
      og.label = cat + ' Treatments';
      svcs.forEach(s => {
        const opt = document.createElement('option');
        opt.value = s.name;
        opt.textContent = `${s.name}  (${s.price})`;
        og.appendChild(opt);
      });
      select.appendChild(og);
    });
  } catch (e) {
    console.warn('Could not load services from API, using defaults.');
  }
}

// ── BOOKING FORM SUBMIT ───────────────────────────────────────────
async function submitBooking() {
  const btn = document.querySelector('.submit-btn');

  const name    = document.getElementById('clientName').value.trim();
  const phone   = document.getElementById('clientPhone').value.trim();
  const email   = document.getElementById('clientEmail').value.trim();
  const service = document.getElementById('serviceSelect').value;
  const date    = document.getElementById('apptDate').value;
  const time    = document.getElementById('apptTime').value;
  const notes   = document.getElementById('apptNotes').value.trim();

  if (!name || !phone || !service || !date || !time) {
    showToast('⚠️ Naam, phone, service, date aur time required hai!', 'error');
    return;
  }

  btn.textContent = 'Booking...';
  btn.disabled    = true;

  try {
    await Appointments.book({ name, phone, email, service, date, time, notes });

    document.getElementById('bookingSuccess').style.display = 'block';
    showToast('✅ Appointment booked! Confirmation email & WhatsApp pe aayega.');

    // Reset form
    ['clientName','clientPhone','clientEmail','apptDate','apptNotes'].forEach(id => {
      document.getElementById(id).value = '';
    });
    document.getElementById('serviceSelect').value = '';
    document.getElementById('apptTime').value      = '';
  } catch (err) {
    showToast('❌ ' + err.message, 'error');
  } finally {
    btn.textContent = 'Confirm Appointment ✨';
    btn.disabled    = false;
  }
}

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Set min booking date
  const dateInput = document.getElementById('apptDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];

  // Load services from API
  loadServicesIntoForm();

  // Close mobile menu on nav link click
  document.querySelectorAll('.nav-links a').forEach(a =>
    a.addEventListener('click', () => {
      document.getElementById('navLinks').style.display = '';
      document.getElementById('navLinks').classList.remove('open');
    })
  );
});

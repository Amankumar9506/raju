// ── PAGE NAVIGATION ──────────────────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById(pageId + '-page');
  if (target) { target.classList.add('active'); window.scrollTo(0, 0); }
}

// ── MOBILE MENU ───────────────────────────────────────────────────
function toggleMobileMenu() {
  const links = document.getElementById('navLinks');
  const isOpen = links.classList.contains('open');
  if (isOpen) {
    links.classList.remove('open');
    links.style.display = 'none';
  } else {
    links.classList.add('open');
    links.style.cssText = 'display:flex;flex-direction:column;position:absolute;top:64px;left:0;right:0;background:#fff;padding:16px 5vw;box-shadow:0 8px 24px rgba(0,0,0,0.1);gap:16px;';
  }
}
// Close menu on nav link click
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => {
      const links = document.getElementById('navLinks');
      links.classList.remove('open');
      links.style.display = '';
    });
  });

  // Set min booking date to today
  const dateInput = document.getElementById('apptDate');
  if (dateInput) dateInput.min = new Date().toISOString().split('T')[0];
});

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── BOOKING FORM ──────────────────────────────────────────────────
function submitBooking() {
  const name    = document.getElementById('clientName').value.trim();
  const phone   = document.getElementById('clientPhone').value.trim();
  const service = document.getElementById('serviceSelect').value;
  const date    = document.getElementById('apptDate').value;
  const time    = document.getElementById('apptTime').value;

  if (!name || !phone || !service || !date || !time) {
    showToast('⚠️ Please fill all required fields!');
    return;
  }
  document.getElementById('bookingSuccess').style.display = 'block';
  showToast('✅ Appointment booked successfully!');

  // Save to localStorage so admin can see it
  const bookings = JSON.parse(localStorage.getItem('rg_bookings') || '[]');
  bookings.push({
    name, phone,
    email: document.getElementById('clientEmail').value,
    service, date, time,
    notes: document.getElementById('apptNotes').value,
    status: 'Pending',
    createdAt: new Date().toLocaleDateString()
  });
  localStorage.setItem('rg_bookings', JSON.stringify(bookings));
}

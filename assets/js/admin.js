// ── CREDENTIALS (change these before deployment) ──────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'radiant2025';

// ── LOGIN ─────────────────────────────────────────────────────────
function adminLogin() {
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPass').value;
  const err  = document.getElementById('loginError');

  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    sessionStorage.setItem('rg_admin', 'true');
    document.getElementById('loginPage').style.display  = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    loadDashboard();
  } else {
    err.style.display = 'block';
    err.textContent = '❌ Invalid username or password.';
  }
}

// Allow Enter key on login form
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminLogin();
  });

  // If already logged in this session
  if (sessionStorage.getItem('rg_admin') === 'true') {
    document.getElementById('loginPage').style.display  = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    loadDashboard();
  }
});

// ── LOGOUT ────────────────────────────────────────────────────────
function adminLogout() {
  sessionStorage.removeItem('rg_admin');
  document.getElementById('dashboard').style.display  = 'none';
  document.getElementById('loginPage').style.display  = 'flex';
  showToast('👋 Logged out successfully');
}

// ── TABS ──────────────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + tabName).classList.add('active');
  document.querySelectorAll('.admin-tab').forEach(b => {
    if (b.dataset.tab === tabName) b.classList.add('active');
  });
  if (tabName === 'appointments') loadAppointments();
  if (tabName === 'leads') loadLeads();
}

// ── LOAD DASHBOARD ────────────────────────────────────────────────
function loadDashboard() {
  const bookings = JSON.parse(localStorage.getItem('rg_bookings') || '[]');
  const today    = new Date().toLocaleDateString();

  document.getElementById('stat-today').textContent    = bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length || sampleAppointments.filter(a => a.date === 'Today').length;
  document.getElementById('stat-pending').textContent  = bookings.filter(b => b.status === 'Pending').length + sampleAppointments.filter(a => a.status === 'Pending').length;
  document.getElementById('stat-monthly').textContent  = bookings.length + sampleAppointments.length;
  loadTodayTable();
  loadAppointments();
  loadLeads();
}

// ── SAMPLE DATA ───────────────────────────────────────────────────
const sampleAppointments = [
  { date:'Today', time:'10:00 AM', name:'Priya Sharma',  phone:'9876543210', service:'Hydrafacial',       status:'Confirmed' },
  { date:'Today', time:'11:00 AM', name:'Rohit Verma',   phone:'9812345678', service:'GFC Hair Treatment', status:'Pending'   },
  { date:'Today', time:'12:00 PM', name:'Neha Kapoor',   phone:'9765432109', service:'Lip Fillers',        status:'Confirmed' },
  { date:'Today', time:'03:00 PM', name:'Ananya Tiwari', phone:'9654321098', service:'Chemical Peel',      status:'Pending'   },
  { date:'4 Mar', time:'02:00 PM', name:'Meera Gupta',   phone:'9988776655', service:'Botox',              status:'Pending'   },
  { date:'5 Mar', time:'11:30 AM', name:'Divya Singh',   phone:'9543210987', service:'Laser Hair Removal', status:'Confirmed' },
  { date:'6 Mar', time:'04:00 PM', name:'Kavya Mishra',  phone:'9432109876', service:'PRP Hair Therapy',   status:'Pending'   },
];

const sampleLeads = [
  { date:'3 Mar', name:'Priya Sharma',  phone:'9876543210', email:'priya@gmail.com',  service:'Hydrafacial',      notes:'Wants glow before wedding' },
  { date:'2 Mar', name:'Rohit Verma',   phone:'9812345678', email:'rohit@gmail.com',  service:'GFC Hair',         notes:'Hair fall since 2 years'   },
  { date:'1 Mar', name:'Ananya Tiwari', phone:'9765432109', email:'ananya@gmail.com', service:'Botox',            notes:'First time, nervous'       },
  { date:'28 Feb',name:'Sunita Rai',    phone:'9654321098', email:'—',                service:'Laser Removal',    notes:'Referred by Priya'         },
];

// ── TODAY TABLE ───────────────────────────────────────────────────
function loadTodayTable() {
  const tbody = document.getElementById('todayTableBody');
  tbody.innerHTML = '';
  sampleAppointments.filter(a => a.date === 'Today').forEach((a, i) => {
    tbody.insertAdjacentHTML('beforeend', appointmentRow(a, i, true));
  });
}

function appointmentRow(a, i, short = false) {
  const dateCol = short ? '' : `<td>${a.date}</td>`;
  const phoneCol = short ? '' : `<td>${a.phone}</td>`;
  const badge = badgeHTML(a.status);
  const actions = actionsHTML(a.status);
  return `<tr id="row-${short?'t':'a'}${i}">
    ${dateCol}<td>${a.time}</td><td>${a.name}</td>${phoneCol}<td>${a.service}</td>
    <td>${badge}</td><td><div class="action-btns">${actions}</div></td>
  </tr>`;
}

function badgeHTML(status) {
  const map = { Pending:'badge-pending', Confirmed:'badge-confirmed', Done:'badge-done', Rescheduling:'badge-reschedule' };
  return `<span class="badge ${map[status]||'badge-pending'}">${status}</span>`;
}

function actionsHTML(status) {
  if (status === 'Done') return '—';
  if (status === 'Confirmed') return `<button class="abtn abtn-done" onclick="changeStatus(this,'Done')">✓ Done</button>`;
  return `<button class="abtn abtn-confirm" onclick="changeStatus(this,'Confirmed')">Confirm</button>
          <button class="abtn abtn-reschedule" onclick="changeStatus(this,'Rescheduling')">Reschedule</button>`;
}

function changeStatus(btn, newStatus) {
  const row = btn.closest('tr');
  row.querySelector('.badge').outerHTML = badgeHTML(newStatus);
  row.querySelector('.action-btns').innerHTML = actionsHTML(newStatus);
  showToast(newStatus === 'Confirmed' ? '✅ Confirmed!' : newStatus === 'Done' ? '✨ Marked as Done!' : '🔄 Marked for Rescheduling');
}

// ── ALL APPOINTMENTS ──────────────────────────────────────────────
function loadAppointments() {
  const tbody = document.getElementById('apptTableBody');
  tbody.innerHTML = '';
  const fromStorage = JSON.parse(localStorage.getItem('rg_bookings') || '[]');
  [...sampleAppointments, ...fromStorage].forEach((a, i) => {
    tbody.insertAdjacentHTML('beforeend', appointmentRow(a, i, false));
  });
}

// ── LEADS ─────────────────────────────────────────────────────────
function loadLeads() {
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = '';
  const fromStorage = JSON.parse(localStorage.getItem('rg_bookings') || '[]');
  const all = [
    ...sampleLeads,
    ...fromStorage.map(b => ({ date: b.createdAt, name: b.name, phone: b.phone, email: b.email || '—', service: b.service, notes: b.notes || '—' }))
  ];
  all.forEach(l => {
    tbody.insertAdjacentHTML('beforeend', `<tr>
      <td>${l.date}</td><td>${l.name}</td><td>${l.phone}</td>
      <td>${l.email}</td><td>${l.service}</td><td>${l.notes}</td>
    </tr>`);
  });
}

// ── CSV EXPORT ────────────────────────────────────────────────────
function exportAppointments() {
  const rows = [['Date','Time','Name','Phone','Service','Status']];
  document.querySelectorAll('#apptTableBody tr').forEach(tr => {
    rows.push([...tr.querySelectorAll('td')].slice(0,6).map(td => td.innerText.trim()));
  });
  downloadCSV(rows, 'appointments.csv');
}

function exportLeads() {
  const rows = [['Date','Name','Phone','Email','Service','Notes']];
  document.querySelectorAll('#leadsTableBody tr').forEach(tr => {
    rows.push([...tr.querySelectorAll('td')].map(td => td.innerText.trim()));
  });
  downloadCSV(rows, 'leads.csv');
}

function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type:'text/csv' }));
  a.download = filename; a.click();
  showToast('📥 ' + filename + ' downloaded!');
}

// ── SERVICES ──────────────────────────────────────────────────────
function saveService(btn) {
  showToast('💾 Service updated!');
  const orig = btn.textContent;
  btn.textContent = 'Saved ✓'; btn.style.background = '#d1fae5'; btn.style.color = '#065f46';
  setTimeout(() => { btn.textContent = orig; btn.style.background = ''; btn.style.color = ''; }, 2000);
}

function addService() {
  const grid = document.getElementById('serviceGrid');
  const addCard = document.getElementById('addServiceCard');
  const card = document.createElement('div');
  card.className = 'service-manage-card';
  card.innerHTML = `<h4>✨ New Service</h4>
    <input type="text" placeholder="Service name" value="New Treatment">
    <input type="text" placeholder="Description">
    <input type="text" placeholder="Price (e.g. ₹2,000 onwards)">
    <button class="save-btn" onclick="saveService(this)" style="margin-top:4px">Save ✓</button>`;
  grid.insertBefore(card, addCard);
  showToast('➕ New service added!');
}

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

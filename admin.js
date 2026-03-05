// ── LOGIN ─────────────────────────────────────────────────────────
async function adminLogin() {
  const username = document.getElementById('adminUser').value.trim();
  const password = document.getElementById('adminPass').value;
  const errEl    = document.getElementById('loginError');
  const btn      = document.querySelector('.login-btn');

  if (!username || !password) {
    errEl.style.display = 'block';
    errEl.textContent   = '⚠️ Username aur password dono required hai.';
    return;
  }

  btn.textContent = 'Logging in...';
  btn.disabled    = true;

  try {
    await Auth.login(username, password);
    document.getElementById('loginPage').style.display  = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    errEl.style.display = 'none';
    loadDashboard();
    showToast('✅ Welcome back!');
  } catch (err) {
    errEl.style.display = 'block';
    errEl.textContent   = '❌ ' + err.message;
  } finally {
    btn.textContent = 'Login to Dashboard →';
    btn.disabled    = false;
  }
}

function adminLogout() {
  Auth.logout();
  document.getElementById('dashboard').style.display  = 'none';
  document.getElementById('loginPage').style.display  = 'flex';
  showToast('👋 Logged out.');
}

// ── TABS ──────────────────────────────────────────────────────────
function switchTab(tabName) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('section-' + tabName).classList.add('active');
  document.querySelectorAll(`.admin-tab[data-tab="${tabName}"]`).forEach(b => b.classList.add('active'));

  if (tabName === 'appointments') loadAppointments();
  if (tabName === 'services')     loadServices();
  if (tabName === 'leads')        loadLeads();
}

// ── DASHBOARD LOAD ────────────────────────────────────────────────
async function loadDashboard() {
  try {
    const { data } = await Appointments.getStats();
    document.getElementById('stat-today').textContent   = data.todayCount;
    document.getElementById('stat-pending').textContent = data.pendingCount;
    document.getElementById('stat-monthly').textContent = data.monthCount;
  } catch (e) { console.warn('Stats error:', e.message); }

  loadTodayTable();
}

// ── TODAY TABLE ───────────────────────────────────────────────────
async function loadTodayTable() {
  const tbody = document.getElementById('todayTableBody');
  tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:20px">Loading...</td></tr>';

  try {
    const { data } = await Appointments.getToday();
    tbody.innerHTML = '';

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#9ca3af;padding:20px">Aaj koi appointment nahi hai.</td></tr>';
      return;
    }
    data.forEach(a => tbody.insertAdjacentHTML('beforeend', appointmentRowHTML(a, true)));
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:#dc2626;padding:20px">Error: ${e.message}</td></tr>`;
  }
}

// ── ALL APPOINTMENTS ──────────────────────────────────────────────
async function loadAppointments(params = {}) {
  const tbody = document.getElementById('apptTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:20px">Loading...</td></tr>';

  try {
    const { data, total } = await Appointments.getAll(params);
    tbody.innerHTML = '';
    document.getElementById('apptCount').textContent = `Total: ${total}`;

    if (!data.length) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:20px">Koi appointment nahi mili.</td></tr>';
      return;
    }
    data.forEach(a => tbody.insertAdjacentHTML('beforeend', appointmentRowHTML(a, false)));
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#dc2626;padding:20px">Error: ${e.message}</td></tr>`;
  }
}

function appointmentRowHTML(a, short) {
  const dateCol  = short ? '' : `<td>${a.date}</td>`;
  const phoneCol = short ? '' : `<td>${a.phone}</td>`;
  return `<tr id="appt-${a._id}">
    ${dateCol}<td>${a.time}</td><td>${a.name}</td>${phoneCol}
    <td>${a.service}</td>
    <td>${badgeHTML(a.status)}</td>
    <td><div class="action-btns">${actionsHTML(a._id, a.status)}</div></td>
  </tr>`;
}

function badgeHTML(status) {
  const map = { Pending:'badge-pending', Confirmed:'badge-confirmed', Done:'badge-done', Rescheduled:'badge-reschedule', Cancelled:'badge-reschedule' };
  return `<span class="badge ${map[status]||'badge-pending'}">${status}</span>`;
}

function actionsHTML(id, status) {
  if (status === 'Done' || status === 'Cancelled') return '—';
  let btns = '';
  if (status !== 'Confirmed') btns += `<button class="abtn abtn-confirm" onclick="changeStatus('${id}','Confirmed')">Confirm</button>`;
  if (status === 'Confirmed') btns += `<button class="abtn abtn-done" onclick="changeStatus('${id}','Done')">✓ Done</button>`;
  btns += `<button class="abtn abtn-reschedule" onclick="changeStatus('${id}','Rescheduled')">Reschedule</button>`;
  btns += `<button class="abtn abtn-delete" onclick="deleteAppt('${id}')">🗑</button>`;
  return btns;
}

async function changeStatus(id, status) {
  try {
    await Appointments.updateStatus(id, { status });
    const row = document.getElementById(`appt-${id}`);
    if (row) {
      row.querySelector('.badge').outerHTML         = badgeHTML(status);
      row.querySelector('.action-btns').innerHTML   = actionsHTML(id, status);
    }
    showToast(status === 'Confirmed' ? '✅ Confirmed!' : status === 'Done' ? '✨ Done!' : '🔄 Rescheduled');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

async function deleteAppt(id) {
  if (!confirm('Is appointment ko delete karna chahte hain?')) return;
  try {
    await Appointments.delete(id);
    document.getElementById(`appt-${id}`)?.remove();
    showToast('🗑️ Appointment deleted.');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

// ── SEARCH APPOINTMENTS ───────────────────────────────────────────
function searchAppointments() {
  const search = document.getElementById('apptSearch').value;
  const status = document.getElementById('apptStatusFilter').value;
  loadAppointments({ search, status });
}

// ── EXPORT APPOINTMENTS CSV ───────────────────────────────────────
async function exportAppointments() {
  try {
    const { data } = await Appointments.getAll({ limit: 1000 });
    const rows = [['Date','Time','Name','Phone','Email','Service','Status','Notes']];
    data.forEach(a => rows.push([a.date, a.time, a.name, a.phone, a.email||'', a.service, a.status, a.notes||'']));
    downloadCSV(rows, 'appointments.csv');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

// ── SERVICES ──────────────────────────────────────────────────────
async function loadServices() {
  const grid = document.getElementById('serviceGrid');
  grid.innerHTML = '<p style="color:#9ca3af;padding:20px">Loading...</p>';

  try {
    const { data } = await Services.getAll();
    grid.innerHTML = '';
    data.forEach(s => grid.insertAdjacentHTML('beforeend', serviceCardHTML(s)));
    grid.insertAdjacentHTML('beforeend', `<div class="add-service-card" id="addServiceCard" onclick="showAddServiceForm()"><span>➕</span> Add New Service</div>`);
  } catch (e) {
    grid.innerHTML = `<p style="color:#dc2626;padding:20px">Error: ${e.message}</p>`;
  }
}

function serviceCardHTML(s) {
  return `<div class="service-manage-card" id="svc-${s._id}">
    <h4>${s.icon} ${s.name}</h4>
    <input type="text" value="${s.description}" placeholder="Description" id="sdesc-${s._id}">
    <input type="text" value="${s.price}" placeholder="Price" id="sprice-${s._id}">
    <div style="display:flex;gap:8px;margin-top:4px">
      <button class="save-btn" onclick="updateService('${s._id}')">Save ✓</button>
      <button class="save-btn" style="background:#fee2e2;color:#dc2626" onclick="deleteService('${s._id}')">Delete</button>
    </div>
  </div>`;
}

async function updateService(id) {
  try {
    await Services.update(id, {
      description: document.getElementById(`sdesc-${id}`).value,
      price:       document.getElementById(`sprice-${id}`).value
    });
    showToast('💾 Service updated!');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

async function deleteService(id) {
  if (!confirm('Is service ko delete karna chahte hain?')) return;
  try {
    await Services.delete(id);
    document.getElementById(`svc-${id}`)?.remove();
    showToast('🗑️ Service deleted.');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

function showAddServiceForm() {
  const addCard = document.getElementById('addServiceCard');
  const form = document.createElement('div');
  form.className = 'service-manage-card';
  form.innerHTML = `
    <h4>✨ New Service</h4>
    <input type="text" id="new-name"  placeholder="Service name *">
    <input type="text" id="new-desc"  placeholder="Description">
    <input type="text" id="new-price" placeholder="Price (e.g. ₹2,000 onwards)">
    <select id="new-cat" style="width:100%;padding:8px 12px;border:1px solid #eee;border-radius:8px;font-family:inherit;margin-bottom:8px">
      <option value="Skin">Skin</option><option value="Hair">Hair</option>
      <option value="Body">Body</option><option value="Advanced">Advanced</option>
    </select>
    <button class="save-btn" onclick="saveNewService(this)">Save Service</button>`;
  addCard.parentNode.insertBefore(form, addCard);
  addCard.style.display = 'none';
}

async function saveNewService(btn) {
  const name = document.getElementById('new-name').value.trim();
  if (!name) { showToast('⚠️ Service name required!', 'error'); return; }
  try {
    await Services.create({
      name,
      description: document.getElementById('new-desc').value,
      price:       document.getElementById('new-price').value,
      category:    document.getElementById('new-cat').value
    });
    showToast('✅ Service added!');
    loadServices();
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

// ── LEADS ─────────────────────────────────────────────────────────
async function loadLeads() {
  const tbody = document.getElementById('leadsTableBody');
  tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#9ca3af;padding:20px">Loading...</td></tr>';

  try {
    const { data, total } = await Leads.getAll({ limit: 100 });
    tbody.innerHTML = '';
    document.getElementById('leadCount').textContent = `Total: ${total}`;

    data.forEach(l => {
      tbody.insertAdjacentHTML('beforeend', `<tr id="lead-${l._id}">
        <td>${new Date(l.createdAt).toLocaleDateString('en-IN')}</td>
        <td>${l.name}</td><td>${l.phone}</td><td>${l.email||'—'}</td>
        <td>${l.service||'—'}</td><td>${l.message||'—'}</td>
        <td><span class="badge ${leadBadge(l.status)}">${l.status}</span></td>
      </tr>`);
    });
  } catch (e) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:#dc2626;padding:20px">Error: ${e.message}</td></tr>`;
  }
}

function leadBadge(s) {
  return { New:'badge-pending', Contacted:'badge-confirmed', Converted:'badge-done', Lost:'badge-reschedule' }[s] || 'badge-pending';
}

async function exportLeads() {
  try {
    const { data } = await Leads.getAll({ limit: 1000 });
    const rows = [['Date','Name','Phone','Email','Service','Message','Status']];
    data.forEach(l => rows.push([
      new Date(l.createdAt).toLocaleDateString('en-IN'),
      l.name, l.phone, l.email||'', l.service||'', l.message||'', l.status
    ]));
    downloadCSV(rows, 'leads.csv');
  } catch (e) { showToast('❌ ' + e.message, 'error'); }
}

// ── CSV HELPER ────────────────────────────────────────────────────
function downloadCSV(rows, filename) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename; a.click();
  showToast('📥 ' + filename + ' downloaded!');
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

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('adminPass').addEventListener('keydown', e => {
    if (e.key === 'Enter') adminLogin();
  });
  if (Auth.isLoggedIn()) {
    document.getElementById('loginPage').style.display  = 'none';
    document.getElementById('dashboard').style.display  = 'block';
    loadDashboard();
  }
});

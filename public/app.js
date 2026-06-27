// TrackBack app — vanilla JS, fully functional prototype

// Auth gate
if (sessionStorage.getItem('tb_auth') !== '1') {
  window.location.href = '/';
}

setTimeout(() => {

// User
const user = JSON.parse(localStorage.getItem('tb_user') || '{"name":"Jane Doe","email":"jane@campus.edu","initials":"JD"}');
document.getElementById('userName').textContent = user.name;
document.getElementById('userAvatar').textContent = user.initials;

// Logout
document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('tb_auth');
  window.location.href = '/';
});

// Seed items
const SEED = [
  { id:1, name:'Black Backpack', category:'Accessories', status:'Lost', location:'Library', icon:'🎒', date:'May 2, 2026', reporter:'j.smith', description:'Black Jansport backpack with a small red keychain. Contains a notebook and a calculator inside.' },
  { id:2, name:'iPhone 14', category:'Electronics', status:'Found', location:'Gym', icon:'📱', date:'May 3, 2026', reporter:'m.lee', description:'Black iPhone 14 with a clear case. Found on a bench near the locker rooms. Locked screen.' },
  { id:3, name:'Calculus Textbook', category:'Books', status:'Returned', location:'Room 204', icon:'📚', date:'Apr 28, 2026', reporter:'a.kim', description:'Stewart Calculus 8th edition, name "Alex" written on inside cover. Returned to owner.' },
  { id:4, name:'Blue Water Bottle', category:'Accessories', status:'Found', location:'Cafeteria', icon:'🍶', date:'May 1, 2026', reporter:'r.gomez', description:'Hydro Flask, royal blue, 32oz, with a few stickers on the side.' },
  { id:5, name:'Student ID', category:'ID/Cards', status:'Lost', location:'Parking Lot', icon:'🪪', date:'Apr 30, 2026', reporter:'j.doe', description:'Campus student ID card. Last seen near parking lot B around 5pm.' },
  { id:6, name:'Hoodie', category:'Clothing', status:'Found', location:'Auditorium', icon:'🧥', date:'Apr 29, 2026', reporter:'staff', description:'Gray university hoodie, size M, found on a seat in the main auditorium after the assembly.' },
  { id:7, name:'AirPods Case', category:'Electronics', status:'Lost', location:'Lab 3', icon:'🎧', date:'Apr 27, 2026', reporter:'t.nguyen', description:'White AirPods Pro case (no earbuds inside). Small scratch on the back.' },
  { id:8, name:'Notebook', category:'Books', status:'Found', location:'Library', icon:'📓', date:'Apr 26, 2026', reporter:'librarian', description:'Spiral notebook, blue cover, lots of chemistry notes inside.' },
];
let ITEMS = JSON.parse(localStorage.getItem('tb_items') || 'null') || SEED;
let CLAIMS = JSON.parse(localStorage.getItem('tb_claims') || '[]');
let NOTIFS = JSON.parse(localStorage.getItem('tb_notifs') || 'null') || [
  { text:'Your claim for "Calculus Textbook" was approved.', time:'2h ago' },
  { text:'New found item near the Gym: iPhone 14.', time:'5h ago' },
  { text:'Welcome to TrackBack! 🎉', time:'1d ago' },
];
const save = () => {
  localStorage.setItem('tb_items', JSON.stringify(ITEMS));
  localStorage.setItem('tb_claims', JSON.stringify(CLAIMS));
  localStorage.setItem('tb_notifs', JSON.stringify(NOTIFS));
};

// Toast
function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast ok';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '.3s'; }, 2400);
  setTimeout(() => t.remove(), 2800);
}

// Navigation
function navigate(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
  if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
  window.scrollTo(0, 0);
}
document.querySelectorAll('[data-page]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); }));
document.querySelectorAll('[data-nav]').forEach(el => el.addEventListener('click', () => navigate(el.dataset.nav)));
document.getElementById('menuBtn').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

// Notifications popover
const notifBtn = document.getElementById('notifBtn');
const notifPop = document.getElementById('notifPop');
function renderNotifs() {
  const list = document.getElementById('notifList');
  if (!NOTIFS.length) { list.innerHTML = '<li><em style="color:var(--muted)">No notifications</em></li>'; return; }
  list.innerHTML = NOTIFS.map(n => `<li>🔔 <div>${n.text}<small>${n.time}</small></div></li>`).join('');
  document.getElementById('notifDot').style.display = NOTIFS.length ? 'block' : 'none';
}
notifBtn.addEventListener('click', e => { e.stopPropagation(); notifPop.classList.toggle('open'); });
document.addEventListener('click', e => { if (!notifPop.contains(e.target) && e.target !== notifBtn) notifPop.classList.remove('open'); });

// Stats
function renderStats() {
  document.getElementById('sLost').textContent = ITEMS.filter(i => i.status === 'Lost').length;
  document.getElementById('sFound').textContent = ITEMS.filter(i => i.status === 'Found').length;
  document.getElementById('sReturned').textContent = ITEMS.filter(i => i.status === 'Returned').length;
  document.getElementById('sPending').textContent = CLAIMS.filter(c => c.status === 'Pending').length;
}

function badgeClass(status) {
  if (status === 'Lost') return 'badge badge-lost';
  if (status === 'Found') return 'badge badge-found';
  if (status === 'Pending') return 'badge badge-warn';
  if (status === 'Approved') return 'badge badge-ok';
  if (status === 'Rejected') return 'badge badge-lost';
  return 'badge badge-muted';
}

function renderItems(list) {
  const grid = document.getElementById('itemsGrid');
  if (!list.length) { grid.innerHTML = '<p class="muted">No items match your filters.</p>'; return; }
  grid.innerHTML = list.map(it => `
    <button class="item" data-id="${it.id}">
      <div class="item-img">${it.icon}</div>
      <div class="item-body">
        <div class="item-title">${it.name}</div>
        <div class="item-meta">${it.category} • ${it.location}</div>
        <span class="${badgeClass(it.status)}">${it.status}</span>
      </div>
    </button>
  `).join('');
}

function renderRecent() {
  const recent = document.getElementById('recentList');
  recent.innerHTML = ITEMS.slice(-5).reverse().map(it =>
    `<li data-id="${it.id}" style="cursor:pointer"><span>${it.icon} ${it.name}</span><span class="${badgeClass(it.status)}">${it.status}</span></li>`
  ).join('');
}

function renderClaims() {
  const body = document.getElementById('claimsBody');
  if (!CLAIMS.length) {
    body.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px">No claims yet. <a class="link" data-nav="browse" style="color:var(--primary-2);cursor:pointer">Browse items</a> to claim something.</td></tr>';
    body.querySelector('[data-nav]')?.addEventListener('click', () => navigate('browse'));
    return;
  }
  body.innerHTML = CLAIMS.map((c, i) => `
    <tr>
      <td>${c.icon || '📦'} ${c.name}</td>
      <td>${c.date}</td>
      <td><span class="${badgeClass(c.status)}">${c.status}</span></td>
      <td><button class="btn btn-ghost btn-sm" data-claim-cancel="${i}">Cancel</button></td>
    </tr>
  `).join('');
  body.querySelectorAll('[data-claim-cancel]').forEach(b => b.addEventListener('click', () => {
    CLAIMS.splice(Number(b.dataset.claimCancel), 1);
    save(); renderClaims(); renderStats();
    toast('Claim cancelled.');
  }));
}

// Item modal
const modal = document.getElementById('itemModal');
let activeItem = null;
function openItem(id) {
  const it = ITEMS.find(i => i.id === Number(id));
  if (!it) return;
  activeItem = it;
  document.getElementById('mIcon').textContent = it.icon;
  document.getElementById('mName').textContent = it.name;
  document.getElementById('mBadge').innerHTML = `<span class="${badgeClass(it.status)}">${it.status}</span>`;
  document.getElementById('mCategory').textContent = it.category;
  document.getElementById('mLocation').textContent = it.location;
  document.getElementById('mDate').textContent = it.date;
  document.getElementById('mReporter').textContent = it.reporter;
  document.getElementById('mDesc').textContent = it.description;
  modal.classList.add('open');
}
function closeModal() { modal.classList.remove('open'); }
modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

document.getElementById('mClaim').addEventListener('click', () => {
  if (!activeItem) return;
  if (CLAIMS.some(c => c.id === activeItem.id)) { toast('You already claimed this item.'); return; }
  CLAIMS.unshift({
    id: activeItem.id,
    name: activeItem.name,
    icon: activeItem.icon,
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    status: 'Pending'
  });
  NOTIFS.unshift({ text: `Claim submitted for "${activeItem.name}".`, time: 'just now' });
  save(); renderStats(); renderClaims(); renderNotifs();
  toast('✅ Claim submitted!');
  closeModal(); navigate('claims');
});

document.getElementById('mMessage').addEventListener('click', () => {
  closeModal(); navigate('messages');
  toast(`Started a chat about "${activeItem.name}"`);
});

// Click delegation for items grid + recent list
document.getElementById('itemsGrid').addEventListener('click', e => {
  const btn = e.target.closest('.item');
  if (btn) openItem(btn.dataset.id);
});
document.getElementById('recentList').addEventListener('click', e => {
  const li = e.target.closest('li[data-id]');
  if (li) openItem(li.dataset.id);
});

// Filters
function applyFilters() {
  const q1 = document.getElementById('searchInput').value.toLowerCase().trim();
  const q2 = document.getElementById('searchInput2').value.toLowerCase().trim();
  const q = q2 || q1;
  const c = document.getElementById('categoryFilter').value;
  const s = document.getElementById('statusFilter').value;
  renderItems(ITEMS.filter(it =>
    (!q || it.name.toLowerCase().includes(q) || it.location.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)) &&
    (!c || it.category === c) &&
    (!s || it.status === s)
  ));
}
['searchInput', 'searchInput2', 'categoryFilter', 'statusFilter'].forEach(id =>
  document.getElementById(id).addEventListener('input', () => {
    if (id === 'searchInput') navigate('browse');
    applyFilters();
  })
);

// Report form
document.getElementById('reportForm').addEventListener('submit', async e => {
  e.preventDefault();
  const dateVal = document.getElementById('rDate').value;
  const dateFmt = dateVal
    ? new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const photoFile = document.getElementById('rPhoto').files[0];
  let photo = null;
  if (photoFile) {
    photo = await new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(photoFile); });
  }
  const newItem = {
    id: Date.now(),
    name: document.getElementById('rName').value.trim(),
    category: document.getElementById('rCategory').value,
    status: document.getElementById('rType').value,
    location: document.getElementById('rLocation').value.trim(),
    description: document.getElementById('rDesc').value.trim() || 'No description provided.',
    icon: document.getElementById('rIcon').value || '📦',
    photo,
    date: dateFmt,
    reporter: user.email.split('@')[0],
  };
  ITEMS.push(newItem);
  NOTIFS.unshift({ text: `You reported "${newItem.name}" as ${newItem.status}.`, time: 'just now' });
  save(); renderStats(); renderItems(ITEMS); renderRecent(); renderNotifs(); renderAdmin();
  e.target.reset();
  toast('✅ Report submitted!');
  navigate('dashboard');
});

// Chat
const chatList = document.getElementById('chatList');
const REPLIES = [
  'Great, sounds like it! When can we meet?',
  'Awesome, I can be at the front desk in 10 mins.',
  'Perfect — I\'ll bring it tomorrow morning.',
  'Got it. Where would you like to pick it up?',
  'Thanks for confirming! 🙌',
];
document.getElementById('chatForm').addEventListener('submit', e => {
  e.preventDefault();
  const input = document.getElementById('chatText');
  const text = input.value.trim();
  if (!text) return;
  const out = document.createElement('div');
  out.className = 'msg out'; out.textContent = text;
  chatList.appendChild(out);
  chatList.scrollTop = chatList.scrollHeight;
  input.value = '';
  setTimeout(() => {
    const inMsg = document.createElement('div');
    inMsg.className = 'msg in';
    inMsg.textContent = REPLIES[Math.floor(Math.random() * REPLIES.length)];
    chatList.appendChild(inMsg);
    chatList.scrollTop = chatList.scrollHeight;
  }, 900);
});

// Admin — render + actions
let adminStatuses = {};

function renderAdmin() {
  const body = document.getElementById('adminBody');
  if (!ITEMS.length) {
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">No items reported yet.</td></tr>';
    return;
  }
  body.innerHTML = ITEMS.map(it => {
    const status = adminStatuses[it.id] || it.status;
    const isDone = status === 'Approved' || status === 'Rejected';
    const statusBadge = status === 'Approved'
      ? '<span class="badge badge-ok">Approved</span>'
      : status === 'Rejected'
        ? '<span class="badge badge-lost">Rejected</span>'
        : status === 'Found'
          ? '<span class="badge badge-found">Found</span>'
          : status === 'Lost'
            ? '<span class="badge badge-lost">Lost</span>'
            : status === 'Returned'
              ? '<span class="badge badge-muted">Returned</span>'
              : `<span class="badge badge-warn">${status}</span>`;
    const actions = isDone
      ? '<em style="color:var(--muted);font-size:12px">Done</em>'
      : `<button class="btn btn-primary btn-sm" data-act="approve" data-id="${it.id}">Approve</button>
         <button class="btn btn-danger btn-sm" data-act="reject" data-id="${it.id}">Reject</button>`;
    return `<tr>
      <td><span style="font-size:18px;margin-right:6px">${it.icon}</span>${it.name}</td>
      <td>${it.category}</td>
      <td>${it.location}</td>
      <td>${it.date}</td>
      <td>${it.reporter}</td>
      <td class="admin-status-cell" data-id="${it.id}">${statusBadge}</td>
      <td style="display:flex;gap:6px;flex-wrap:wrap;align-items:center">
        <button class="btn btn-ghost btn-sm" data-view="${it.id}">🔍 View</button>
        <span class="admin-action-cell" data-id="${it.id}">${actions}</span>
      </td>
    </tr>`;
  }).join('');
}

document.getElementById('adminTable').addEventListener('click', e => {
  // View button — open item modal
  const viewBtn = e.target.closest('button[data-view]');
  if (viewBtn) { openItem(viewBtn.dataset.view); return; }

  // Approve / Reject
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const id = Number(btn.dataset.id);
  const it = ITEMS.find(i => i.id === id);
  if (!it) return;
  const isApprove = btn.dataset.act === 'approve';
  const newStatus = isApprove ? 'Approved' : 'Rejected';
  adminStatuses[id] = newStatus;

  // Update matching claim in CLAIMS array
  const claimIdx = CLAIMS.findIndex(c => c.id === id);
  if (claimIdx !== -1) {
    CLAIMS[claimIdx].status = newStatus;
  }

  // Add notification
  NOTIFS.unshift({
    text: `Your claim for "${it.name}" was ${newStatus.toLowerCase()}.`,
    time: 'just now'
  });

  // Save and re-render affected views
  save();
  renderClaims();
  renderStats();
  renderNotifs();

  // Update admin status cell in place
  const statusCell = document.querySelector(`.admin-status-cell[data-id="${id}"]`);
  if (statusCell) statusCell.innerHTML = isApprove
    ? '<span class="badge badge-ok">Approved</span>'
    : '<span class="badge badge-lost">Rejected</span>';

  // Replace action buttons with Done
  const actionCell = document.querySelector(`.admin-action-cell[data-id="${id}"]`);
  if (actionCell) actionCell.innerHTML = '<em style="color:var(--muted);font-size:12px">Done</em>';

  toast(`${isApprove ? '✅ Approved' : '❌ Rejected'}: ${it.name}`);
});

// Init
renderStats();
renderItems(ITEMS);
renderRecent();
renderClaims();
renderNotifs();
renderAdmin();

}, 0); // end setTimeout
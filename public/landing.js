// Modal
const modal = document.getElementById('loginModal');
const open = () => modal.classList.add('open');
const close = () => modal.classList.remove('open');
['openLogin', 'openLogin2', 'openLogin3'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('click', open);
});
modal.addEventListener('click', e => { if (e.target.dataset.close !== undefined) close(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

// Tabs
let mode = 'login';
document.querySelectorAll('.tab').forEach(t => {
  t.addEventListener('click', () => {
    mode = t.dataset.tab;
    document.querySelectorAll('.tab').forEach(x => x.classList.toggle('active', x === t));
    document.getElementById('nameField').style.display = mode === 'signup' ? 'flex' : 'none';
    document.getElementById('loginExtras').style.display = mode === 'signup' ? 'none' : 'flex';
    document.getElementById('modalTitle').textContent = mode === 'signup' ? 'Create your account' : 'Welcome back';
    document.getElementById('modalSub').textContent = mode === 'signup' ? 'Join TrackBack in seconds.' : 'Log in to your TrackBack account.';
    document.getElementById('submitBtn').textContent = mode === 'signup' ? 'Create account' : 'Log in';
    document.getElementById('authError').textContent = '';
  });
});

// Submit
document.getElementById('authForm').addEventListener('submit', e => {
  e.preventDefault();
  const email = document.getElementById('fEmail').value.trim();
  const pass = document.getElementById('fPass').value;
  const name = document.getElementById('fName').value.trim();
  const err = document.getElementById('authError');
  if (!email.includes('@')) { err.textContent = 'Please enter a valid email.'; return; }
  if (pass.length < 4) { err.textContent = 'Password must be at least 4 characters.'; return; }
  if (mode === 'signup' && !name) { err.textContent = 'Please enter your name.'; return; }
  const displayName = name || email.split('@')[0].replace(/\W+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const initials = displayName.split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  sessionStorage.setItem('tb_auth', '1');
  localStorage.setItem('tb_user', JSON.stringify({ name: displayName, email, initials }));
  window.location.href = '/app';
});

// Reveal on scroll
const io = new IntersectionObserver(entries => {
  entries.forEach(en => { if (en.isIntersecting) en.target.classList.add('in'); });
}, { threshold: .12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));
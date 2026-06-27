'use client';
import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AppPage() {
  useEffect(() => {
    const supabase = createClient();
    // Guards against React Strict Mode (dev) mounting this effect twice in a
    // row, which would otherwise register every event listener and realtime
    // subscription below twice. `cleanupFns` collects everything that needs
    // to be torn down so the outer useEffect cleanup can actually run it —
    // previously `init()`'s own `return () => {...}` was just discarded,
    // since useEffect's cleanup only runs for a function it gets *directly*,
    // not one buried inside an async function called from inside it.
    let cancelled = false;
    const cleanupFns = [];

    async function init() {
      // ── Auth gate ────────────────────────────────────────────
      const { data: { user } } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user) { window.location.href = '/'; return; }

      // ── Get profile ──────────────────────────────────────────
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (cancelled) return;
      if (!profile) { window.location.href = '/'; return; }

      // ── Declare data arrays ──────────────────────────────────
      let ITEMS  = [];
      let CLAIMS = [];

      // ── Set user UI ──────────────────────────────────────────
      document.getElementById('userName').textContent      = profile.name;
      document.getElementById('userAvatar').textContent    = profile.initials || profile.name[0].toUpperCase();
      document.getElementById('userRoleLabel').textContent = profile.role || 'Student';

      const isAdmin = profile.role === 'Staff' || profile.role === 'Admin';
      document.getElementById('adminNavItem').style.display = isAdmin ? 'flex' : 'none';

      // ── Toast ────────────────────────────────────────────────
      function toast(msg, type = 'ok') {
        document.querySelector('.toast')?.remove();
        const t = document.createElement('div');
        t.className   = `toast ${type}`;
        t.textContent = msg;
        document.body.appendChild(t);
        setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '.3s'; }, 2400);
        setTimeout(() => t.remove(), 2800);
      }

      // ── Custom confirm dialog ─────────────────────────────────
      function customConfirm(message) {
        return new Promise((resolve) => {
          const overlay = document.createElement('div');
          overlay.className = 'confirm-overlay';
          overlay.innerHTML = `
            <div class="confirm-card">
              <p class="confirm-msg">${message}</p>
              <div class="confirm-actions">
                <button class="btn btn-ghost" id="confirmCancel">Cancel</button>
                <button class="btn btn-danger" id="confirmOk">Confirm</button>
              </div>
            </div>`;
          document.body.appendChild(overlay);
          overlay.querySelector('#confirmOk').addEventListener('click', () => { overlay.remove(); resolve(true); });
          overlay.querySelector('#confirmCancel').addEventListener('click', () => { overlay.remove(); resolve(false); });
          overlay.addEventListener('click', e => { if (e.target === overlay) { overlay.remove(); resolve(false); } });
        });
      }

      // ── Navigation ───────────────────────────────────────────
      function navigate(pageId) {
        document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === pageId));
        document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === pageId));
        if (window.innerWidth <= 768) document.getElementById('sidebar').classList.remove('open');
        if (pageId === 'browse')   applyFilters();
        if (pageId === 'messages') renderChatList();
        window.scrollTo(0, 0);
      }
      document.querySelectorAll('[data-page]').forEach(el =>
        el.addEventListener('click', e => { e.preventDefault(); navigate(el.dataset.page); })
      );
      document.querySelectorAll('[data-nav]').forEach(el =>
        el.addEventListener('click', () => navigate(el.dataset.nav))
      );
      document.getElementById('menuBtn').addEventListener('click', () =>
        document.getElementById('sidebar').classList.toggle('open')
      );
      document.addEventListener('click', e => {
        const sb = document.getElementById('sidebar');
        if (window.innerWidth <= 768 && sb.classList.contains('open') &&
            !sb.contains(e.target) && e.target.id !== 'menuBtn') {
          sb.classList.remove('open');
        }
      });

      // ── Logout ───────────────────────────────────────────────
      document.getElementById('logoutBtn').addEventListener('click', async () => {
        const ok = await customConfirm('Log out of TrackBack?');
        if (!ok) return;
        await supabase.auth.signOut();
        window.location.href = '/';
      });

      // ── Badge helper ─────────────────────────────────────────
      function badgeClass(s) {
        if (s === 'Lost')     return 'badge badge-lost';
        if (s === 'Found')    return 'badge badge-found';
        if (s === 'Returned') return 'badge badge-muted';
        if (s === 'Pending')  return 'badge badge-warn';
        if (s === 'Approved') return 'badge badge-ok';
        if (s === 'Rejected') return 'badge badge-lost';
        return 'badge badge-muted';
      }

      // ── Notifications ────────────────────────────────────────
      const notifBtn = document.getElementById('notifBtn');
      const notifPop = document.getElementById('notifPop');

      async function fetchNotifs() {
        const { data } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);
        renderNotifs(data || []);
      }

      function renderNotifs(notifs) {
        const list   = document.getElementById('notifList');
        const dot    = document.getElementById('notifDot');
        const unread = notifs.filter(n => !n.read).length;
        dot.style.display = unread > 0 ? 'block' : 'none';
        if (!notifs.length) {
          list.innerHTML = '<li><em style="color:var(--muted)">No notifications</em></li>';
          return;
        }
        list.innerHTML = notifs.map(n =>
          `<li class="${n.read ? '' : 'unread'}" data-notif="${n.id}">
            <span style="font-size:16px">${n.read ? '🔔' : '🔴'}</span>
            <div>${n.text}<small>${new Date(n.created_at).toLocaleDateString()}</small></div>
          </li>`
        ).join('');
      }

      document.getElementById('markAllRead')?.addEventListener('click', async () => {
        await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
        fetchNotifs();
      });
      document.getElementById('clearNotifs')?.addEventListener('click', async () => {
        await supabase.from('notifications').delete().eq('user_id', user.id);
        fetchNotifs();
      });
      notifBtn.addEventListener('click', async e => {
        e.stopPropagation();
        notifPop.classList.toggle('open');
        if (notifPop.classList.contains('open')) {
          await supabase.from('notifications').update({ read: true }).eq('user_id', user.id);
          fetchNotifs();
        }
      });
      document.addEventListener('click', e => {
        if (!notifPop.contains(e.target) && e.target !== notifBtn)
          notifPop.classList.remove('open');
      });

      // ── Stats ────────────────────────────────────────────────
      function renderStats() {
        document.getElementById('sLost').textContent     = ITEMS.filter(i => i.status === 'Lost').length;
        document.getElementById('sFound').textContent    = ITEMS.filter(i => i.status === 'Found').length;
        document.getElementById('sReturned').textContent = ITEMS.filter(i => i.status === 'Returned').length;
        document.getElementById('sPending').textContent  = CLAIMS.filter(c => c.status === 'Pending').length;
      }

      // ── Items ────────────────────────────────────────────────
      async function fetchItems() {
        const { data } = await supabase
          .from('items')
          .select('*')
          .order('created_at', { ascending: false });
        ITEMS = data || [];
        renderStats();
        renderItems(ITEMS);
        renderRecent();
      }

      function renderItems(list) {
        const grid = document.getElementById('itemsGrid');
        if (!list.length) {
          grid.innerHTML = `<div class="empty-state"><span>🔍</span><p>No items match your filters.</p>
            <button class="btn btn-ghost btn-sm" id="clearFiltersBtn">Clear filters</button></div>`;
          document.getElementById('clearFiltersBtn')?.addEventListener('click', () => {
            document.getElementById('searchInput2').value   = '';
            document.getElementById('categoryFilter').value = '';
            document.getElementById('statusFilter').value   = '';
            applyFilters();
          });
          return;
        }
        grid.innerHTML = list.map(it => `
          <button class="item" data-id="${it.id}" aria-label="View ${it.name}">
            ${it.photo_url
              ? `<div class="item-img"><img src="${it.photo_url}" alt="${it.name}" style="width:100%;height:100%;object-fit:cover"/></div>`
              : `<div class="item-img">${it.icon || '📦'}</div>`}
            <div class="item-body">
              <div class="item-title">${it.name}</div>
              <div class="item-meta">${it.category} • ${it.location}</div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-top:4px">
                <span class="${badgeClass(it.status)}">${it.status}</span>
                <span style="font-size:11px;color:var(--muted)">${new Date(it.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</span>
              </div>
            </div>
          </button>`).join('');
      }

      function renderRecent() {
        const el      = document.getElementById('recentList');
        const display = ITEMS.slice(0, 5);
        if (!display.length) {
          el.innerHTML = '<li style="color:var(--muted);font-size:13px;padding:12px 0">No items yet.</li>';
          return;
        }
        el.innerHTML = display.map(it =>
          `<li data-id="${it.id}" style="cursor:pointer" tabindex="0" role="button">
            <span>${it.icon || '📦'} ${it.name}</span>
            <span class="${badgeClass(it.status)}">${it.status}</span>
          </li>`
        ).join('');
        el.querySelectorAll('li[data-id]').forEach(li => {
          li.addEventListener('click',   () => openItem(li.dataset.id));
          li.addEventListener('keydown', e => { if (e.key === 'Enter') openItem(li.dataset.id); });
        });
      }

      // ── Filters ──────────────────────────────────────────────
      function applyFilters() {
        const q1 = document.getElementById('searchInput').value.toLowerCase().trim();
        const q2 = document.getElementById('searchInput2').value.toLowerCase().trim();
        const q  = q2 || q1;
        const c  = document.getElementById('categoryFilter').value;
        const s  = document.getElementById('statusFilter').value;
        renderItems(ITEMS.filter(it =>
          (!q || it.name.toLowerCase().includes(q) || it.location.toLowerCase().includes(q) || it.category.toLowerCase().includes(q)) &&
          (!c || it.category === c) &&
          (!s || it.status === s)
        ));
      }
      document.getElementById('searchInput').addEventListener('input', () => {
        document.getElementById('searchInput2').value = document.getElementById('searchInput').value;
        navigate('browse'); applyFilters();
      });
      ['searchInput2','categoryFilter','statusFilter'].forEach(id =>
        document.getElementById(id).addEventListener('input', applyFilters)
      );

      // ── Claims ───────────────────────────────────────────────
      async function fetchClaims() {
        const { data } = await supabase
          .from('claims')
          .select('*, items(name, icon, category)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        CLAIMS = data || [];
        renderStats();
        renderClaims();
      }

      function renderClaims() {
        const body = document.getElementById('claimsBody');
        if (!CLAIMS.length) {
          body.innerHTML = `<tr><td colspan="4" style="text-align:center;color:var(--muted);padding:30px">
            No claims yet. <span class="link" data-nav="browse" style="color:var(--green);cursor:pointer">Browse items</span> to claim something.
          </td></tr>`;
          body.querySelector('[data-nav]')?.addEventListener('click', () => navigate('browse'));
          return;
        }
        body.innerHTML = CLAIMS.map(c => `
          <tr>
            <td>${c.items?.icon || '📦'} <strong>${c.items?.name || 'Unknown'}</strong></td>
            <td>${new Date(c.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
            <td><span class="${badgeClass(c.status)}">${c.status}</span></td>
            <td style="display:flex;gap:6px;flex-wrap:wrap">
              <button class="btn btn-ghost btn-sm" data-claim-msg="${c.item_id}">💬 Message</button>
              ${c.status === 'Pending'
                ? `<button class="btn btn-danger btn-sm" data-claim-cancel="${c.id}">Cancel</button>`
                : ''}
            </td>
          </tr>`).join('');

        body.querySelectorAll('[data-claim-cancel]').forEach(b => b.addEventListener('click', async () => {
          const ok = await customConfirm('Cancel this claim?');
          if (!ok) return;
          await supabase.from('claims').delete().eq('id', b.dataset.claimCancel);
          toast('Claim cancelled.');
          await fetchClaims();
        }));
        body.querySelectorAll('[data-claim-msg]').forEach(b => b.addEventListener('click', () => {
          const item = ITEMS.find(i => String(i.id) === String(b.dataset.claimMsg));
          if (item) openChatForItem(item.id, item.name, item.icon);
          navigate('messages');
        }));
      }

      // ── Item modal ───────────────────────────────────────────
      const modal = document.getElementById('itemModal');
      let activeItem = null;

      function openItem(id) {
        const it = ITEMS.find(i => String(i.id) === String(id));
        if (!it) return;
        activeItem = it;
        document.getElementById('mIcon').innerHTML = it.photo_url
          ? `<img src="${it.photo_url}" alt="${it.name}" style="width:88px;height:88px;object-fit:cover;border-radius:14px"/>`
          : it.icon || '📦';
        document.getElementById('mName').textContent     = it.name;
        document.getElementById('mBadge').innerHTML      = `<span class="${badgeClass(it.status)}">${it.status}</span>`;
        document.getElementById('mCategory').textContent = it.category;
        document.getElementById('mLocation').textContent = it.location;
        document.getElementById('mDate').textContent     = new Date(it.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
        document.getElementById('mReporter').textContent = it.reporter_name || 'Unknown';
        document.getElementById('mDesc').textContent     = it.description || 'No description provided.';
        const claimBtn = document.getElementById('mClaim');
        const already  = CLAIMS.some(c => String(c.item_id) === String(it.id));
        claimBtn.disabled    = already || it.status === 'Returned';
        claimBtn.textContent = already ? '✓ Already claimed' : 'Claim Item';
        modal.classList.add('open');
      }

      function closeModal() { modal.classList.remove('open'); }
      modal.addEventListener('click', e => { if ('close' in e.target.dataset) closeModal(); });
      document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

      document.getElementById('mClaim').addEventListener('click', async () => {
        if (!activeItem || activeItem.status === 'Returned') return;
        if (CLAIMS.some(c => String(c.item_id) === String(activeItem.id))) {
          toast('You already claimed this item.', 'warn'); return;
        }
        const { error } = await supabase.from('claims').insert({
          item_id: activeItem.id, user_id: user.id, status: 'Pending',
        });
        if (error) { toast('Failed to submit claim.', 'error'); return; }
        await supabase.from('notifications').insert({
          user_id: user.id,
          text:    `Claim submitted for "${activeItem.name}".`,
          read:    false,
        });
        toast('✅ Claim submitted!');
        closeModal();
        await fetchClaims();
        await fetchNotifs();
        navigate('claims');
      });

      document.getElementById('mMessage').addEventListener('click', () => {
        if (!activeItem) return;
        closeModal();
        openChatForItem(activeItem.id, activeItem.name, activeItem.icon);
        navigate('messages');
      });

      document.getElementById('itemsGrid').addEventListener('click', e => {
        const btn = e.target.closest('.item');
        if (btn) openItem(btn.dataset.id);
      });

      // ── Report form ──────────────────────────────────────────
      const dateInput = document.getElementById('rDate');
      if (dateInput) dateInput.valueAsDate = new Date();

      document.getElementById('rPhoto').addEventListener('change', e => {
        const file    = e.target.files[0];
        const preview = document.getElementById('photoPreview');
        if (!preview) return;
        if (file) {
          const r = new FileReader();
          r.onload = ev => { preview.src = ev.target.result; preview.style.display = 'block'; };
          r.readAsDataURL(file);
        } else { preview.style.display = 'none'; }
      });

      document.getElementById('reportForm').addEventListener('submit', async e => {
        e.preventDefault();
        const btn = e.target.querySelector('[type="submit"]');
        btn.disabled = true; btn.textContent = 'Submitting…';

        let photo_url   = null;
        const photoFile = document.getElementById('rPhoto').files[0];
        if (photoFile) {
          const ext  = photoFile.name.split('.').pop();
          const path = `${user.id}/${Date.now()}.${ext}`;
          const { error: uploadError } = await supabase.storage.from('item-photos').upload(path, photoFile);
          if (!uploadError) {
            const { data: urlData } = supabase.storage.from('item-photos').getPublicUrl(path);
            photo_url = urlData.publicUrl;
          }
        }

        const dateVal = document.getElementById('rDate').value;
        const { data: newItem, error } = await supabase.from('items').insert({
          name:          document.getElementById('rName').value.trim(),
          category:      document.getElementById('rCategory').value,
          status:        document.getElementById('rType').value,
          location:      document.getElementById('rLocation').value.trim(),
          description:   document.getElementById('rDesc').value.trim() || 'No description provided.',
          icon:          document.getElementById('rIcon').value.trim() || '📦',
          photo_url,
          date:          dateVal || new Date().toISOString().split('T')[0],
          reporter_id:   user.id,
          reporter_name: profile.name,
        }).select().single();

        btn.disabled = false; btn.textContent = 'Submit Report';
        if (error) { toast('Failed to submit report.', 'error'); return; }

        await supabase.from('notifications').insert({
          user_id: user.id,
          text:    `You reported "${newItem.name}" as ${newItem.status}.`,
          read:    false,
        });

        e.target.reset();
        dateInput.valueAsDate = new Date();
        const preview = document.getElementById('photoPreview');
        if (preview) preview.style.display = 'none';
        toast('✅ Report submitted!');
        await fetchItems();
        await fetchNotifs();
        navigate('dashboard');
      });

      // ── Chat ─────────────────────────────────────────────────
      let activeChatItemId = null;

      const REPLIES = [
        'Great, sounds like it! When can we meet?',
        'Awesome, I can be at the front desk in 10 mins.',
        "Perfect — I'll bring it tomorrow morning.",
        'Got it. Where would you like to pick it up?',
        'Thanks for confirming! 🙌',
        "Sure! I'll be near the library at noon.",
      ];

      async function fetchMessages(itemId) {
        const { data } = await supabase
          .from('messages')
          .select('*, profiles(name)')
          .eq('item_id', itemId)
          .order('created_at', { ascending: true });
        return data || [];
      }

      async function renderChatList() {
        const listEl = document.getElementById('chatConversations');
        if (!listEl) return;
        const { data: userMsgs } = await supabase
          .from('messages').select('item_id').eq('sender_id', user.id);
        const itemIds   = [...new Set((userMsgs || []).map(m => m.item_id))];
        const withChats = ITEMS.filter(it => itemIds.includes(it.id));
        if (!withChats.length) {
          listEl.innerHTML = `<div class="chat-empty">No conversations yet.<br><small>Claim or message an item to start chatting.</small></div>`;
          return;
        }
        listEl.innerHTML = withChats.map(it =>
          `<div class="convo-item${activeChatItemId === it.id ? ' active' : ''}" data-chat-item="${it.id}">
            <span class="convo-icon">${it.icon || '📦'}</span>
            <div class="convo-info">
              <strong>${it.name}</strong>
              <small>Click to open chat</small>
            </div>
          </div>`
        ).join('');
        listEl.querySelectorAll('[data-chat-item]').forEach(el =>
          el.addEventListener('click', () => {
            const it = ITEMS.find(i => String(i.id) === el.dataset.chatItem);
            if (it) openChatForItem(it.id, it.name, it.icon);
          })
        );
        if (!activeChatItemId && withChats.length) {
          openChatForItem(withChats[0].id, withChats[0].name, withChats[0].icon);
        }
      }

      async function openChatForItem(itemId, itemName, itemIcon) {
        activeChatItemId = itemId;
        const header = document.getElementById('chatHeader');
        if (header) header.innerHTML = `<span>${itemIcon || '📦'}</span> <strong>${itemName}</strong>`;
        const chatList = document.getElementById('chatList');
        chatList.innerHTML = '<div style="color:var(--muted);font-size:13px;padding:12px">Loading…</div>';
        const existing = await fetchMessages(itemId);
        if (!existing.length) {
          await supabase.from('messages').insert({
            item_id: itemId, sender_id: user.id,
            body: `Hi! I have a question about the ${itemName}.`,
          });
        }
        const messages = await fetchMessages(itemId);
        chatList.innerHTML = '';
        messages.forEach(m => {
          const el = document.createElement('div');
          el.className   = `msg ${m.sender_id === user.id ? 'out' : 'in'}`;
          el.textContent = m.body;
          chatList.appendChild(el);
        });
        chatList.scrollTop = chatList.scrollHeight;
        document.querySelectorAll('.convo-item').forEach(el =>
          el.classList.toggle('active', String(el.dataset.chatItem) === String(itemId))
        );
      }

      document.getElementById('chatForm').addEventListener('submit', async e => {
        e.preventDefault();
        const input = document.getElementById('chatText');
        const text  = input.value.trim();
        if (!text) return;
        if (!activeChatItemId) { toast('Select a conversation first.', 'warn'); return; }
        const { error } = await supabase.from('messages').insert({
          item_id: activeChatItemId, sender_id: user.id, body: text,
        });
        if (error) { toast('Failed to send message.', 'error'); return; }
        input.value = '';
        const messages = await fetchMessages(activeChatItemId);
        const chatList  = document.getElementById('chatList');
        chatList.innerHTML = '';
        messages.forEach(m => {
          const el = document.createElement('div');
          el.className   = `msg ${m.sender_id === user.id ? 'out' : 'in'}`;
          el.textContent = m.body;
          chatList.appendChild(el);
        });
        chatList.scrollTop = chatList.scrollHeight;
        setTimeout(async () => {
          const reply = REPLIES[Math.floor(Math.random() * REPLIES.length)];
          await supabase.from('messages').insert({
            item_id: activeChatItemId, sender_id: user.id, body: reply,
          });
          const updated = await fetchMessages(activeChatItemId);
          chatList.innerHTML = '';
          updated.forEach(m => {
            const el = document.createElement('div');
            el.className   = 'msg in';
            el.textContent = m.body;
            chatList.appendChild(el);
          });
          chatList.scrollTop = chatList.scrollHeight;
          renderChatList();
        }, 900);
      });

      // ── Admin ────────────────────────────────────────────────
      async function renderAdmin() {
        const body = document.getElementById('adminBody');
        if (!body) return;
        if (!ITEMS.length) {
          body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:30px">No items reported yet.</td></tr>';
          return;
        }
        const { data: allClaims } = await supabase
          .from('claims').select('*, profiles(name)').order('created_at', { ascending: false });

        body.innerHTML = ITEMS.map(it => {
          const itemClaim   = (allClaims || []).find(c => String(c.item_id) === String(it.id) && c.status === 'Pending');
          const isDone      = it.status === 'Returned';
          const statusBadge = `<span class="${badgeClass(it.status)}">${it.status}</span>`;
          const actionBtns  = isDone
            ? `<em style="color:var(--muted);font-size:12px">Done</em>`
            : `${it.status === 'Found' && itemClaim
                ? `<button class="btn btn-primary btn-sm" data-act="approve" data-id="${it.id}" data-claim="${itemClaim.id}">✅ Approve</button>
                   <button class="btn btn-danger btn-sm"  data-act="reject"  data-id="${it.id}" data-claim="${itemClaim.id}">❌ Reject</button>`
                : ''}
               ${it.status === 'Lost' || it.status === 'Found'
                ? `<button class="btn btn-secondary btn-sm" data-act="returned" data-id="${it.id}">🔄 Returned</button>`
                : ''}`;
          return `<tr>
            <td><span style="font-size:18px;margin-right:6px">${it.icon || '📦'}</span><strong>${it.name}</strong></td>
            <td>${it.category}</td>
            <td>${it.location}</td>
            <td>${new Date(it.date).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}</td>
            <td>${it.reporter_name || '—'}</td>
            <td class="admin-status-${it.id}">${statusBadge}</td>
            <td style="display:flex;gap:5px;flex-wrap:wrap;align-items:center">
              <button class="btn btn-ghost btn-sm" data-view="${it.id}">🔍 View</button>
              <span class="admin-actions-${it.id}" style="display:inline-flex;gap:5px;flex-wrap:wrap">${actionBtns}</span>
              <button class="btn btn-danger btn-sm" data-act="delete" data-id="${it.id}">🗑</button>
            </td>
          </tr>`;
        }).join('');
      }

      document.getElementById('adminTable').addEventListener('click', async e => {
        const viewBtn = e.target.closest('button[data-view]');
        if (viewBtn) { openItem(viewBtn.dataset.view); return; }
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const id      = btn.dataset.id;
        const claimId = btn.dataset.claim;
        const act     = btn.dataset.act;
        const it      = ITEMS.find(i => String(i.id) === String(id));
        if (!it) return;

        if (act === 'delete') {
          const ok = await customConfirm(`Delete "${it.name}" permanently?`);
          if (!ok) return;
          await supabase.from('items').delete().eq('id', id);
          toast(`🗑 "${it.name}" deleted.`);
          await fetchItems(); await renderAdmin(); return;
        }
        if (act === 'approve' && claimId) {
          await supabase.from('claims').update({ status: 'Approved' }).eq('id', claimId);
          const { data: claim } = await supabase.from('claims').select('user_id').eq('id', claimId).single();
          if (claim) await supabase.from('notifications').insert({ user_id: claim.user_id, text: `Your claim for "${it.name}" was approved.`, read: false });
          toast(`✅ Approved: ${it.name}`);
        } else if (act === 'reject' && claimId) {
          await supabase.from('claims').update({ status: 'Rejected' }).eq('id', claimId);
          const { data: claim } = await supabase.from('claims').select('user_id').eq('id', claimId).single();
          if (claim) await supabase.from('notifications').insert({ user_id: claim.user_id, text: `Your claim for "${it.name}" was rejected.`, read: false });
          toast(`❌ Rejected: ${it.name}`);
        } else if (act === 'returned') {
          await supabase.from('items').update({ status: 'Returned' }).eq('id', id);
          toast(`✅ "${it.name}" marked as Returned.`);
          await fetchItems();
        }
        await fetchClaims(); await renderAdmin();
        const statusCell  = document.querySelector(`.admin-status-${id}`);
        const actionsCell = document.querySelector(`.admin-actions-${id}`);
        if (statusCell && act !== 'returned') {
          statusCell.innerHTML = `<span class="${badgeClass(act === 'approve' ? 'Approved' : 'Rejected')}">${act === 'approve' ? 'Approved' : 'Rejected'}</span>`;
        }
        if (actionsCell) actionsCell.innerHTML = `<em style="color:var(--muted);font-size:12px">Done</em>`;
      });

      // ── Load all data ────────────────────────────────────────
      await Promise.all([fetchItems(), fetchClaims(), fetchNotifs()]);
      await renderAdmin();

      if (cancelled) return;

      // ── Real-time ────────────────────────────────────────────
      const channel = supabase.channel('items-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'items' }, async () => {
          await fetchItems(); await renderAdmin();
        }).subscribe();
      const claimsChannel = supabase.channel('claims-live')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'claims' }, async () => {
          await fetchClaims();
        }).subscribe();
      const notifsChannel = supabase.channel('notifs-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
          fetchNotifs();
        }).subscribe();
      const messagesChannel = supabase.channel('messages-live')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, async () => {
          if (activeChatItemId) {
            const messages = await fetchMessages(activeChatItemId);
            const chatList  = document.getElementById('chatList');
            chatList.innerHTML = '';
            messages.forEach(m => {
              const el = document.createElement('div');
              el.className   = `msg ${m.sender_id === user.id ? 'out' : 'in'}`;
              el.textContent = m.body;
              chatList.appendChild(el);
            });
            chatList.scrollTop = chatList.scrollHeight;
          }
          renderChatList();
        }).subscribe();

      cleanupFns.push(() => {
        supabase.removeChannel(channel);
        supabase.removeChannel(claimsChannel);
        supabase.removeChannel(notifsChannel);
        supabase.removeChannel(messagesChannel);
      });
    }

    init();

    // This is the cleanup useEffect actually runs (synchronously, on unmount
    // or before a Strict-Mode remount) — unlike init()'s old internal
    // `return () => {...}`, which was never reachable by React at all.
    return () => {
      cancelled = true;
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  // ── SVG icons ────────────────────────────────────────────────
  const icons = {
    dashboard: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    browse:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    report:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
    claims:    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
    messages:  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
    admin:     <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>,
  };

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap" rel="stylesheet" />
      <link rel="stylesheet" href="/app.css" />

      <div className="app-layout">
        <aside className="sidebar" id="sidebar">
          <div className="brand">
            <img src="/plsp-logo.jpg" alt="PLSP Logo" className="brand-logo-img" />
            <div>
              <div className="brand-name">TrackBack</div>
              <div className="brand-sub">PLSP Lost &amp; Found</div>
            </div>
          </div>
          <nav className="nav">
            <a className="nav-item active" data-page="dashboard">{icons.dashboard} <span>Dashboard</span></a>
            <a className="nav-item" data-page="browse">{icons.browse} <span>Browse Items</span></a>
            <a className="nav-item" data-page="report">{icons.report} <span>Report Item</span></a>
            <a className="nav-item" data-page="claims">{icons.claims} <span>My Claims</span></a>
            <a className="nav-item" data-page="messages">{icons.messages} <span>Messages</span></a>
            <a className="nav-item" data-page="admin" id="adminNavItem" style={{ display: 'none' }}>{icons.admin} <span>Admin</span></a>
          </nav>
          <div className="sidebar-footer">
            <div className="user">
              <div className="avatar" id="userAvatar">JD</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="user-name" id="userName">Loading…</div>
                <div className="user-role" id="userRoleLabel">Student</div>
              </div>
              <button className="logout-btn" id="logoutBtn" title="Log out">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="menu-btn" id="menuBtn" aria-label="Open menu">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="3" y1="6"  x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <div className="search">
              <input type="text" id="searchInput" placeholder="Search items, locations, categories…" aria-label="Search" />
            </div>
            <div className="topbar-actions">
              <div className="notif-wrap">
                <button className="icon-btn" id="notifBtn" title="Notifications" aria-label="Notifications">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                  </svg>
                  <span className="dot" id="notifDot"></span>
                </button>
                <div className="popover" id="notifPop" role="dialog" aria-label="Notifications">
                  <div className="popover-head">
                    <h4>Notifications</h4>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" id="markAllRead">Mark read</button>
                      <button className="btn btn-ghost btn-sm" id="clearNotifs">Clear</button>
                    </div>
                  </div>
                  <ul id="notifList"></ul>
                </div>
              </div>
              <button className="btn btn-primary" data-nav="report">+ Report Item</button>
            </div>
          </header>

          {/* ── Dashboard ── */}
          <section className="page active" id="dashboard">
            <div className="page-head">
              <h1>Dashboard</h1>
              <p className="muted">Overview of campus lost &amp; found activity.</p>
            </div>
            <div className="stats">
              <div className="stat-card"><div className="stat-label">Reported Lost</div><div className="stat-value" id="sLost">0</div></div>
              <div className="stat-card"><div className="stat-label">Reported Found</div><div className="stat-value" id="sFound">0</div></div>
              <div className="stat-card"><div className="stat-label">Returned</div><div className="stat-value" id="sReturned">0</div></div>
              <div className="stat-card"><div className="stat-label">Pending Claims</div><div className="stat-value" id="sPending">0</div></div>
            </div>
            <div className="grid-2">
              <div className="card">
                <h3>Recent Items</h3>
                <ul className="list" id="recentList"></ul>
              </div>
              <div className="card">
                <h3>Quick Actions</h3>
                <div className="quick-actions">
                  <button className="btn btn-secondary" data-nav="report">📝 Report Lost Item</button>
                  <button className="btn btn-secondary" data-nav="report">✨ Report Found Item</button>
                  <button className="btn btn-secondary" data-nav="browse">🔎 Browse Items</button>
                  <button className="btn btn-secondary" data-nav="messages">💬 Open Messages</button>
                </div>
              </div>
            </div>
          </section>

          {/* ── Browse ── */}
          <section className="page" id="browse">
            <div className="page-head">
              <h1>Browse Items</h1>
              <p className="muted">Find lost or found items across campus. Click any item for details.</p>
            </div>
            <div className="filters">
              <input type="text" id="searchInput2" placeholder="Search by name, location…" />
              <select id="categoryFilter">
                <option value="">All Categories</option>
                <option>Electronics</option><option>Books</option><option>Clothing</option>
                <option>Accessories</option><option>ID/Cards</option>
              </select>
              <select id="statusFilter">
                <option value="">All Statuses</option>
                <option>Lost</option><option>Found</option><option>Returned</option>
              </select>
            </div>
            <div className="items-grid" id="itemsGrid"></div>
          </section>

          {/* ── Report ── */}
          <section className="page" id="report">
            <div className="page-head">
              <h1>Report an Item</h1>
              <p className="muted">Help reunite items with their owners. Provide as much detail as possible.</p>
            </div>
            <form className="form form-report" id="reportForm">
              <div className="form-row">
                <label className="field">
                  <span className="field-label">Type <span className="req">*</span></span>
                  <select id="rType" required><option value="">Select…</option><option>Lost</option><option>Found</option></select>
                  <small className="field-help">Did you lose or find this item?</small>
                </label>
                <label className="field">
                  <span className="field-label">Category <span className="req">*</span></span>
                  <select id="rCategory" required>
                    <option value="">Select…</option>
                    <option>Electronics</option><option>Books</option><option>Clothing</option>
                    <option>Accessories</option><option>ID/Cards</option>
                  </select>
                  <small className="field-help">Choose the closest category.</small>
                </label>
              </div>
              <label className="field">
                <span className="field-label">Item Name <span className="req">*</span></span>
                <input type="text" id="rName" required placeholder="e.g. Black Jansport Backpack, iPhone 13, Blue Hydro Flask" />
                <small className="field-help">Be specific — include brand, color, or model.</small>
              </label>
              <div className="form-row">
                <label className="field">
                  <span className="field-label">Location <span className="req">*</span></span>
                  <input type="text" id="rLocation" required placeholder="e.g. Main Library 2nd floor" />
                  <small className="field-help">Where was it last seen or found on campus?</small>
                </label>
                <label className="field">
                  <span className="field-label">Date <span className="req">*</span></span>
                  <input type="date" id="rDate" required />
                  <small className="field-help">When was it lost or found?</small>
                </label>
              </div>
              <label className="field">
                <span className="field-label">Description <span className="req">*</span></span>
                <textarea id="rDesc" rows="5" required placeholder="Color, brand, size, unique marks, contents inside…"></textarea>
                <small className="field-help">More detail = faster verification and return.</small>
              </label>
              <div className="form-row">
                <label className="field">
                  <span className="field-label">Emoji icon</span>
                  <input type="text" id="rIcon" maxLength="2" placeholder="🎒 📱 🧥 🪪" />
                  <small className="field-help">Choose an emoji that represents the item.</small>
                </label>
                <label className="field">
                  <span className="field-label">Photo</span>
                  <input type="file" id="rPhoto" accept="image/*" className="file-input" />
                  <small className="field-help">Upload a clear image to improve matching.</small>
                </label>
              </div>
              <img id="photoPreview" src="/plsp-logo.jpg" alt="Preview" style={{ display: 'none', maxHeight: 160, borderRadius: 10, objectFit: 'cover', border: '1px solid var(--border)', marginTop: 4 }} />
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" data-nav="dashboard">Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Report</button>
              </div>
            </form>
          </section>

          {/* ── Claims ── */}
          <section className="page" id="claims">
            <div className="page-head">
              <h1>My Claims</h1>
              <p className="muted">Track items you&apos;ve claimed.</p>
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table">
                <thead><tr><th>Item</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody id="claimsBody"></tbody>
              </table>
            </div>
          </section>

          {/* ── Messages ── */}
          <section className="page" id="messages">
            <div className="page-head">
              <h1>Messages</h1>
              <p className="muted">Coordinate item returns securely.</p>
            </div>
            <div className="chat-layout">
              <div className="chat-sidebar">
                <div className="chat-sidebar-head">Conversations</div>
                <div id="chatConversations"></div>
              </div>
              <div className="card chat">
                <div className="chat-header" id="chatHeader">
                  <span style={{ color: 'var(--muted)', fontSize: 14 }}>Select a conversation →</span>
                </div>
                <div className="chat-list" id="chatList"></div>
                <form className="chat-input" id="chatForm">
                  <input type="text" id="chatText" placeholder="Type a message…" autoComplete="off" aria-label="Message" />
                  <button className="btn btn-primary" type="submit">Send</button>
                </form>
              </div>
            </div>
          </section>

          {/* ── Admin ── */}
          <section className="page" id="admin">
            <div className="page-head">
              <h1>Admin Console</h1>
              <p className="muted">Manage all reported items and claims.</p>
            </div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="table" id="adminTable">
                <thead>
                  <tr><th>Item</th><th>Category</th><th>Location</th><th>Date</th><th>Reporter</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody id="adminBody"></tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* ── Item modal ── */}
      <div className="modal" id="itemModal" aria-hidden="true">
        <div className="modal-backdrop" data-close="true"></div>
        <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="mName">
          <button className="modal-close" data-close="true" aria-label="Close">×</button>
          <div className="modal-icon" id="mIcon">📦</div>
          <h2 id="mName">Item</h2>
          <div id="mBadge"></div>
          <dl className="modal-info">
            <div><dt>Category</dt><dd id="mCategory">—</dd></div>
            <div><dt>Location</dt><dd id="mLocation">—</dd></div>
            <div><dt>Reported</dt><dd id="mDate">—</dd></div>
            <div><dt>Reporter</dt><dd id="mReporter">—</dd></div>
            <div className="full"><dt>Description</dt><dd id="mDesc">—</dd></div>
          </dl>
          <div className="modal-actions">
            <button className="btn btn-ghost" data-close="true">Close</button>
            <button className="btn btn-secondary" id="mMessage">💬 Message</button>
            <button className="btn btn-primary" id="mClaim">Claim Item</button>
          </div>
        </div>
      </div>
    </>
  );
}
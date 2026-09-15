/* ===========================================================
   STACKLY — Auth & Dashboard behaviour
   =========================================================== */

const StacklyAuth = {
  KEY: 'stackly_session',
  save(session){
    try{ localStorage.setItem(this.KEY, JSON.stringify(session)); }
    catch(e){ /* localStorage blocked (e.g. file:// origin) — fall back to URL handoff */ }
    this._memory = session;
  },
  get(){
    try{
      const raw = localStorage.getItem(this.KEY);
      if(raw) return JSON.parse(raw);
    }catch(e){ /* ignore */ }
    if(this._memory) return this._memory;
    // Fallback: read session passed via URL (used when storage is unavailable)
    const params = new URLSearchParams(window.location.search);
    if(params.get('sid')){
      return { id: params.get('sid'), role: params.get('srole'), name: params.get('sname'), loginTime: params.get('stime') || new Date().toISOString() };
    }
    return null;
  },
  clear(){
    try{ localStorage.removeItem(this.KEY); }catch(e){ /* ignore */ }
    this._memory = null;
  },
  toQueryString(session){
    return 'sid=' + encodeURIComponent(session.id) + '&srole=' + encodeURIComponent(session.role) +
      '&sname=' + encodeURIComponent(session.name) + '&stime=' + encodeURIComponent(session.loginTime);
  },
  requireRole(role){
    const s = this.get();
    if(!s || s.role !== role){ window.location.href = 'login.html'; return null; }
    // If we recovered the session from the URL, persist it (when possible) and clean the address bar
    try{ localStorage.setItem(this.KEY, JSON.stringify(s)); }catch(e){ /* ignore */ }
    if(window.location.search.includes('sid=') && window.history?.replaceState){
      window.history.replaceState({}, '', window.location.pathname);
    }
    return s;
  }
};

function toast(message, type = 'success'){
  let stack = document.querySelector('.toast-stack');
  if(!stack){
    stack = document.createElement('div');
    stack.className = 'toast-stack';
    document.body.appendChild(stack);
  }
  const el = document.createElement('div');
  el.className = 'toast' + (type === 'error' ? ' error' : '');
  el.innerHTML = `<span class="tick">${type === 'error' ? '!' : '✓'}</span><span>${message}</span>`;
  stack.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 400);
  }, 3200);
}

/* ===================== LOGIN PAGE ===================== */
function initLoginPage(){
  const toggle = document.querySelector('.role-toggle');
  const form = document.querySelector('.auth-form');
  if(!toggle || !form) return;

  let role = 'customer';
  const idInput = form.querySelector('#login-id');
  const idLabel = form.querySelector('#login-id-label');
  const demoId = form.querySelector('#demo-id');
  const demoPass = form.querySelector('#demo-pass');
  const roleButtons = toggle.querySelectorAll('button');

  const roleConfig = {
    customer: {
      label: 'Work email',
      placeholder: 'you@company.com',
      demoId: 'demo@stackly.com',
      demoPass: 'demo1234',
      dashboard: 'dashboard-user.html'
    },
    admin: {
      label: 'Admin ID',
      placeholder: 'admin@stackly.com',
      demoId: 'admin@stackly.com',
      demoPass: 'admin1234',
      dashboard: 'dashboard-admin.html'
    }
  };

  function setRole(r){
    role = r;
    toggle.classList.toggle('admin', r === 'admin');
    roleButtons.forEach(b => b.classList.toggle('active', b.dataset.role === r));
    idLabel.textContent = roleConfig[r].label;
    idInput.placeholder = roleConfig[r].placeholder;
    demoId.textContent = roleConfig[r].demoId;
    demoPass.textContent = roleConfig[r].demoPass;
    form.querySelector('.form-error').classList.remove('show');
  }
  roleButtons.forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
  setRole('customer');

  const eyeBtn = form.querySelector('.toggle-eye');
  const passInput = form.querySelector('#login-pass');
  if(eyeBtn){
    eyeBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      eyeBtn.innerHTML = isPass
        ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M6.5 6.7C4 8.3 2.3 10.7 1 12c1.7 2.7 5.5 7 11 7 2 0 3.7-.5 5.2-1.3M9.9 4.2C10.6 4.1 11.3 4 12 4c5.5 0 9.3 4.3 11 7-.6 1-1.6 2.3-2.9 3.6"/></svg>'
        : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errBox = form.querySelector('.form-error');
    const id = idInput.value.trim();
    const pass = passInput.value.trim();
    if(!id || !pass){
      errBox.querySelector('span').textContent = 'Please fill in both fields to continue.';
      errBox.classList.add('show');
      return;
    }
    const btn = form.querySelector('button[type=submit]');
    const btnTxt = btn.querySelector('.btn-txt span');
    btn.style.minWidth = btn.getBoundingClientRect().width + 'px';
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      StacklyAuth.save({
        id, role,
        name: id.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase()) || (role === 'admin' ? 'Admin' : 'Customer'),
        loginTime: new Date().toISOString()
      });
      btn.classList.remove('loading');
      btn.classList.add('success');
      btnTxt.textContent = 'Welcome back ✓';
      setTimeout(() => { window.location.href = roleConfig[role].dashboard; }, 500);
    }, 850);
  });
}

/* ===================== DASHBOARD SHELL ===================== */
function initDashboardShell(role){
  const session = StacklyAuth.requireRole(role);
  if(!session) return;

  // Fill in login id everywhere it's referenced
  document.querySelectorAll('[data-session-id]').forEach(el => el.textContent = session.id);
  document.querySelectorAll('[data-session-name]').forEach(el => el.textContent = session.name);
  document.querySelectorAll('[data-session-initial]').forEach(el => el.textContent = (session.name || session.id).trim().charAt(0).toUpperCase());
  document.querySelectorAll('[data-session-time]').forEach(el => {
    try{ el.textContent = new Date(session.loginTime).toLocaleString(); }catch(e){ el.textContent = '—'; }
  });

  // Sidebar mobile toggle (off-canvas drawer). Also locks background
  // scroll while open so the page behind the drawer doesn't move.
  const burger = document.querySelector('.sidebar-burger');
  const sidebar = document.querySelector('.dash-sidebar');
  const scrim = document.querySelector('.sidebar-scrim');
  function toggleSidebar(open){
    sidebar.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    document.body.classList.toggle('sidebar-open', open);
  }
  if(burger){
    burger.addEventListener('click', () => toggleSidebar(!sidebar.classList.contains('open')));
    scrim.addEventListener('click', () => toggleSidebar(false));
    sidebar.querySelectorAll('.dash-link').forEach(a => a.addEventListener('click', () => toggleSidebar(false)));
    // Close the drawer automatically if the viewport is resized back to desktop
    window.addEventListener('resize', () => {
      if(window.innerWidth > 900 && sidebar.classList.contains('open')) toggleSidebar(false);
    });
    // Escape key closes the drawer
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape' && sidebar.classList.contains('open')) toggleSidebar(false);
    });
  }

  // Nav link active-state + section switching (single-page demo sections)
  document.querySelectorAll('.dash-link[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelectorAll('.dash-link[data-target]').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      const target = link.dataset.target;
      document.querySelectorAll('.dash-section').forEach(s => s.style.display = 'none');
      const section = document.getElementById(target);
      if(section) section.style.display = '';
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  // User menu dropdown
  const chip = document.querySelector('.user-chip');
  const menu = document.querySelector('.user-menu');
  if(chip && menu){
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      chip.classList.toggle('open');
      menu.classList.toggle('open');
    });
    document.addEventListener('click', () => { chip.classList.remove('open'); menu.classList.remove('open'); });
    menu.addEventListener('click', e => e.stopPropagation());
  }

  // Copy login ID
  document.querySelectorAll('.copy-id').forEach(btn => {
    btn.addEventListener('click', () => {
      navigator.clipboard?.writeText(session.id).then(() => toast('Login ID copied to clipboard'))
        .catch(() => toast('Could not copy — select the ID manually', 'error'));
    });
  });

  // Notification bell
  document.querySelectorAll('.notif-btn').forEach(btn => {
    btn.addEventListener('click', () => toast('You are all caught up — no new notifications'));
  });

  // Generic action buttons -> toast feedback
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const msg = btn.dataset.action;
      toast(msg);
    });
  });

  // Logout flow with confirm modal
  const logoutModal = document.querySelector('.modal-overlay.logout');
  function openLogoutModal(){ logoutModal?.classList.add('open'); }
  function closeLogoutModal(){ logoutModal?.classList.remove('open'); }
  document.querySelectorAll('.logout-trigger').forEach(btn => btn.addEventListener('click', openLogoutModal));
  logoutModal?.querySelector('.cancel-logout')?.addEventListener('click', closeLogoutModal);
  logoutModal?.addEventListener('click', (e) => { if(e.target === logoutModal) closeLogoutModal(); });
  logoutModal?.querySelector('.confirm-logout')?.addEventListener('click', () => {
    StacklyAuth.clear();
    window.location.href = 'login.html';
  });

  // Chip tab switchers (e.g. revenue chart week/month/year — cosmetic re-render)
  document.querySelectorAll('.chip-tabs').forEach(tabs => {
    tabs.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => {
        tabs.querySelectorAll('button').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        const bars = tabs.closest('.panel')?.querySelectorAll('.bar');
        bars?.forEach(bar => {
          const h = 30 + Math.random() * 70;
          bar.style.height = h + '%';
        });
      });
    });
  });

  // Search (cosmetic demo filter on table rows if present)
  const search = document.querySelector('.dash-search input');
  const table = document.querySelector('.dash-table tbody');
  if(search && table){
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      table.querySelectorAll('tr').forEach(row => {
        row.style.display = row.textContent.toLowerCase().includes(q) ? '' : 'none';
      });
    });
  }

  // Table row action buttons
  document.querySelectorAll('.mini-btn[data-msg]').forEach(btn => {
    btn.addEventListener('click', () => toast(btn.dataset.msg, btn.classList.contains('danger') ? 'error' : 'success'));
  });
}
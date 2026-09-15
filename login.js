/* ===========================================================
   STACKLY — Login v2 behaviour
   =========================================================== */

function initLoginPageV2(){
  const tabs = document.querySelector('.lp-tabs');
  const form = document.querySelector('.lp-form');
  if(!tabs || !form) return;

  let role = 'customer';
  const idInput = form.querySelector('#lp-id');
  const idLabel = form.querySelector('#lp-id-label');
  const demoId = form.querySelector('#lp-demo-id');
  const demoPass = form.querySelector('#lp-demo-pass');
  const tabButtons = tabs.querySelectorAll('.lp-tab');

  const roleConfig = {
    customer: {
      label: 'Work email',
      demoId: 'demo@stackly.com',
      demoPass: 'demo1234',
      dashboard: 'dashboard-user.html'
    },
    admin: {
      label: 'Admin ID',
      demoId: 'admin@stackly.com',
      demoPass: 'admin1234',
      dashboard: 'dashboard-admin.html'
    }
  };

  function setRole(r){
    role = r;
    tabs.classList.toggle('admin', r === 'admin');
    tabButtons.forEach(b => b.classList.toggle('active', b.dataset.role === r));
    idLabel.textContent = roleConfig[r].label;
    demoId.textContent = roleConfig[r].demoId;
    demoPass.textContent = roleConfig[r].demoPass;
    form.querySelector('.lp-error').classList.remove('show');
  }
  tabButtons.forEach(b => b.addEventListener('click', () => setRole(b.dataset.role)));
  setRole('customer');

  const eyeBtn = form.querySelector('.lp-eye');
  const passInput = form.querySelector('#lp-pass');
  if(eyeBtn){
    eyeBtn.addEventListener('click', () => {
      const isPass = passInput.type === 'password';
      passInput.type = isPass ? 'text' : 'password';
      eyeBtn.innerHTML = isPass
        ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M6.5 6.7C4 8.3 2.3 10.7 1 12c1.7 2.7 5.5 7 11 7 2 0 3.7-.5 5.2-1.3M9.9 4.2C10.6 4.1 11.3 4 12 4c5.5 0 9.3 4.3 11 7-.6 1-1.6 2.3-2.9 3.6"/></svg>'
        : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const errBox = form.querySelector('.lp-error');
    const id = idInput.value.trim();
    const pass = passInput.value.trim();
    if(!id || !pass){
      errBox.querySelector('span').textContent = 'Please fill in both fields to continue.';
      errBox.classList.remove('show');
      void errBox.offsetWidth;
      errBox.classList.add('show');
      return;
    }
    errBox.classList.remove('show');

    const btn = form.querySelector('.lp-submit');
    const label = btn.querySelector('.lp-label span');
    btn.classList.add('loading');
    btn.disabled = true;

    setTimeout(() => {
      const session = {
        id, role,
        name: id.split('@')[0].replace(/[._]/g,' ').replace(/\b\w/g, c => c.toUpperCase()) || (role === 'admin' ? 'Admin' : 'Customer'),
        loginTime: new Date().toISOString()
      };
      StacklyAuth.save(session);
      btn.classList.remove('loading');
      btn.classList.add('success');
      label.textContent = 'Welcome back ✓';
      setTimeout(() => {
        const target = roleConfig[role].dashboard;
        // If localStorage isn't available (e.g. opening the file directly rather than via a server),
        // hand the session off through the URL so the dashboard can still recognize it.
        let sessionSaved = false;
        try{ sessionSaved = !!localStorage.getItem(StacklyAuth.KEY); }catch(e){ sessionSaved = false; }
        window.location.href = sessionSaved ? target : (target + '?' + StacklyAuth.toQueryString(session));
      }, 550);
    }, 900);
  });

  /* Rotating testimonial / stat highlight on the visual panel */
  const quotes = [
    { text: '“Stackly replaced four tools and cut our billing errors to zero.”', meta: '— Amara Osei, Head of Ops, Vellum Studio' },
    { text: '“Setup took an afternoon. Our whole team was live by Friday.”', meta: '— Devon Lang, Founder, Orbital Labs' },
    { text: '“The clearest revenue view we have ever had, bar none.”', meta: '— Priya Sharma, CFO, Northwind Traders' }
  ];
  const quoteEl = document.querySelector('.sv-quote');
  const metaEl = document.querySelector('.sv-quote-meta');
  if(quoteEl && metaEl){
    let qi = 0;
    setInterval(() => {
      qi = (qi + 1) % quotes.length;
      quoteEl.style.opacity = 0;
      metaEl.style.opacity = 0;
      setTimeout(() => {
        quoteEl.textContent = quotes[qi].text;
        metaEl.textContent = quotes[qi].meta;
        quoteEl.style.opacity = 1;
        metaEl.style.opacity = 1;
      }, 350);
    }, 4200);
  }
}
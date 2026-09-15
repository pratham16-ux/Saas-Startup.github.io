document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Scroll progress bar ---------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  document.body.appendChild(progress);
  window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    progress.style.width = scrolled + '%';
  });

  /* ---------- Word-by-word heading reveal for hero h1 ---------- */
  document.querySelectorAll('.hero h1, .page-hero h1').forEach(h => {
    const html = h.innerHTML;
    // wrap plain words in spans, keep <em> tags intact
    const temp = document.createElement('div');
    temp.innerHTML = html;
    let wordIndex = 0;
    function wrapWords(node){
      Array.from(node.childNodes).forEach(child => {
        if(child.nodeType === 3){
          const frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(w => {
            if(w.trim() === ''){ frag.appendChild(document.createTextNode(w)); }
            else{
              const span = document.createElement('span');
              span.textContent = w;
              span.style.transitionDelay = (wordIndex * 45) + 'ms';
              wordIndex++;
              frag.appendChild(span);
            }
          });
          node.replaceChild(frag, child);
        } else if(child.nodeType === 1){
          wrapWords(child);
        }
      });
    }
    wrapWords(temp);
    h.innerHTML = temp.innerHTML;
    h.classList.add('word-reveal');
    requestAnimationFrame(() => requestAnimationFrame(() => h.classList.add('in')));
  });

  /* ---------- Hero floating particles ---------- */
  document.querySelectorAll('.hero').forEach(hero => {
    for(let i = 0; i < 14; i++){
      const p = document.createElement('span');
      p.className = 'particle';
      const size = 3 + Math.random() * 5;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = (40 + Math.random() * 55) + '%';
      p.style.animationDuration = (6 + Math.random() * 8) + 's';
      p.style.animationDelay = (Math.random() * 8) + 's';
      hero.appendChild(p);
    }
  });

  /* ---------- Mobile menu ---------- */
  const burger = document.querySelector('.burger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const scrim = document.querySelector('.menu-scrim');
  const closeBtn = document.querySelector('.menu-close');
  function toggleMenu(open){
    burger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    scrim.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if(burger){
    burger.addEventListener('click', () => toggleMenu(!mobileMenu.classList.contains('open')));
    scrim.addEventListener('click', () => toggleMenu(false));
    if(closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
    document.addEventListener('keydown', e => { if(e.key === 'Escape') toggleMenu(false); });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
  }

  /* ---------- Cursor glow (desktop only) ---------- */
  const glow = document.querySelector('.cursor-glow');
  const isHoverCapable = matchMedia('(hover:hover)').matches;
  if(glow && isHoverCapable){
    window.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  /* ---------- Card mouse-follow spotlight + 3D tilt ---------- */
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', (px * 100) + '%');
      card.style.setProperty('--my', (py * 100) + '%');
      if(isHoverCapable){
        const rotX = (py - 0.5) * -8;
        const rotY = (px - 0.5) * 10;
        card.style.transform = `translateY(-8px) perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- Hero visual parallax ---------- */
  const heroVisual = document.querySelector('.hero-visual');
  if(heroVisual && isHoverCapable){
    document.querySelector('.hero')?.addEventListener('mousemove', e => {
      const r = heroVisual.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / r.width;
      const dy = (e.clientY - cy) / r.height;
      heroVisual.style.transform = `perspective(900px) rotateY(${dx * 6}deg) rotateX(${dy * -6}deg)`;
    });
    document.querySelector('.hero')?.addEventListener('mouseleave', () => { heroVisual.style.transform = ''; });
  }

  /* ---------- Magnetic buttons ---------- */
  if(isHoverCapable){
    document.querySelectorAll('.btn').forEach(btn => {
      btn.addEventListener('mousemove', e => {
        const r = btn.getBoundingClientRect();
        const mx = (e.clientX - r.left - r.width / 2) * 0.25;
        const my = (e.clientY - r.top - r.height / 2) * 0.35;
        btn.style.setProperty('--mx', mx + 'px');
        btn.style.setProperty('--my', my + 'px');
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.setProperty('--mx', '0px');
        btn.style.setProperty('--my', '0px');
      });
    });
  }

  /* ---------- Button ripple on click ---------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.style.position = btn.style.position || 'relative';
    btn.style.overflow = 'hidden';
    btn.addEventListener('click', function(e){
      const r = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(r.width, r.height) * 1.4;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------- Scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal, .reveal-scale').forEach((el, i) => {
    if(el.closest('.stagger')){
      const siblings = Array.from(el.parentElement.children);
      el.style.setProperty('--i', siblings.indexOf(el));
    }
    io.observe(el);
  });

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        const el = entry.target;
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
        const dur = 1600;
        const start = performance.now();
        function tick(now){
          const p = Math.min((now - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (target * eased).toFixed(decimals) + suffix;
          if(p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        cio.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(el => cio.observe(el));

  /* ---------- Testimonial slider ---------- */
  const slides = document.querySelectorAll('.t-slide');
  const dots = document.querySelectorAll('.t-dots button');
  let tIndex = 0;
  function showSlide(i){
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[i].classList.add('active');
    if(dots[i]) dots[i].classList.add('active');
    tIndex = i;
  }
  if(slides.length){
    showSlide(0);
    dots.forEach((d,i) => d.addEventListener('click', () => showSlide(i)));
    setInterval(() => showSlide((tIndex + 1) % slides.length), 5000);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const q = item.querySelector('.faq-q');
    const a = item.querySelector('.faq-a');
    q.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.faq-item').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
      });
      if(!isOpen){
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Pricing toggle ---------- */
  const toggle = document.querySelector('.toggle');
  if(toggle){
    const monthlyEls = document.querySelectorAll('[data-monthly]');
    const yearlyEls = document.querySelectorAll('[data-yearly]');
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('on');
      const yearly = toggle.classList.contains('on');
      monthlyEls.forEach(el => el.style.display = yearly ? 'none' : '');
      yearlyEls.forEach(el => el.style.display = yearly ? '' : 'none');
    });
  }

  /* ---------- Header shadow + back to top ---------- */
  const header = document.querySelector('header.site');
  const toTop = document.querySelector('.to-top');
  window.addEventListener('scroll', () => {
    if(header) header.style.boxShadow = window.scrollY > 10 ? '0 10px 30px -20px rgba(30,26,18,.18)' : 'none';
    if(toTop) toTop.classList.toggle('show', window.scrollY > 500);
  });
  if(toTop) toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));

  /* ---------- Bars animation stagger (hero mock chart) ---------- */
  document.querySelectorAll('.mockbars i').forEach((bar,i) => {
    bar.style.animationDelay = (i * 0.09) + 's';
  });

  /* ---------- Newsletter join button ---------- */
  document.querySelectorAll('.newsletter').forEach(box => {
    const input = box.querySelector('input[type=email]');
    const btn = box.querySelector('button');
    if(!input || !btn) return;
    const original = btn.textContent;
    btn.addEventListener('click', () => {
      const email = input.value.trim();
      const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      if(!isValid){
        input.classList.add('input-error');
        input.focus();
        setTimeout(() => input.classList.remove('input-error'), 1200);
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Joining…';
      setTimeout(() => {
        btn.textContent = 'Joined ✓';
        input.value = '';
        setTimeout(() => { btn.textContent = original; btn.disabled = false; }, 2200);
      }, 700);
    });
    input.addEventListener('keydown', e => { if(e.key === 'Enter') btn.click(); });
  });

  /* ---------- Form submit demo ---------- */
  const form = document.querySelector('.contact-form');
  if(form){
    form.addEventListener('submit', e => {
      e.preventDefault();
      const btn = form.querySelector('button[type=submit]');
      const original = btn.innerHTML;
      btn.innerHTML = '<span>Sending…</span>';
      setTimeout(() => {
        btn.innerHTML = '<span>Message sent ✓</span>';
        setTimeout(() => { btn.innerHTML = original; form.reset(); }, 2200);
      }, 900);
    });
  }
});
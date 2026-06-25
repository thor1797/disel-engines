const menuToggle = document.querySelector('.menu-toggle');
const navLinks   = document.querySelector('.nav-links');
const overlay    = document.querySelector('.overlay');

function openMenu() {
    navLinks && navLinks.classList.add('active');
    overlay  && overlay.classList.add('active');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'true');
    menuToggle && (menuToggle.textContent = '✕');
    document.body.classList.add('no-scroll');
}

function closeMenu() {
    navLinks && navLinks.classList.remove('active');
    overlay  && overlay.classList.remove('active');
    menuToggle && menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle && (menuToggle.textContent = '☰');
    document.body.classList.remove('no-scroll');
    // also close any open dropdowns
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        navLinks && navLinks.classList.contains('active') ? closeMenu() : openMenu();
    });
}

overlay && overlay.addEventListener('click', closeMenu);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
});

// Close nav on normal link click (not dropdown toggles) on mobile
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        const isMobile = window.matchMedia('(max-width: 700px)').matches;
        const parentLi = link.closest('li');
        const isDropdownToggle = parentLi && parentLi.classList.contains('dropdown') && !link.closest('.dropdown-menu');

        if (isMobile && isDropdownToggle) {
            e.preventDefault();
            parentLi.classList.toggle('open');
            return;
        }

        if (isMobile) closeMenu();
    });
});

// ── Smooth reveal for hero-inner ──
const heroInner = document.querySelector('.hero-inner');
if (heroInner) {
    heroInner.style.opacity = '0';
    heroInner.style.transform = 'translateY(12px)';
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'opacity 700ms cubic-bezier(.2,.9,.2,1), transform 700ms cubic-bezier(.2,.9,.2,1)';
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'none';
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    io.observe(heroInner);
}

// ── Smooth scroll for # anchors ──
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
        if (a.getAttribute('href') === '#') {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
});

// ── Image slider ──
;(function () {
    const track   = document.querySelector('.slider-track');
    if (!track) return;
    const slides  = Array.from(track.querySelectorAll('.slide'));
    const prevBtn = document.querySelector('.slider-btn.prev');
    const nextBtn = document.querySelector('.slider-btn.next');
    const dotsWrap = document.querySelector('.slider-dots');
    const sliderEl = document.querySelector('.slider');
    let current = 0, interval = null;
    let slideWidth = 0, gap = 0;

    function recalc() {
        if (!slides.length) return;
        slideWidth = slides[0].getBoundingClientRect().width;
        gap = parseFloat(getComputedStyle(track).gap) || 0;
        track.style.transform = `translateX(-${current * (slideWidth + gap)}px)`;
    }

    function goTo(index) {
        current = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${current * (slideWidth + gap)}px)`;
        updateDots();
    }

    function updateDots() {
        if (!dotsWrap) return;
        dotsWrap.querySelectorAll('button').forEach((b, i) => {
            b.classList.toggle('active', i === current);
            b.setAttribute('aria-selected', String(i === current));
            b.setAttribute('tabindex', i === current ? '0' : '-1');
        });
    }

    slides.forEach((_, i) => {
        const btn = document.createElement('button');
        btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
        btn.addEventListener('click', () => { goTo(i); resetAutoplay(); });
        dotsWrap && dotsWrap.appendChild(btn);
    });

    prevBtn && prevBtn.addEventListener('click', () => { goTo(current - 1); resetAutoplay(); });
    nextBtn && nextBtn.addEventListener('click', () => { goTo(current + 1); resetAutoplay(); });

    function startAutoplay() { if (interval) clearInterval(interval); interval = setInterval(() => goTo(current + 1), 4500); }
    function stopAutoplay()  { clearInterval(interval); interval = null; }
    function resetAutoplay() { stopAutoplay(); startAutoplay(); }

    sliderEl && sliderEl.addEventListener('mouseenter', stopAutoplay);
    sliderEl && sliderEl.addEventListener('mouseleave', startAutoplay);

    let startX = 0, dx = 0;
    sliderEl && sliderEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; stopAutoplay(); });
    sliderEl && sliderEl.addEventListener('touchmove',  (e) => { dx = e.touches[0].clientX - startX; });
    sliderEl && sliderEl.addEventListener('touchend',   () => { if (Math.abs(dx) > 40) goTo(dx > 0 ? current - 1 : current + 1); resetAutoplay(); });

    window.addEventListener('resize', recalc);
    window.addEventListener('load', recalc);
    slides.forEach(s => { const img = s.querySelector('img'); if (img && !img.complete) img.addEventListener('load', recalc); });

    recalc();
    goTo(0);
    startAutoplay();
})();
const els = document.querySelectorAll('[data-r]');
const io = new IntersectionObserver(e => e.forEach(x => { if(x.isIntersecting){x.target.classList.add('on');io.unobserve(x.target);} }), {threshold:0.1});
els.forEach(el => io.observe(el));
/* nexus-contact.js */

(function () {
    const form      = document.getElementById('nxForm');
    const submitBtn = document.getElementById('nxSubmit');
    const success   = document.getElementById('nxSuccess');
    const resetBtn  = document.getElementById('nxReset');
    const senderEmailEl = document.getElementById('nxSenderEmail');

    const fields = {
        name:    { el: document.getElementById('nxName'),    errEl: document.getElementById('nxNameErr'),    validate: v => v.trim().length >= 2 },
        phone:   { el: document.getElementById('nxPhone'),   errEl: document.getElementById('nxPhoneErr'),   validate: v => v.trim().length >= 7 },
        email:   { el: document.getElementById('nxEmail'),   errEl: document.getElementById('nxEmailErr'),   validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) },
        service: { el: document.getElementById('nxService'), errEl: document.getElementById('nxServiceErr'), validate: v => v !== '' },
        message: { el: document.getElementById('nxMsg'),     errEl: document.getElementById('nxMsgErr'),     validate: v => v.trim().length >= 5 },
    };

    /* Live validation */
    Object.values(fields).forEach(({ el, errEl, validate }) => {
        el.addEventListener('input', () => {
            if (validate(el.value)) {
                el.classList.remove('nx-invalid');
                errEl.classList.remove('nx-err--show');
            }
        });
    });

    function validateAll() {
        let valid = true;
        Object.values(fields).forEach(({ el, errEl, validate }) => {
            if (!validate(el.value)) {
                el.classList.add('nx-invalid');
                errEl.classList.add('nx-err--show');
                valid = false;
            } else {
                el.classList.remove('nx-invalid');
                errEl.classList.remove('nx-err--show');
            }
        });
        return valid;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!validateAll()) return;

        submitBtn.classList.add('nx-submitting');

        const formData = new FormData(form);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (response.ok) {
                senderEmailEl.textContent = fields.email.el.value.trim();
                form.reset();
                showSuccess();
            } else {
                showInlineError("Error: " + (data.message || "Submission failed."));
            }
        } catch (_) {
            showInlineError("Network error. Check your connection and try again.");
        } finally {
            submitBtn.classList.remove('nx-submitting');
        }
    });

    function showSuccess() {
        requestAnimationFrame(() => {
            success.classList.add('nx-success--show');
        });
    }

    function showInlineError(msg) {
        const old = form.querySelector('.nx-submit-error');
        if (old) old.remove();
        const p = document.createElement('p');
        p.className = 'nx-submit-error';
        p.style.cssText = 'font-size:13px;color:#F87171;margin-top:8px;text-align:center;';
        p.textContent = msg;
        submitBtn.insertAdjacentElement('afterend', p);
        setTimeout(() => p.remove(), 4000);
    }

    resetBtn.addEventListener('click', () => {
        success.classList.remove('nx-success--show');
        Object.values(fields).forEach(({ el, errEl }) => {
            el.classList.remove('nx-invalid');
            errEl.classList.remove('nx-err--show');
        });
    });
})();
const revealEls = document.querySelectorAll('[data-reveal]');
const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

  // Scroll-triggered reveal
  const revealEls = document.querySelectorAll('.reveal');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => io.observe(el));

  // Re-trigger pulse line draw animation when dividers scroll into view
  const pulseDividers = document.querySelectorAll('.divider-pulse .pulse-line');
  const pulseIO = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.animation = 'none';
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            el.style.animation = '';
          });
        });
        pulseIO.unobserve(el);
      }
    });
  }, { threshold: 0.4 });
  pulseDividers.forEach(el => pulseIO.observe(el));
/**
 * WEBYNIX — Main JavaScript
 * Handles: Navbar, Theme Toggle, Scroll Reveal, Counters,
 *          Portfolio Filter, Testimonial Slider, Billing Toggle,
 *          Contact Form Validation, Back to Top
 */

/* =============================================
   1. THEME TOGGLE (Dark / Light)
   ============================================= */
const themeToggle = document.getElementById('themeToggle');
const themeIcon   = document.getElementById('themeIcon');
const html        = document.documentElement;

// On load, restore saved theme
const savedTheme = localStorage.getItem('webynix-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next    = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('webynix-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'ri-sun-fill' : 'ri-moon-fill';
}

/* =============================================
   2. NAVBAR — Sticky + Active Links
   ============================================= */
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link[data-section]');
const sections  = document.querySelectorAll('section[id]');

window.addEventListener('scroll', () => {
  // Sticky shadow
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }

  // Highlight active nav link
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) {
      current = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('data-section') === current) {
      link.classList.add('active');
    }
  });

  // Back to top
  const backBtn = document.getElementById('backToTop');
  if (window.scrollY > 400) {
    backBtn.classList.add('visible');
  } else {
    backBtn.classList.remove('visible');
  }
});

/* =============================================
   3. MOBILE MENU (Hamburger)
   ============================================= */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
  navbar.classList.toggle('menu-open', isOpen);
  // Prevent body scroll when open
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

// Close mobile menu on link click
navMenu.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    navbar.classList.remove('menu-open');
    document.body.style.overflow = '';
  });
});

/* =============================================
   4. SCROLL REVEAL ANIMATION
   ============================================= */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger siblings
        const siblings = entry.target.parentElement.querySelectorAll('.reveal:not(.visible)');
        siblings.forEach((el, idx) => {
          setTimeout(() => el.classList.add('visible'), idx * 100);
        });
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* =============================================
   5. ANIMATED COUNTERS (Hero Stats)
   ============================================= */
function animateCounter(el, target, duration = 2000) {
  let start     = 0;
  const step    = Math.ceil(target / (duration / 16));
  const timer   = setInterval(() => {
    start += step;
    if (start >= target) {
      start = target;
      clearInterval(timer);
    }
    el.textContent = start;
  }, 16);
}

// Trigger counters when hero is visible
const heroSection = document.getElementById('home');
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.stat-num').forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'), 10);
        animateCounter(counter, target);
      });
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

if (heroSection) counterObserver.observe(heroSection);

/* =============================================
   6. PORTFOLIO FILTER
   ============================================= */
const filterBtns    = document.querySelectorAll('.filter-btn');
const portfolioCards = document.querySelectorAll('.portfolio-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');

    const filter = btn.getAttribute('data-filter');

    portfolioCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const show = filter === 'all' || category === filter;

      if (show) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInUp 0.5s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

// Add keyframe for portfolio filter animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;
document.head.appendChild(styleSheet);

/* =============================================
   7. TESTIMONIAL SLIDER
   ============================================= */
const track       = document.getElementById('testimonialTrack');
const tPrev       = document.getElementById('tPrev');
const tNext       = document.getElementById('tNext');
const tDotsEl     = document.getElementById('tDots');
const cards       = track ? track.querySelectorAll('.testimonial-card') : [];
let   currentSlide = 0;
let   autoplayTimer;

// Determine how many cards to show based on viewport
function getCardsVisible() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

let cardsVisible = getCardsVisible();
let totalSlides  = Math.max(0, cards.length - cardsVisible);

// Build dots
function buildDots() {
  tDotsEl.innerHTML = '';
  cardsVisible = getCardsVisible();
  totalSlides  = Math.max(0, cards.length - cardsVisible);
  for (let i = 0; i <= totalSlides; i++) {
    const dot = document.createElement('button');
    dot.className = 't-dot' + (i === currentSlide ? ' active' : '');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    tDotsEl.appendChild(dot);
  }
}

function goToSlide(idx) {
  currentSlide = Math.max(0, Math.min(idx, totalSlides));
  // Calculate card width + gap
  const cardW  = cards[0] ? cards[0].offsetWidth : 0;
  const gap    = 24;
  track.style.transform = `translateX(-${currentSlide * (cardW + gap)}px)`;
  tDotsEl.querySelectorAll('.t-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
  });
}

function nextSlide() { goToSlide(currentSlide >= totalSlides ? 0 : currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide <= 0 ? totalSlides : currentSlide - 1); }

if (tNext) tNext.addEventListener('click', () => { stopAutoplay(); nextSlide(); startAutoplay(); });
if (tPrev) tPrev.addEventListener('click', () => { stopAutoplay(); prevSlide(); startAutoplay(); });

// Auto-play
function startAutoplay() {
  autoplayTimer = setInterval(nextSlide, 5000);
}
function stopAutoplay() {
  clearInterval(autoplayTimer);
}

if (track) {
  buildDots();
  startAutoplay();
}

// Recalculate on resize
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    buildDots();
    goToSlide(0);
  }, 300);
});

// Touch/swipe support for slider
let touchStartX = 0;
if (track) {
  track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) diff > 0 ? nextSlide() : prevSlide();
  }, { passive: true });
}

/* =============================================
   8. BILLING TOGGLE (Monthly / Annual Pricing)
   ============================================= */
const billingToggle  = document.getElementById('billingToggle');
const monthlyPrices  = document.querySelectorAll('.monthly-price');
const annualPrices   = document.querySelectorAll('.annual-price');

if (billingToggle) {
  billingToggle.addEventListener('change', () => {
    const isAnnual = billingToggle.checked;
    billingToggle.setAttribute('aria-checked', isAnnual);
    monthlyPrices.forEach(el => el.style.display = isAnnual ? 'none' : 'inline');
    annualPrices.forEach(el  => el.style.display = isAnnual ? 'inline' : 'none');
  });
}

/* =============================================
   9. CONTACT FORM VALIDATION
   ============================================= */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  const nameInput    = document.getElementById('contactName');
  const emailInput   = document.getElementById('contactEmail');
  const messageInput = document.getElementById('contactMessage');
  const submitBtn    = document.getElementById('submitBtn');
  const formSuccess  = document.getElementById('formSuccess');

  // Real-time validation
  nameInput.addEventListener('blur',    () => validateName());
  emailInput.addEventListener('blur',   () => validateEmail());
  messageInput.addEventListener('blur', () => validateMessage());

  // Clear errors on focus
  [nameInput, emailInput, messageInput].forEach(input => {
    input.addEventListener('focus', () => clearError(input));
  });

  function validateName() {
    const val = nameInput.value.trim();
    if (!val) {
      showError(nameInput, 'nameError', 'Please enter your full name.');
      return false;
    }
    if (val.length < 2) {
      showError(nameInput, 'nameError', 'Name must be at least 2 characters.');
      return false;
    }
    clearError(nameInput, 'nameError');
    return true;
  }

  function validateEmail() {
    const val = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!val) {
      showError(emailInput, 'emailError', 'Please enter your email address.');
      return false;
    }
    if (!emailRegex.test(val)) {
      showError(emailInput, 'emailError', 'Please enter a valid email address.');
      return false;
    }
    clearError(emailInput, 'emailError');
    return true;
  }

  function validateMessage() {
    const val = messageInput.value.trim();
    if (!val) {
      showError(messageInput, 'messageError', 'Please enter your message.');
      return false;
    }
    if (val.length < 10) {
      showError(messageInput, 'messageError', 'Message must be at least 10 characters.');
      return false;
    }
    clearError(messageInput, 'messageError');
    return true;
  }

  function showError(input, errorId, msg) {
    input.classList.add('input-error');
    const errEl = document.getElementById(errorId);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(input, errorId) {
    input.classList.remove('input-error');
    if (errorId) {
      const errEl = document.getElementById(errorId);
      if (errEl) errEl.textContent = '';
    }
  }

  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const isNameValid    = validateName();
    const isEmailValid   = validateEmail();
    const isMessageValid = validateMessage();

    if (!isNameValid || !isEmailValid || !isMessageValid) return;

    // Show loading state
    const btnText   = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    btnText.style.display   = 'none';
    btnLoader.style.display = 'flex';
    submitBtn.disabled = true;

    // Real API call to Netlify
    const formData = new FormData(contactForm);
    formData.append("form-name", "contact");

    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(formData).toString()
    })
    .then(() => {
      btnText.style.display   = 'inline-flex';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;

      formSuccess.style.display = 'flex';
      contactForm.reset();

      // Hide success message after 5 seconds
      setTimeout(() => {
        formSuccess.style.display = 'none';
      }, 5000);
    })
    .catch((error) => {
      console.error('Form submission error:', error);
      btnText.style.display   = 'inline-flex';
      btnLoader.style.display = 'none';
      submitBtn.disabled = false;
      alert("There was an error sending the message. Please try again.");
    });
  });
}

/* =============================================
   10. BACK TO TOP
   ============================================= */
const backToTopBtn = document.getElementById('backToTop');
if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* =============================================
   11. FOOTER YEAR
   ============================================= */
const yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* =============================================
   12. SMOOTH SCROLL for anchor links
   ============================================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const navH = navbar ? navbar.offsetHeight : 80;
      const top  = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* =============================================
   13. PROCESS STEP HOVER GLOW
   ============================================= */
document.querySelectorAll('.process-step').forEach(step => {
  step.addEventListener('mouseenter', () => {
    step.querySelector('.step-icon').style.boxShadow =
      `0 0 0 6px var(--bg-primary), 0 0 32px var(--accent-glow)`;
  });
  step.addEventListener('mouseleave', () => {
    step.querySelector('.step-icon').style.boxShadow =
      '0 0 0 6px var(--bg-primary)';
  });
});

/* =============================================
   14. SUBTLE CURSOR GLOW on Hero
   ============================================= */
const heroEl = document.querySelector('.hero');
if (heroEl) {
  heroEl.addEventListener('mousemove', (e) => {
    const rect   = heroEl.getBoundingClientRect();
    const x      = ((e.clientX - rect.left) / rect.width)  * 100;
    const y      = ((e.clientY - rect.top)  / rect.height) * 100;
    heroEl.style.setProperty('--mouse-x', `${x}%`);
    heroEl.style.setProperty('--mouse-y', `${y}%`);
  });
}

/* =============================================
   15. SERVICE CARD TILT EFFECT
   ============================================= */
document.querySelectorAll('.service-card, .team-card, .pricing-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect   = card.getBoundingClientRect();
    const x      = e.clientX - rect.left;
    const y      = e.clientY - rect.top;
    const cx     = rect.width  / 2;
    const cy     = rect.height / 2;
    const rotateX = ((y - cy) / cy) * -6;
    const rotateY = ((x - cx) / cx) *  6;
    card.style.transform    = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    card.style.transition   = 'transform 0.1s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'all 0.3s cubic-bezier(0.4,0,0.2,1)';
  });
});

/* =============================================
   16. PRELOADER (optional fade-in on load)
   ============================================= */
window.addEventListener('load', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });
});

// Theme toggle with persistence
(function () {
  const root = document.documentElement;
  const stored = localStorage.getItem('theme');
  if (stored) {
    root.setAttribute('data-theme', stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }
})();

window.addEventListener('DOMContentLoaded', () => {
  // Year
  const yearEl = document.getElementById('year');
  if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

  // Image lightbox for project-page previews and interface galleries
  (function initLightbox() {
    const previews = Array.from(document.querySelectorAll(
      'main .project-gallery .project-preview, main .grid-2 > .project-card > .project-preview'
    ));
    if (!previews.length) return;

    const items = previews.map((preview) => {
      const img = preview.querySelector('img');
      const card = preview.closest('.project-card');
      const heading = card ? card.querySelector('h3') : null;
      return { preview, src: img ? img.currentSrc || img.src : '', alt: img ? img.alt : '', caption: heading ? heading.textContent.trim() : '' };
    }).filter((item) => item.src);

    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.setAttribute('aria-hidden', 'true');
    lightbox.innerHTML = `
      <div class="lightbox-dialog" role="dialog" aria-modal="true" aria-label="Image preview">
        <button type="button" class="lightbox-btn lightbox-close" aria-label="Close image preview">&times;</button>
        <button type="button" class="lightbox-btn lightbox-prev" aria-label="Previous image">&#8249;</button>
        <figure class="lightbox-figure">
          <img class="lightbox-img" src="" alt="">
          <figcaption class="lightbox-caption"></figcaption>
        </figure>
        <button type="button" class="lightbox-btn lightbox-next" aria-label="Next image">&#8250;</button>
      </div>`;
    document.body.appendChild(lightbox);

    const imgEl = lightbox.querySelector('.lightbox-img');
    const captionEl = lightbox.querySelector('.lightbox-caption');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    let current = 0;
    let lastFocused = null;

    const show = (index) => {
      current = (index + items.length) % items.length;
      const item = items[current];
      imgEl.src = item.src;
      imgEl.alt = item.alt;
      captionEl.textContent = item.caption;
      const single = items.length < 2;
      prevBtn.hidden = single;
      nextBtn.hidden = single;
    };

    const open = (index) => {
      lastFocused = document.activeElement;
      show(index);
      lightbox.classList.add('open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('modal-open');
      closeBtn.focus();
    };

    const close = () => {
      lightbox.classList.remove('open');
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('modal-open');
      if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    };

    items.forEach((item, index) => {
      item.preview.classList.add('zoomable');
      item.preview.setAttribute('role', 'button');
      item.preview.setAttribute('tabindex', '0');
      item.preview.setAttribute('aria-label', `View larger image: ${item.caption || item.alt}`);
      item.preview.addEventListener('click', () => open(index));
      item.preview.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(index); }
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', () => show(current - 1));
    nextBtn.addEventListener('click', () => show(current + 1));
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft' && items.length > 1) show(current - 1);
      else if (e.key === 'ArrowRight' && items.length > 1) show(current + 1);
    });
  })();

  // Mobile nav
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navClose = document.querySelector('.nav-close');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.classList.toggle('open', open);
    });
    navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      navMenu.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.classList.remove('open');
    }));
    if (navClose) {
      navClose.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
        navToggle.classList.remove('open');
      });
    }
  }

  const scrollToSection = (id, behavior = 'smooth') => {
    const el = document.querySelector(id);
    if (!el) return false;

    const sectionInsets = {
      '#skills': 72,
      '#projects': 72
    };
    const sectionInset = sectionInsets[id] ?? (id === '#home' ? 0 : 2);
    const targetTop = el.getBoundingClientRect().top + window.pageYOffset + sectionInset;
    window.scrollTo({ top: targetTop, behavior });
    return true;
  };

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;
      if (scrollToSection(id)) {
        e.preventDefault();
        history.pushState(null, '', id);
      }
    });
  });

  if (window.location.hash) {
    setTimeout(() => {
      scrollToSection(window.location.hash, 'auto');
    }, 0);
  }

  window.addEventListener('hashchange', () => {
    if (window.location.hash) {
      scrollToSection(window.location.hash, 'auto');
    }
  });

  // Theme toggle with localStorage
  const themeBtn = document.querySelector('.theme-toggle');

  // Function to set theme
  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeBtn) {
      const nextLabel = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
      themeBtn.innerHTML = theme === 'dark'
        ? '<i class="fas fa-sun" aria-hidden="true"></i>'
        : '<i class="fas fa-moon" aria-hidden="true"></i>';
      themeBtn.setAttribute('aria-label', nextLabel);
      themeBtn.setAttribute('title', nextLabel);
    }
    localStorage.setItem('theme', theme);
  };

  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');

  // Set initial theme
  setTheme(initialTheme);

  // Toggle theme on button click
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }

  // Scroll reveal
  const revealItems = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        } else {
          entry.target.classList.remove('visible');
        }
      });
    });

    revealItems.forEach((el) => {
      el.classList.add('reveal-pending');
      observer.observe(el);
    });
  } else {
    revealItems.forEach((el) => el.classList.add('visible'));
  }

  // Typing effect
  const typingEl = document.querySelector('.typing');
  const phrases = [
    'AI-Assisted Full-Stack Web Developer',
    'Next.js | React | TypeScript | Tailwind CSS',
    'Supabase | PostgreSQL | Auth | CRUD workflows',
    'Building Event Core: hall & event management SaaS',
    'Playwright testing | Git/GitHub | Vercel | Netlify',
    'ChatGPT | Codex | Claude | Base44 — validated by hand',
    'BSIT Graduate | Open to full-stack & frontend roles'
  ];
  let i = 0, j = 0, deleting = false;
  const speed = { type: 40, erase: 20, delay: 1200 };
  function tick() {
    if (!typingEl) return;
    const current = phrases[i];
    if (!deleting) {
      typingEl.textContent = current.slice(0, j++);
      if (j > current.length) {
        deleting = true;
        setTimeout(tick, speed.delay);
        return;
      }
    } else {
      typingEl.textContent = current.slice(0, j--);
      if (j < 0) {
        deleting = false; i = (i + 1) % phrases.length; j = 0;
      }
    }
    setTimeout(tick, deleting ? speed.erase : speed.type);
  }
  if (typingEl) { tick(); }
  // Scroll-triggered animations using Intersection Observer
  const initScrollAnimations = () => {
    const aboutSection = document.getElementById('about');
    if (!aboutSection) return;

    // Track if we've already handled the initial load
    let initialLoadHandled = false;

    // Function to run the animation
    const runAnimation = () => {
      const aboutCopy = aboutSection.querySelector('.about-copy');
      const slideIns = aboutSection.querySelectorAll('.slide-in');

      // Reset all animations first
      slideIns.forEach(el => {
        el.style.transition = 'none';
        el.classList.remove('visible');
        void el.offsetHeight; // Force reflow
        el.style.transition = 'opacity 0.5s ease-out, transform 0.8s ease-out';
      });

      if (aboutCopy) {
        aboutCopy.style.transition = 'none';
        aboutCopy.classList.remove('visible');
        void aboutCopy.offsetHeight; // Force reflow
        aboutCopy.style.transition = 'opacity 0.5s ease-out, transform 0.8s ease-out';
        aboutCopy.classList.add('visible');
      }

      // Add visible class to each slide-in element with delay
      slideIns.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add('visible');
        }, index * 200);
      });
    };

    // Function to handle the intersection
    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Only run if this is not the initial load or if we haven't handled initial load yet
          if (!initialLoadHandled) {
            initialLoadHandled = true;
            runAnimation();
          }
        } else if (entry.boundingClientRect.top > 0) {
          // Only reset when scrolling up past the section
          initialLoadHandled = false;
        }
      });
    };

    // Create observer with the handler
    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.2, // Trigger when 20% of the element is visible
      rootMargin: '0px 0px -100px 0px' // Slight offset for better timing
    });

    // Start observing the about section
    observer.observe(aboutSection);

    // Check if we should run the animation immediately on page load
    const checkInitialView = () => {
      const rect = aboutSection.getBoundingClientRect();
      const isInView = (
        rect.top <= (window.innerHeight * 0.8) &&
        rect.bottom >= (window.innerHeight * 0.2)
      );

      if (isInView) {
        initialLoadHandled = true;
        runAnimation();
      }
    };
    // Run initial check after a short delay to allow for page load
    setTimeout(checkInitialView, 100);
  };

  // Initialize animations when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initializeApp();
    });
  } else {
    initializeApp();
  }

  function initializeApp() {
    // Initialize EmailJS only when its CDN script is available and configured.
    const hasEmailJsConfig = (
      "YOUR_PUBLIC_KEY" !== "YOUR_PUBLIC_KEY" &&
      "YOUR_SERVICE_ID" !== "YOUR_SERVICE_ID" &&
      "YOUR_TEMPLATE_ID" !== "YOUR_TEMPLATE_ID"
    );
    if (window.emailjs && hasEmailJsConfig) {
      window.emailjs.init("YOUR_PUBLIC_KEY");
    }

    // Initialize animations and contact form
    initScrollAnimations();
    if (hasEmailJsConfig) {
      initContactForm();
    }

    // Make sure all sections are visible
    document.querySelectorAll('section').forEach(section => {
      section.style.display = 'block';
    });
  }

  // Re-initialize on window resize in case of layout changes
  window.addEventListener('resize', initScrollAnimations);

  // Contact Form Handling
  function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    // Create and append status message element
    const statusMessage = document.createElement('div');
    statusMessage.className = 'form-status';
    contactForm.appendChild(statusMessage);

    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      // Simple validation
      if (!data.from_name || !data.from_email || !data.subject || !data.message) {
        showStatus('Please fill in all required fields', 'error');
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.from_email)) {
        showStatus('Please enter a valid email address', 'error');
        return;
      }

      // Disable submit button and show loading state
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalBtnText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span>Sending...</span>';

      try {
        // Send email using EmailJS
        await window.emailjs.send(
          'YOUR_SERVICE_ID', // Replace with your EmailJS service ID
          'YOUR_TEMPLATE_ID', // Replace with your EmailJS template ID
          data
        );

        // Show success message
        showStatus('Message sent successfully! I\'ll get back to you soon.', 'success');

        // Reset form
        contactForm.reset();
      } catch (error) {
        console.error('Error sending email:', error);
        showStatus('There was an error sending your message. Please try again later.', 'error');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
      }
    });

    function showStatus(message, type) {
      const statusEl = contactForm.querySelector('.form-status');
      if (!statusEl) return;

      // Clear previous classes and set new ones
      statusEl.className = 'form-status';
      statusEl.classList.add(type);
      statusEl.textContent = message;

      // Auto-hide after 5 seconds
      clearTimeout(statusEl.timeout);
      statusEl.timeout = setTimeout(() => {
        statusEl.className = 'form-status';
        statusEl.textContent = '';
      }, 5000);
    }
  }

  // Flip-card click/tap + keyboard support
  document.querySelectorAll('.flip-card').forEach(card => {
    const toggle = () => {
      const isFlipped = card.classList.toggle('flipped');
      card.setAttribute('aria-pressed', String(isFlipped));
    };
    card.addEventListener('click', (e) => {
      // Avoid double triggering from inner elements
      if (!(e.target instanceof HTMLAnchorElement)) toggle();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });
  });
});

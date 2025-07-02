document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons();
      console.log('Lucide icons initialized successfully.');
    } catch (e) {
      console.warn('Failed to initialize Lucide icons:', e.message);
    }
  } else {
    console.warn('Lucide icons library not loaded. Check CDN inclusion.');
  }

  // Debounce Utility
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Wait for Element Utility
  const waitForElement = (selector, callback, maxAttempts = 10, interval = 500) => {
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (document.querySelector(selector)) {
        clearInterval(intervalId);
        callback();
      } else if (attempts++ >= maxAttempts) {
        clearInterval(intervalId);
        console.warn(`Element ${selector} not found after ${maxAttempts} attempts.`);
      }
    }, interval);
  };

  // Conditional Logging for Development
  const isDev = window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1');
  const logWarn = (message) => {
    if (isDev) console.warn(message);
  };

  // Mobile Menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = mobileNav?.querySelectorAll('a') || [];

  const updateFocusableElements = () => {
    return mobileNav?.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])') || [];
  };

  const toggleMobileMenu = debounce((open) => {
    if (!mobileNav || !mobileNavOverlay || !hamburger || !mobileMenuBtn) {
      logWarn('Mobile menu elements missing (mobile-nav, mobile-nav-overlay, hamburger, or mobile-menu-btn).');
      return;
    }
    mobileNav.classList.toggle('open', open);
    mobileNavOverlay.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    mobileMenuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : 'auto';
    if (open) {
      const focusableElements = updateFocusableElements();
      if (focusableElements.length) focusableElements[0].focus();
    } else {
      mobileMenuBtn.focus();
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'mobile_menu_toggle',
      state: open ? 'open' : 'closed'
    });
  }, 100);

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(!mobileNav.classList.contains('open')));
    mobileMenuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu(!mobileNav.classList.contains('open'));
      }
    });
  } else {
    logWarn('Mobile menu button (.mobile-menu-btn) not found.');
  }

  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', () => toggleMobileMenu(false));
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => toggleMobileMenu(false));
    mobileNavClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu(false);
      } else if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        navLinks[0]?.focus();
      }
    });
  }

  navLinks.forEach((link, index) => {
    link.addEventListener('click', () => {
      toggleMobileMenu(false);
      window.dataLayer.push({
        event: 'nav_click',
        link_text: link.textContent.trim(),
        link_url: link.href
      });
    });
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = link.href;
        toggleMobileMenu(false);
      } else if (e.key === 'Tab') {
        if (index === navLinks.length - 1 && !e.shiftKey) {
          e.preventDefault();
          mobileNavClose?.focus();
        } else if (index === 0 && e.shiftKey) {
          e.preventDefault();
          mobileNavClose?.focus();
        }
      } else if (e.key === 'Escape') {
        toggleMobileMenu(false);
        mobileMenuBtn?.focus();
      }
    });
  });

  // Focus Trapping in Mobile Nav
  const focusableElements = mobileNav?.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])') || [];
  if (focusableElements.length) {
    mobileNav.addEventListener('keydown', (e) => {
      const firstFocusable = focusableElements[0];
      const lastFocusable = focusableElements[focusableElements.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        } else if (!e.shiftKey && document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    });
  }

  // Navigation Shadow on Scroll
  let lastScrollY = window.scrollY;
  const updateNavShadow = debounce(() => {
    const scrollY = window.scrollY;
    const direction = scrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = scrollY;
    const nav = document.querySelector('nav');
    if (nav) {
      nav.classList.toggle('scrolled', scrollY > 50);
    }
  }, 10);

  window.addEventListener('scroll', updateNavShadow);
  window.addEventListener('resize', updateNavShadow);
  updateNavShadow();

  // Newsletter Subscription with EmailJS
  window.subscribeNewsletter = function () {
    const emailInput = document.getElementById('newsletter-email');
    const message = document.getElementById('newsletter-message');
    const submitBtn = document.querySelector('.newsletter-button');
    const CONFIG = {
      emailjs: {
        userId: 'JQ8fQ2l-QXWp78b7U',
        serviceId: 'service_p4dfeu6',
        newsletterTemplateId: 'template_g6wz49w'
      },
      rateLimitInterval: 5000,
      classes: {
        hidden: 'hidden'
      }
    };

    if (!emailInput || !message) {
      console.warn('Newsletter form elements missing: #newsletter-email or #newsletter-message');
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'newsletter_error',
          error: 'missing_elements'
        });
      }
      return;
    }

    if (typeof emailjs === 'undefined') {
      console.error('EmailJS SDK v3 not loaded. Check CDN inclusion.');
      submitBtn.disabled = true;
      message.classList.remove(CONFIG.classes.hidden);
      message.innerHTML = '<span class="text-red-600">Error: Unable to load email service. Please try again later.</span>';
      return;
    }

    try {
      emailjs.init(CONFIG.emailjs.userId);
      console.log('EmailJS SDK v3 initialized with user ID:', CONFIG.emailjs.userId);
    } catch (error) {
      console.error('Failed to initialize EmailJS SDK v3:', error.message);
      submitBtn.disabled = true;
      message.classList.remove(CONFIG.classes.hidden);
      message.innerHTML = '<span class="text-red-600">Error: Unable to initialize email service. Please try again later.</span>';
      console.warn('EmailJS SDK v3 initialization failed. Verify user ID and SDK version.');
      return;
    }

    const currentTime = Date.now();
    let lastNewsletterSubmitTime = parseInt(localStorage.getItem('lastNewsletterSubmitTime') || '0', 10);

    if (currentTime - lastNewsletterSubmitTime < CONFIG.rateLimitInterval) {
      message.textContent = 'Please wait a few seconds before subscribing again.';
      message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
      message.classList.add('text-red-600');
      setTimeout(() => {
        message.classList.add(CONFIG.classes.hidden);
        message.textContent = '';
      }, CONFIG.rateLimitInterval);
      return;
    }

    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = 'Please enter a valid email address.';
      message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
      message.classList.add('text-red-600');
      emailInput.focus();
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'newsletter_error',
          error: 'invalid_email'
        });
      }
      return;
    }

    message.textContent = 'Subscribing...';
    message.classList.remove(CONFIG.classes.hidden, 'text-red-600', 'text-green-600');

    emailjs
      .send(CONFIG.emailjs.serviceId, CONFIG.emailjs.newsletterTemplateId, { email })
      .then((response) => {
        console.log('Newsletter subscription successful:', response.status, response.text);
        message.textContent = 'Thank you for subscribing to our global insights!';
        message.classList.add('text-green-600');
        emailInput.value = '';
        lastNewsletterSubmitTime = Date.now();
        localStorage.setItem('lastNewsletterSubmitTime', lastNewsletterSubmitTime.toString());
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'newsletter_subscription',
            email_subscribed: true
          });
        }
      })
      .catch((error) => {
        console.error('Newsletter subscription error:', {
          message: error.message,
          status: error.status,
          text: error.text
        });
        message.textContent = 'Failed to subscribe. Please check your email or try again later.';
        message.classList.add('text-red-600');
        if (window.dataLayer) {
          window.dataLayer.push({
            event: 'newsletter_error',
            error: 'subscription_failed',
            details: error.message || 'Unknown error'
          });
        }
      });
  };

  // Animation Observer
  const animateElements = document.querySelectorAll('.animate-slide-up, .animate-fade-in');
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.animationDelay = el.dataset.delay || '0s';
        el.classList.add('animated');
        animationObserver.unobserve(el);
      }
    });
  }, { rootMargin: '0px 0px -50px 0px' });

  animateElements.forEach(el => animationObserver.observe(el));

  // Share Buttons Tracking
  const shareButtons = document.querySelectorAll('.share-buttons a');
  shareButtons.forEach(button => {
    button.addEventListener('click', () => {
      window.dataLayer.push({
        event: 'share_click',
        platform: button.getAttribute('aria-label').replace('Share on ', ''),
        url: button.href
      });
    });
  });

  // Lazy Load Images
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      });
    }, { rootMargin: '0px 0px 200px 0px' });
    lazyImages.forEach(img => imageObserver.observe(img));
  } else {
    lazyImages.forEach(img => {
      img.src = img.dataset.src || img.src;
      img.removeAttribute('data-src');
    });
  }
});

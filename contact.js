document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded. Initializing contact form and mobile navigation...');

  // Warn about deprecated EmailJS SDK v3
  console.warn('Using EmailJS SDK v3, which is deprecated and insecure. Consider upgrading to SDK v4: https://www.emailjs.com/docs/sdk/installation/');

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

  // Wait for EmailJS Utility
  const waitForEmailJS = (callback, maxAttempts = 10, interval = 500) => {
    let attempts = 0;
    const intervalId = setInterval(() => {
      if (typeof emailjs !== 'undefined') {
        clearInterval(intervalId);
        console.log('EmailJS SDK v3 loaded successfully.');
        callback();
      } else if (attempts++ >= maxAttempts) {
        clearInterval(intervalId);
        console.warn('EmailJS SDK v3 not loaded after maximum attempts. Check CDN or network.');
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
  if (mobileNav) {
    mobileNav.addEventListener('keydown', (e) => {
      const focusableElements = updateFocusableElements();
      if (focusableElements.length) {
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
      }
    });
  }

  // Contact Form with EmailJS
  function initContactForm() {
    const elements = {
      contactForm: document.getElementById('contact-form'),
      submitBtn: document.getElementById('submit-btn'),
      btnText: document.getElementById('btn-text'),
      btnSpinner: document.getElementById('btn-spinner'),
      formSuccess: document.getElementById('form-success'),
      formInputs: {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        company: document.getElementById('company'),
        message: document.getElementById('message')
      },
      errorElements: {
        name: document.getElementById('name-error'),
        email: document.getElementById('email-error'),
        phone: document.getElementById('phone-error'),
        company: document.getElementById('company-error'),
        message: document.getElementById('message-error')
      }
    };

    // Validate required elements
    if (!elements.contactForm) {
      logWarn('Contact form (#contact-form) not found on this page.');
      return;
    }

    const missingElements = [];
    if (!elements.submitBtn) missingElements.push('#submit-btn');
    if (!elements.btnText) missingElements.push('#btn-text');
    if (!elements.btnSpinner) missingElements.push('#btn-spinner');
    if (!elements.formInputs.email) missingElements.push('#email');
    if (!elements.formSuccess) missingElements.push('#form-success');

    if (missingElements.length) {
      logWarn(`Contact form initialization skipped. Missing elements: ${missingElements.join(', ')}`);
      return;
    }

    const CONFIG = {
      emailjs: {
        userId: 'JQ8fQ2l-QXWp78b7U', // Hardcoded EmailJS user ID
        serviceId: 'service_p4dfeu6',
        contactTemplateId: 'template_nh9ws5m'
      },
      form: {
        rateLimitInterval: 5000,
        maxLengths: {
          name: 100,
          email: 100,
          phone: 20,
          company: 100,
          message: 1000
        }
      },
      classes: {
        hidden: 'hidden'
      }
    };

    const sanitizeInput = (input) => {
      if (!input) return '';
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML.replace(/</g, '<').replace(/>/g, '>');
    };

    waitForEmailJS(() => {
      if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK v3 not loaded. Check CDN inclusion.');
        elements.submitBtn.disabled = true;
        elements.formSuccess.classList.remove(CONFIG.classes.hidden);
        elements.formSuccess.innerHTML = '<span class="text-red-600">Error: Unable to load email service. Please try again later.</span>';
        return;
      }

      try {
        emailjs.init(CONFIG.emailjs.userId);
        console.log('EmailJS SDK v3 initialized with user ID:', CONFIG.emailjs.userId);
      } catch (error) {
        console.error('Failed to initialize EmailJS SDK v3:', error.message);
        elements.submitBtn.disabled = true;
        elements.formSuccess.classList.remove(CONFIG.classes.hidden);
        elements.formSuccess.innerHTML = '<span class="text-red-600">Error: Unable to initialize email service. Please try again later.</span>';
        logWarn('EmailJS SDK v3 initialization failed. Verify user ID and SDK version.');
        return;
      }

      let lastSubmitTime = parseInt(localStorage.getItem('lastSubmitTime') || '0', 10);

      const showError = (field, message) => {
        if (elements.errorElements[field]) {
          elements.errorElements[field].textContent = message;
          elements.errorElements[field].classList.remove(CONFIG.classes.hidden);
          elements.formInputs[field].setAttribute('aria-invalid', 'true');
        }
      };

      const clearErrors = () => {
        Object.keys(elements.errorElements).forEach((field) => {
          if (elements.errorElements[field]) {
            elements.errorElements[field].classList.add(CONFIG.classes.hidden);
            elements.errorElements[field].textContent = '';
            elements.formInputs[field].setAttribute('aria-invalid', 'false');
          }
        });
      };

      elements.contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const currentTime = Date.now();
        if (currentTime - lastSubmitTime < CONFIG.form.rateLimitInterval) {
          alert('Please wait a few seconds before submitting again.');
          return;
        }

        const inputs = {
          name: elements.formInputs.name?.value?.trim() || '',
          email: elements.formInputs.email?.value?.trim() || '',
          phone: elements.formInputs.phone?.value?.trim() || '',
          company: elements.formInputs.company?.value?.trim() || '',
          message: elements.formInputs.message?.value?.trim() || ''
        };

        let hasError = false;

        if (!inputs.name) {
          showError('name', 'Full name is required.');
          hasError = true;
        }
        if (!inputs.email) {
          showError('email', 'Email is required.');
          hasError = true;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputs.email)) {
          showError('email', 'Please enter a valid email address.');
          hasError = true;
        }
        if (inputs.phone && !/^\+?\d{10,15}$/.test(inputs.phone)) {
          showError('phone', 'Please enter a valid phone number.');
          hasError = true;
        }
        if (!inputs.message) {
          showError('message', 'Message is required.');
          hasError = true;
        }
        if (
          inputs.name.length > CONFIG.form.maxLengths.name ||
          inputs.email.length > CONFIG.form.maxLengths.email ||
          inputs.phone.length > CONFIG.form.maxLengths.phone ||
          inputs.company.length > CONFIG.form.maxLengths.company ||
          inputs.message.length > CONFIG.form.maxLengths.message
        ) {
          alert('One or more inputs exceed maximum length.');
          hasError = true;
        }

        if (hasError) {
          const firstErrorField = Object.keys(inputs).find(
            (key) => elements.errorElements[key] && !elements.errorElements[key].classList.contains(CONFIG.classes.hidden)
          );
          elements.formInputs[firstErrorField]?.focus();
          return;
        }

        const formData = {
          name: sanitizeInput(inputs.name) || 'Not provided',
          email: sanitizeInput(inputs.email),
          phone: sanitizeInput(inputs.phone) || 'Not provided',
          company: sanitizeInput(inputs.company) || 'Not provided',
          message: sanitizeInput(inputs.message) || 'Not provided'
        };

        elements.submitBtn.disabled = true;
        elements.btnText.textContent = 'Sending...';
        elements.btnSpinner.classList.remove(CONFIG.classes.hidden);
        elements.formSuccess.classList.add(CONFIG.classes.hidden);

        try {
          const response = await emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.contactTemplateId, formData);
          console.log('Email sent successfully!', response.status, response.text);
          elements.formSuccess.classList.remove(CONFIG.classes.hidden);
          elements.formSuccess.focus();
          elements.contactForm.reset();
          lastSubmitTime = Date.now();
          localStorage.setItem('lastSubmitTime', lastSubmitTime.toString());
          window.dataLayer.push({
            event: 'contact_form_submission',
            status: 'success'
          });
          setTimeout(() => {
            fetch('/thanku.html', { method: 'HEAD' })
              .then((response) => {
                if (response.ok) {
                  window.location.href = '/thanku.html';
                } else {
                  console.warn('Thank you page not found, staying on current page.');
                  elements.formSuccess.innerHTML = '<span class="text-emerald-800">Your message was sent! Please check your email for confirmation.</span>';
                }
              })
              .catch(() => {
                console.warn('Failed to verify thank you page.');
                elements.formSuccess.innerHTML = '<span class="text-emerald-800">Your message was sent! Please check your email for confirmation.</span>';
              });
          }, 3000);
        } catch (error) {
          console.error('Failed to send email:', {
            message: error.message,
            status: error.status,
            text: error.text
          });
          elements.formSuccess.classList.remove(CONFIG.classes.hidden);
          elements.formSuccess.innerHTML = '<span class="text-red-600">Failed to send your message. Please check your email address or try again later.</span>';
          elements.formSuccess.focus();
          window.dataLayer.push({
            event: 'contact_form_submission',
            status: 'failed',
            error: error.message || 'Unknown error'
          });
        } finally {
          elements.submitBtn.disabled = false;
          elements.btnText.textContent = 'Send Message';
          elements.btnSpinner.classList.add(CONFIG.classes.hidden);
        }
      });
    });
  }

  // Newsletter Subscription with EmailJS
  window.subscribeNewsletter = function () {
    const emailInput = document.getElementById('newsletter-email');
    const message = document.getElementById('newsletter-message');
    const CONFIG = {
      emailjs: {
        serviceId: 'service_p4dfeu6',
        newsletterTemplateId: 'template_g6wz49w'
      },
      rateLimitInterval: 5000,
      classes: {
        hidden: 'hidden'
      }
    };

    let lastNewsletterSubmitTime = parseInt(localStorage.getItem('lastNewsletterSubmitTime') || '0', 10);

    if (!emailInput || !message) {
      logWarn('Newsletter form elements missing: #newsletter-email or #newsletter-message');
      window.dataLayer.push({
        event: 'newsletter_error',
        error: 'missing_elements'
      });
      return;
    }

    if (typeof emailjs === 'undefined') {
      message.textContent = 'Error: Email service unavailable. Please try again later.';
      message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
      message.classList.add('text-red-600');
      return;
    }

    const currentTime = Date.now();
    if (currentTime - lastNewsletterSubmitTime < CONFIG.rateLimitInterval) {
      message.textContent = 'Please wait a few seconds before subscribing again.';
      message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
      message.classList.add('text-red-600');
      return;
    }

    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = 'Please enter a valid email address.';
      message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
      message.classList.add('text-red-600');
      emailInput.focus();
      window.dataLayer.push({
        event: 'newsletter_error',
        error: 'invalid_email'
      });
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
        window.dataLayer.push({
          event: 'newsletter_subscription',
          email_subscribed: true
        });
      })
      .catch((error) => {
        console.error('Newsletter subscription error:', {
          message: error.message,
          status: error.status,
          text: error.text
        });
        message.textContent = 'Failed to subscribe. Please check your email or try again later.';
        message.classList.add('text-red-600');
        window.dataLayer.push({
          event: 'newsletter_error',
          error: 'subscription_failed',
          details: error.message || 'Unknown error'
        });
      });
  };

  // Lazy Load Images
  const lazyImages = document.querySelectorAll('img[loading="lazy"]');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: '0px 0px 200px 0px' }
    );
    lazyImages.forEach((img) => imageObserver.observe(img));
  } else {
    lazyImages.forEach((img) => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }

  // Initialize Forms with Delay
  waitForElement('#contact-form', initContactForm);
});
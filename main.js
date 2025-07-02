 document.addEventListener('DOMContentLoaded', () => {
      // Configuration
      const CONFIG = {
        selectors: {
          modal: '#service-modal',
          modalTitle: '#modal-title',
          modalDescription: '#modal-description',
          closeModal: '#close-modal',
          exploreLinks: '[data-service]',
          counters: '.counter',
          contactForm: '#contact-form',
          submitBtn: '#submit-btn',
          btnText: '#btn-text',
          btnSpinner: '#btn-spinner',
          formInputs: {
            name: '#name',
            email: '#email',
            phone: '#phone',
            message: '#message',
          },
        },
        classes: {
          hidden: 'hidden',
          noScroll: 'no-scroll',
        },
        form: {
          rateLimitInterval: 30000,
          maxLengths: {
            name: 100,
            email: 100,
            phone: 20,
            message: 1000,
          },
        },
      };

      // Cache DOM elements with null checks
      const elements = Object.fromEntries(
        Object.entries(CONFIG.selectors).map(([key, selector]) => [
          key,
          key === 'exploreLinks' || key === 'counters'
            ? document.querySelectorAll(selector)
            : key === 'formInputs'
            ? Object.fromEntries(
                Object.entries(selector).map(([inputKey, inputSelector]) => [
                  inputKey,
                  document.querySelector(inputSelector) || null,
                ])
              )
            : document.querySelector(selector) || null,
        ])
      );

      // Utility: Sanitize input
      const sanitizeInput = (input) => {
        if (typeof input !== 'string') return '';
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML.replace(/[<>]/g, '');
      };

      // Utility: Debounce function
      const debounce = (func, wait) => {
        let timeout;
        return (...args) => {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      };

      // Initialize Lucide icons
      const initLucideIcons = () => {
        try {
          if (typeof lucide !== 'undefined') {
            lucide.createIcons();
          } else {
            console.warn('Lucide library not loaded');
          }
        } catch (error) {
          console.error('Failed to initialize Lucide icons:', error);
        }
      };

      // Service Modal
      const initServiceModal = () => {
        if (!elements.modal || !elements.modalTitle || !elements.modalDescription || !elements.closeModal || !elements.exploreLinks.length) {
          console.warn('Modal elements missing');
          return;
        }

        let trapCleanup = null;
        let lastFocusedElement = null;

        const trapFocus = (element) => {
          const focusable = element.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!focusable.length) return () => {};

          const first = focusable[0];
          const last = focusable[focusable.length - 1];

          const handleKeydown = (e) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              (e.shiftKey && document.activeElement === first ? last : first).focus();
            }
          };

          element.addEventListener('keydown', handleKeydown);
          return () => element.removeEventListener('keydown', handleKeydown);
        };

        const openModal = (title, description) => {
          elements.modalTitle.textContent = sanitizeInput(title) || 'Service';
          elements.modalDescription.textContent = sanitizeInput(description) || 'Contact us to learn more!';
          elements.modal.classList.remove(CONFIG.classes.hidden);
          elements.modal.setAttribute('aria-hidden', 'false');
          document.body.classList.add(CONFIG.classes.noScroll);
          trapCleanup = trapFocus(elements.modal);
          setTimeout(() => elements.closeModal.focus(), 50);
          lastFocusedElement = document.activeElement;
        };

        const closeModal = () => {
          elements.modal.classList.add(CONFIG.classes.hidden);
          elements.modal.setAttribute('aria-hidden', 'true');
          document.body.classList.remove(CONFIG.classes.noScroll);
          trapCleanup?.();
          lastFocusedElement?.focus();
          trapCleanup = lastFocusedElement = null;
        };

        elements.exploreLinks.forEach((link) => {
          link.addEventListener('click', (e) => {
            e.preventDefault();
            const title = link.dataset.service || '';
            const description = link.dataset.description || '';
            openModal(title, description);
          });
        });

        elements.closeModal.addEventListener('click', closeModal);
        elements.modal.addEventListener('click', (e) => {
          if (e.target === elements.modal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
          if (e.key === 'Escape' && !elements.modal.classList.contains(CONFIG.classes.hidden)) {
            closeModal();
          }
        });
      };

      // Counter Animation
      const animateCounter = (element, target, suffix, duration) => {
        try {
          if (!element || isNaN(target)) {
            console.warn('Invalid counter element or target');
            return;
          }
          let start = 0;
          const startTime = performance.now();
          const update = (currentTime) => {
            const elapsed = (currentTime - startTime) / duration;
            const progress = Math.min(elapsed, 1);
            start = progress * target;
            element.textContent = Math.floor(start) + (suffix || '');
            if (progress < 1) requestAnimationFrame(update);
          };
          requestAnimationFrame(update);
        } catch (error) {
          console.error('Counter animation error:', error);
          element.textContent = target + (suffix || '');
        }
      };

      const initCounters = () => {
        if (!elements.counters.length) return;

        if ('IntersectionObserver' in window) {
          const observer = new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (entry.isIntersecting) {
                  const target = parseInt(entry.target.dataset.target) || 0;
                  const suffix = entry.target.dataset.suffix || '';
                  animateCounter(entry.target, target, suffix, 1500);
                  observer.unobserve(entry.target);
                }
              });
            },
            { threshold: 0.5 }
          );
          elements.counters.forEach((counter) => observer.observe(counter));
        } else {
          elements.counters.forEach((counter) => {
            const target = parseInt(counter.dataset.target) || 0;
            const suffix = counter.dataset.suffix || '';
            animateCounter(counter, target, suffix, 1500);
          });
        }
      };

      // Contact Form
      const initContactForm = () => {
        if (!elements.contactForm || !elements.submitBtn || !elements.btnText || !elements.btnSpinner || !elements.formInputs.email) {
          console.warn('Contact form elements missing');
          return;
        }

        try {
          emailjs.init('JQ8fQ2l-QXWp78b7U');
        } catch (error) {
          console.error('EmailJS initialization failed:', error);
          alert('Failed to initialize contact form. Please try again later.');
          return;
        }

        let lastSubmitTime = 0;

        elements.contactForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          try {
            const currentTime = Date.now();
            if (currentTime - lastSubmitTime < CONFIG.form.rateLimitInterval) {
              alert('Please wait 30 seconds before submitting again.');
              return;
            }

            const inputs = {
              name: elements.formInputs.name?.value?.trim() || '',
              email: elements.formInputs.email?.value?.trim() || '',
              phone: elements.formInputs.phone?.value?.trim() || '',
              message: elements.formInputs.message?.value?.trim() || '',
            };

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!inputs.email || !emailRegex.test(inputs.email)) {
              alert('Please enter a valid email address.');
              return;
            }

            if (
              inputs.name.length > CONFIG.form.maxLengths.name ||
              inputs.email.length > CONFIG.form.maxLengths.email ||
              inputs.phone.length > CONFIG.form.maxLengths.phone ||
              inputs.message.length > CONFIG.form.maxLengths.message
            ) {
              alert('One or more inputs exceed maximum length.');
              return;
            }

            const formData = {
              name: sanitizeInput(inputs.name) || 'Not provided',
              email: sanitizeInput(inputs.email),
              phone: sanitizeInput(inputs.phone) || 'Not provided',
              message: sanitizeInput(inputs.message) || 'Not provided',
            };

            elements.submitBtn.disabled = true;
            elements.btnText.textContent = 'Sending...';
            elements.btnSpinner.classList.remove(CONFIG.classes.hidden);

            const response = await emailjs.send('service_p4dfeu6', 'template_nh9ws5m', formData);
            console.log('Email sent successfully:', response.status);
            alert('Thank you for your message! We will get back to you soon.');
            elements.contactForm.reset();
            lastSubmitTime = Date.now();
            window.location.href = '/thanku.html';
          } catch (error) {
            console.error('Failed to send email:', error.message || error);
            alert('Failed to send your message. Please try again later.');
          } finally {
            elements.submitBtn.disabled = false;
            elements.btnText.textContent = 'Send Message';
            elements.btnSpinner.classList.add(CONFIG.classes.hidden);
          }
        });
      };

      // Smooth Scrolling
      const initSmoothScrolling = () => {
        const scrollTo = (targetId) => {
          if (targetId === '#') return;
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }
        };

        const debouncedScroll = debounce(scrollTo, 100);

        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
          anchor.addEventListener('click', (e) => {
            e.preventDefault();
            debouncedScroll(anchor.getAttribute('href'));
          });
        });
      };

      // Initialize
      const initialize = () => {
        try {
          initLucideIcons();
          initServiceModal();
          initCounters();
          initContactForm();
          initSmoothScrolling();
        } catch (error) {
          console.error('Initialization error:', error);
        }
      };

      initialize();
    });

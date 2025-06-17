document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons with error handling
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons();
    } catch (error) {
      console.warn('Failed to initialize Lucide icons:', error.message);
    }
  } else {
    console.warn('Lucide icons library is not loaded. Please check the script inclusion.');
  }

  // Mobile Menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = mobileNav?.querySelectorAll('a') || [];

  const toggleMobileMenu = (open) => {
    if (!mobileNav || !mobileNavOverlay || !hamburger || !mobileMenuBtn) {
      console.warn('Mobile menu elements are missing.');
      return;
    }
    mobileNav.classList.toggle('open', open);
    mobileNavOverlay.classList.toggle('open', open);
    hamburger.classList.toggle('open', open);
    mobileMenuBtn.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : 'auto';
    if (open && navLinks[0]) {
      navLinks[0].focus();
    } else if (mobileMenuBtn) {
      mobileMenuBtn.focus();
    }
  };

  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(!mobileNav.classList.contains('open')));
    mobileMenuBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu(!mobileNav.classList.contains('open'));
      }
    });
  } else {
    console.warn('Mobile menu button not found.');
  }

  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', () => toggleMobileMenu(false));
  } else {
    console.warn('Mobile nav overlay not found.');
  }

  if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => toggleMobileMenu(false));
    mobileNavClose.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleMobileMenu(false);
      }
    });
  } else {
    console.warn('Mobile nav close button not found.');
  }

  navLinks.forEach((link, index) => {
    link.addEventListener('click', () => toggleMobileMenu(false));
    link.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = link.href;
        toggleMobileMenu(false);
      } else if (e.key === 'Tab') {
        if (index === navLinks.length - 1 && !e.shiftKey) {
          e.preventDefault();
          mobileMenuBtn?.focus();
        } else if (index === 0 && e.shiftKey) {
          e.preventDefault();
          mobileNavClose?.focus();
        }
      } else if (e.key === 'Escape') {
        toggleMobileMenu(false);
      }
    });
  });

  // TOC Toggle for Mobile
  const tocToggle = document.querySelector('.toc-toggle');
  const tocContent = document.querySelector('.toc-content');
  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', () => {
      const isOpen = tocContent.classList.contains('open');
      tocContent.classList.toggle('open', !isOpen);
      tocToggle.setAttribute('aria-expanded', !isOpen);
      tocToggle.classList.toggle('open', !isOpen);
      if (typeof lucide !== 'undefined') {
        try {
          lucide.createIcons();
        } catch (error) {
          console.warn('Failed to update Lucide icons for TOC:', error.message);
        }
      }
    });
    tocToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tocToggle.click();
      }
    });
  } else {
    console.warn('TOC toggle or content elements are missing.');
  }

  // FAQ Toggle with Accessibility
  document.querySelectorAll('.faq-item').forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question?.querySelector('i[data-lucide]');
    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        answer.classList.toggle('hidden', isOpen);
        question.setAttribute('aria-expanded', !isOpen);
        if (icon && typeof lucide !== 'undefined') {
          try {
            icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
            lucide.createIcons({ icons: { [icon.getAttribute('data-lucide')]: icon } });
          } catch (error) {
            console.warn('Failed to update Lucide icon for FAQ:', error.message);
          }
        } else if (!icon) {
          console.warn('FAQ icon element is missing for question:', question.textContent);
        }
      });
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        }
      });
    } else {
      console.warn('FAQ question or answer element is missing in FAQ item.');
    }
  });

  // Newsletter Subscription
  window.subscribeNewsletter = (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const message = document.getElementById('newsletter-message');
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailInput || !message) {
      console.warn('Newsletter form elements are missing.');
      return;
    }

    try {
      if (emailInput.value && emailRegex.test(emailInput.value)) {
        message.textContent = 'Thank you for subscribing!';
        message.className = 'text-xs sm:text-sm text-green-400 mt-2';
        emailInput.value = '';
      } else {
        message.textContent = 'Please enter a valid email address.';
        message.className = 'text-xs sm:text-sm text-red-400 mt-2';
      }
      message.classList.remove('hidden');
    } catch (error) {
      message.textContent = 'An error occurred. Please try again.';
      message.className = 'text-xs sm:text-sm text-red-400 mt-2';
      message.classList.remove('hidden');
      console.error('Newsletter subscription error:', error.message);
    }
  };

  const emailInput = document.getElementById('newsletter-email');
  if (emailInput) {
    emailInput.addEventListener('input', (e) => {
      const message = document.getElementById('newsletter-message');
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
      if (e.target.value && !emailRegex.test(e.target.value)) {
        message.textContent = 'Please enter a valid email address.';
        message.className = 'text-xs sm:text-sm text-red-400 mt-2';
        message.classList.remove('hidden');
      } else {
        message.classList.add('hidden');
      }
    });
  } else {
    console.warn('Newsletter email input not found.');
  }

  // Chart.js Initialization
  const chartCanvas = document.getElementById('strategyConversionChart');
  const chartError = document.getElementById('chart-error');
  if (chartCanvas) {
    try {
      if (typeof Chart === 'undefined') {
        throw new Error('Chart.js library is not loaded.');
      }
      const ctx = chartCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get canvas 2D context.');
      }
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['AI Personalization', 'AR/VR Storytelling', 'Zero-Party Data', 'Omnichannel', 'Sustainability'],
          datasets: [{
            label: 'Conversion Rate Increase (%)',
            data: [28, 25, 18, 20, 15],
            backgroundColor: ['#F97316', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'],
            borderColor: ['#C2410C', '#059669', '#2563EB', '#6D28D9', '#DC2626'],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              labels: { color: '#1E293B', font: { size: window.innerWidth < 640 ? 10 : 12 }, usePointStyle: true }
            },
            title: {
              display: true,
              text: 'Conversion Rate Improvements by Strategy (2025)',
              color: '#1E293B',
              font: { size: window.innerWidth < 640 ? 12 : 14, weight: 'bold' },
              padding: { top: 8, bottom: 16 }
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}%`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Conversion Rate Increase (%)', color: '#1E293B', font: { size: window.innerWidth < 640 ? 10 : 12 } },
              ticks: { color: '#1E293B', font: { size: window.innerWidth < 640 ? 10 : 12 }, stepSize: 5 }
            },
            x: {
              title: { display: true, text: 'Strategy', color: '#1E293B', font: { size: window.innerWidth < 640 ? 10 : 12 } },
              ticks: { color: '#1E293B', font: { size: window.innerWidth < 640 ? 8 : 10 }, autoSkip: false, maxRotation: 45, minRotation: 0 }
            }
          },
          animation: {
            duration: 1000,
            easing: 'easeOutQuart'
          },
          ariaLabel: 'Bar chart displaying conversion rate improvements by digital marketing strategy for 2025'
        }
      });
    } catch (error) {
      console.error('Chart initialization failed:', error.message);
      if (chartError) {
        chartError.textContent = 'Failed to load chart. Please check your connection or refresh the page.';
        chartError.classList.remove('hidden');
      }
    }
  } else {
    console.warn('Chart canvas element not found.');
    if (chartError) {
      chartError.textContent = 'Chart element missing. Please contact support.';
      chartError.classList.remove('hidden');
    }
  }

  // Parallax Effect with Enhanced Error Handling
  const parallaxImage = document.querySelector('.parallax-img img');
  if (parallaxImage) {
    if (typeof simpleParallax !== 'undefined') {
      try {
        new simpleParallax(parallaxImage, {
          delay: 0.6,
          scale: 1.2,
          orientation: 'down',
          overflow: true,
          customWrapper: '.parallax-img'
        });
        console.info('Parallax effect initialized successfully.');
      } catch (error) {
        console.warn('Failed to initialize parallax effect:', error.message);
      }
    } else {
      console.warn('simpleParallax.js library is not loaded. Please check the script inclusion.');
      // Fallback: Ensure image is visible without parallax
      parallaxImage.style.transform = 'none';
      parallaxImage.style.opacity = '1';
    }
  } else {
    console.warn('Parallax image element (.parallax-img img) not found.');
  }
});
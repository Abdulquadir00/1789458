document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
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

  // TOC Toggle
  const tocToggle = document.querySelector('.toc-toggle');
  const tocContent = document.querySelector('.toc-content');
  if (tocToggle && tocContent) {
    tocToggle.addEventListener('click', () => {
      const isOpen = tocContent.classList.contains('open');
      tocContent.classList.toggle('open', !isOpen);
      tocToggle.setAttribute('aria-expanded', !isOpen);
      tocToggle.classList.toggle('open', !isOpen);
      const icon = tocToggle.querySelector('i[data-lucide]');
      if (icon && typeof lucide !== 'undefined') {
        icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
        lucide.createIcons({ icons: [icon] });
      }
      window.dataLayer.push({
        event: 'toc_toggle',
        state: !isOpen ? 'open' : 'closed'
      });
    });
    tocToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        tocToggle.click();
      }
    });
  } else {
    console.warn('TOC toggle or content missing.');
  }

  // TOC Scroll Spy
  const tocLinks = document.querySelectorAll('.toc-content a');
  const sections = Array.from(tocLinks).map(link => document.querySelector(link.getAttribute('href')));
  const observerOptions = {
    root: null,
    rootMargin: '-10% 0px -80% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        tocLinks.forEach(link => {
          const isActive = link.getAttribute('href') === `#${id}`;
          link.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => section && observer.observe(section));

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

  // FAQ Accordion
  document.querySelectorAll('.faq-item').forEach((item, index) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const icon = question?.querySelector('i[data-lucide]');
    if (question && answer) {
      question.addEventListener('click', () => {
        const isOpen = !answer.classList.contains('hidden');
        document.querySelectorAll('.faq-answer').forEach(a => a.classList.add('hidden'));
        document.querySelectorAll('.faq-question').forEach(q => {
          q.setAttribute('aria-expanded', 'false');
          const qIcon = q.querySelector('i[data-lucide]');
          if (qIcon && typeof lucide !== 'undefined') {
            qIcon.setAttribute('data-lucide', 'chevron-down');
            lucide.createIcons({ icons: [qIcon] });
          }
        });
        if (!isOpen) {
          answer.classList.remove('hidden');
          question.setAttribute('aria-expanded', 'true');
          if (icon && typeof lucide !== 'undefined') {
            icon.setAttribute('data-lucide', 'chevron-up');
            lucide.createIcons({ icons: [icon] });
          }
        }
        window.dataLayer.push({
          event: 'faq_toggle',
          question: question.textContent.trim(),
          state: !isOpen ? 'open' : 'closed'
        });
      });
      question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          question.click();
        } else if (e.key === 'ArrowDown' && index < document.querySelectorAll('.faq-question').length - 1) {
          e.preventDefault();
          document.querySelectorAll('.faq-question')[index + 1].focus();
        } else if (e.key === 'ArrowUp' && index > 0) {
          e.preventDefault();
          document.querySelectorAll('.faq-question')[index - 1].focus();
        }
      });
    } else {
      console.warn('FAQ question or answer missing.');
    }
  });


// Chart.js Initialization
const chartConfigs = [
  {
    canvasId: 'strategyConversionChart',
    errorId: 'chart-error',
    title: 'Global Conversion Rate Improvements by Strategy (2025)',
    labels: ['AI Personalization', 'AR Experiences', 'Zero-Party Data', 'Cross-Channel', 'Social Commerce'],
    data: [22, 18, 20, 15, 25],
    backgroundColors: [
      'rgba(249, 115, 22, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ],
    borderColors: [
      'rgba(194, 65, 12, 1)',
      'rgba(5, 150, 105, 1)',
      'rgba(37, 99, 235, 1)',
      'rgba(109, 40, 217, 1)',
      'rgba(220, 38, 38, 1)'
    ],
    yAxisMax: 30,
    gtmEvent: 'strategy-conversion'
  },
  {
    canvasId: 'omnichannelConversionChart',
    errorId: 'chart-error',
    title: 'Conversion Rate Improvements by Omnichannel Strategy (2025)',
    labels: ['AI Personalization', 'AR Integration', 'Zero-Party Data', 'Cross-Channel', 'Social Commerce'],
    data: [22, 18, 20, 15, 25],
    backgroundColors: [
      'rgba(249, 115, 22, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ],
    borderColors: [
      'rgba(194, 65, 12, 1)',
      'rgba(5, 150, 105, 1)',
      'rgba(37, 99, 235, 1)',
      'rgba(109, 40, 217, 1)',
      'rgba(220, 38, 38, 1)'
    ],
    yAxisMax: 30,
    gtmEvent: 'omnichannel-conversion'
  },
  {
    canvasId: 'aiToolCostBenefitChart',
    errorId: 'chart-error',
    title: 'Cost-Benefit Analysis of AI Tools for Small Businesses (2025)',
    labels: ['Jasper AI', 'Grammarly', 'Grok', 'HubSpot AI', 'Pictory', 'Zapier', 'Semrush'],
    data: [80, 20, 30, 15, 25, 40, 35],
    backgroundColors: [
      'rgba(249, 115, 22, 0.8)',
      'rgba(16, 185, 129, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(245, 158, 11, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ],
    borderColors: [
      'rgba(194, 65, 12, 1)',
      'rgba(5, 150, 105, 1)',
      'rgba(37, 99, 235, 1)',
      'rgba(109, 40, 217, 1)',
      'rgba(220, 38, 38, 1)',
      'rgba(217, 119, 6, 1)',
      'rgba(21, 128, 61, 1)'
    ],
    yAxisMax: 100,
    gtmEvent: 'ai-tool-cost-benefit'
  },
  {
    canvasId: 'arConversionChart',
    errorId: 'chart-error',
    title: 'Conversion Rate Improvements by AR Marketing Strategy (2025)',
    labels: ['Virtual Try-Ons', 'Interactive Ads', 'In-Store Navigation', 'Product Visualization', 'Gamified AR','AR Loyalty Programs'],
    data: [25, 28, 15, 20, 18, 22],
    backgroundColors: [
      'rgba(16, 185, 129, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)',
      'rgba(34, 197, 94, 0.8)'
    ],
    borderColors: [
      'rgba(5, 150, 105, 1)',
      'rgba(194, 65, 12, 1)',
      'rgba(37, 99, 235, 1)',
      'rgba(109, 40, 217, 1)',
      'rgba(220, 38, 38, 1)',
      'rgba(21, 128, 61, 1)'
    ],
    yAxisMax: 50,
    gtmEvent: 'ar-conversion'
  },
  {
    canvasId: 'greenEngagementChart',
    errorId: 'chart-error',
    title: 'Engagement Rate Improvements by Green Marketing Strategy (2025)',
    labels: ['Blockchain Transparency', 'AI Personalization', 'Circular Economy', 'Carbon Labeling', 'Experiential Campaigns'],
    data: [20, 25, 18, 12, 15],
    backgroundColors: [
      'rgba(16, 185, 129, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(59, 130, 246, 0.8)',
      'rgba(139, 92, 246, 0.8)',
      'rgba(239, 68, 68, 0.8)'
    ],
    borderColors: [
      'rgba(5, 150, 105, 1)',
      'rgba(194, 65, 12, 1)',
      'rgba(37, 99, 235, 1)',
      'rgba(109, 40, 217, 1)',
      'rgba(220, 38, 38, 1)'
    ],
    yAxisMax: 30,
    gtmEvent: 'green-engagement'
  }, 
  {
    canvasId: 'aio-aeo-geo-engagementChart',
    errorId: 'chart-error',
    title: 'Engagement Rate Improvements by AEO and AIO GEO -Targeting Strategies (2025)',
    labels: ['AEO', 'AIO', 'GEO', 'Integrated Approach'],
    data: [25, 20, 22, 28],
    backgroundColors: [
      'rgba(9, 114, 79, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(75, 30, 180, 0.8)',
      'rgba(105, 74, 74, 0.95)'
    ],
    borderColors: [
      'rgb(30, 177, 131)',
      'rgb(213, 77, 24)',
      'rgb(73, 24, 150)',
      'rgb(131, 39, 39)'
    ],
    yAxisMax: 30,
    gtmEvent: 'aeo-aio-geo--engagement'
  }
  , {
    canvasId: 'ai-usage-chart',
    errorId: 'chart-error',
    title: 'Engagement Rate Improvements by Ai-Usage-Targeting Strategies (2025)',
    labels:['Brainstorming', 'Automation', 'Verification'],
    data: [18,20,15],
    backgroundColors: [
      'rgba(9, 114, 79, 0.8)',
      'rgba(249, 115, 22, 0.8)',
      'rgba(75, 30, 180, 0.8)',
     
    ],
    borderColors: [
      'rgb(30, 177, 131)',
      'rgb(213, 77, 24)',
      'rgb(73, 24, 150)',
    
    ],
    yAxisMax: 30,
    gtmEvent: 'ai-usage-engagement'
  }
];

const initChart = (config) => {
  const ctx = document.getElementById(config.canvasId)?.getContext('2d');
  const chartError = document.getElementById(config.errorId);
  if (!ctx) {
    console.warn(`Chart.js: Canvas context not found for ${config.canvasId}.`);
    if (chartError) {
      chartError.classList.remove('hidden');
      chartError.textContent = 'Unable to load chart. Please try again later.';
    }
    return;
  }
  if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
    console.warn('Chart.js or DataLabels plugin not loaded.');
    if (chartError) {
      chartError.classList.remove('hidden');
      chartError.textContent = 'Chart library not loaded. Please check your connection.';
    }
    return;
  }
  try {
    new Chart(ctx, {
      type: 'bar',
      plugins: [ChartDataLabels],
      data: {
        labels: config.labels,
        datasets: [{
          label: 'Benefit Metric (%)',
          data: config.data,
          backgroundColor: config.backgroundColors,
          borderColor: config.borderColors,
          borderWidth: 1,
          borderRadius: 8,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: 'easeOutCubic'
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: config.title,
            font: { size: 18, family: "'Inter', sans-serif", weight: 600 },
            color: '#1E293B',
            padding: { top: 10, bottom: 20 }
          },
          tooltip: {
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            titleFont: { family: "'Inter', sans-serif", size: 14 },
            bodyFont: { family: "'Inter', sans-serif", size: 12 },
            cornerRadius: 6,
            caretSize: 6,
            padding: 8,
            callbacks: {
              label: (context) => `${context.dataset.label}: ${context.raw}%`
            }
          },
          datalabels: {
            anchor: 'end',
            align: 'top',
            formatter: (value) => `${value}%`,
            color: '#1E293B',
            font: { family: "'Inter', sans-serif", weight: 700, size: 14 },
            offset: 4
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: config.yAxisMax,
            grid: {
              color: 'rgba(203, 213, 225, 0.3)',
              borderDash: [4, 4]
            },
            title: {
              display: true,
              text: 'Benefit Metric (%)',
              font: { family: "'Inter', sans-serif", size: 14, weight: 500 },
              color: '#1E293B'
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 12 },
              color: '#64748B',
              callback: (value) => `${value}%`
            }
          },
          x: {
            grid: { display: false },
            title: {
              display: true,
              text: 'AI Tool',
              font: { family: "'Inter', sans-serif", size: 14, weight: 500 },
              color: '#1E293B'
            },
            ticks: {
              font: { family: "'Inter', sans-serif", size: 12 },
              color: '#64748B',
              autoSkip: false,
              maxRotation: 30,
              minRotation: 0
            }
          }
        },
        layout: {
          padding: 20
        }
      }
    });
    console.log(`Chart.js initialized for ${config.canvasId}.`);
    window.dataLayer.push({
      event: 'chart_initialized',
      chart: config.gtmEvent
    });
  } catch (e) {
    console.warn(`Chart.js initialization failed for ${config.canvasId}:`, e.message);
    if (chartError) {
      chartError.classList.remove('hidden');
      chartError.textContent = 'Failed to load chart. Please try again later.';
    }
  }
};

chartConfigs.forEach(config => {
  if (document.getElementById(config.canvasId)) {
    waitForElement(`#${config.canvasId}`, () => initChart(config), 10, 500);
  }
});

document.addEventListener('DOMContentLoaded', () => {
  chartConfigs.forEach(config => {
    if (document.getElementById(config.canvasId)) {
      initChart(config);
    }
  });
});

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

  // Smooth Scroll for TOC Links
  tocLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const offset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
      }
    });
  });
});

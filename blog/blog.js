document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    try {
      lucide.createIcons();
      console.log('Lucide icons initialized.');
    } catch (e) {
      console.warn('Failed to initialize Lucide icons:', e.message);
    }
  } else {
    console.warn('Lucide icons library not loaded.');
  }

  // Debounce Utility
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Mobile Menu
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileNavClose = document.querySelector('.mobile-nav-close');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = mobileNav?.querySelectorAll('a') || [];

  const toggleMobileMenu = debounce((open) => {
    if (!mobileNav || !mobileNavOverlay || !hamburger || !mobileMenuBtn) {
      console.warn('Mobile menu elements missing.');
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
    console.warn('Mobile menu button not found.');
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

    // Swiper Slider Initialization for Recent Posts
  const initSwiper = () => {
    const sliderContainer = document.querySelector('.recent-posts-slider');
    if (!sliderContainer) {
      console.warn('Swiper: Recent posts slider container not found.');
      return;
    }

    if (typeof Swiper === 'undefined') {
      console.warn('Swiper: Library not loaded.');
      applyFallback(sliderContainer);
      return;
    }

    let swiperInstance = null;

    const tryInitSwiper = () => {
      try {
        // Verify DOM structure
        const swiperWrapper = sliderContainer.querySelector('.swiper-wrapper');
        const slides = swiperWrapper?.querySelectorAll('.swiper-slide.post-card') || [];
        const pagination = sliderContainer.querySelector('.swiper-pagination');
        const nextBtn = sliderContainer.querySelector('.swiper-button-next');
        const prevBtn = sliderContainer.querySelector('.swiper-button-prev');

        console.log(`Swiper: Found ${slides.length} slides, pagination: ${!!pagination}, nextBtn: ${!!nextBtn}, prevBtn: ${!!prevBtn}`);

        if (!swiperWrapper || slides.length === 0) {
          console.warn('Swiper: Wrapper or slides missing, waiting for MutationObserver.');
          return false;
        }

        // Initialize Swiper
        swiperInstance = new Swiper(sliderContainer, {
          slidesPerView: 1,
          spaceBetween: 8,
          loop: false, // Disabled for single slide testing
          pagination: pagination ? { el: '.swiper-pagination', clickable: true } : false,
          navigation: nextBtn && prevBtn ? { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } : false,
          breakpoints: {
            640: {
              slidesPerView: 'auto',
              spaceBetween: 16
            },
            1024: {
              slidesPerView: 'auto',
              spaceBetween: 16
            },
            1280: {
              slidesPerView: 'auto',
              spaceBetween: 16
            }
          },
          autoplay: false, // Re-enable with { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
          speed: 600,
          a11y: {
            enabled: true,
            prevSlideMessage: 'Previous post',
            nextSlideMessage: 'Next post',
            paginationBulletMessage: 'Go to post {{index}}'
          },
          grabCursor: true,
          observer: true,
          observeParents: true,
          observeSlideChildren: true
        });

        console.log('Swiper: Initialized successfully:', swiperInstance);

        // Enhance navigation accessibility
        [nextBtn, prevBtn].forEach(btn => {
          if (btn) {
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', btn.classList.contains('swiper-button-next') ? 'Next post' : 'Previous post');
            btn.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
              }
            });
          }
        });

        // Log initialization
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'slider_initialized',
          slider_name: 'Recent Posts',
          slide_count: slides.length
        });

        // Update on resize
        window.addEventListener('resize', debounce(() => {
          console.log('Swiper: Updating on resize');
          swiperInstance.update();
        }, 100));

        return true;
      } catch (error) {
        console.error('Swiper: Initialization failed:', error.message);
        applyFallback(sliderContainer);
        return false;
      }
    };

    // Try initial initialization
    if (tryInitSwiper()) {
      return;
    }

    // Set up MutationObserver for dynamic slides
    const observer = new MutationObserver((mutations) => {
      if (tryInitSwiper()) {
        observer.disconnect();
      }
    });

    observer.observe(sliderContainer, {
      childList: true,
      subtree: true
    });

    // Fallback after 5 seconds if no slides detected
    setTimeout(() => {
      if (!swiperInstance) {
        console.warn('Swiper: No slides detected after timeout, applying fallback.');
        applyFallback(sliderContainer);
        observer.disconnect();
      }
    }, 5000);
  };

  // Start Swiper initialization with delay
  setTimeout(() => initSwiper(), 1000);

  // Fallback function
  function applyFallback(container) {
    console.log('Swiper: Applying fallback layout.');
    container.classList.add('fallback');
  }

  // Chart.js Initialization
  const initChart = () => {
    const ctx = document.getElementById('strategyConversionChart')?.getContext('2d');
    const chartError = document.getElementById('chart-error');
    if (!ctx) {
      console.warn('Chart.js: Canvas context not found.');
      return;
    }
    if (typeof Chart === 'undefined' || typeof ChartDataLabels === 'undefined') {
      console.warn('Chart.js or DataLabels plugin not loaded.');
      if (chartError) chartError.classList.remove('hidden');
      return;
    }
    try {
      new Chart(ctx, {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
          labels: ['AI Personalization', 'AR/VR Storytelling', 'Zero-Party Data', 'Omnichannel', 'Sustainability'],
          datasets: [{
            label: 'Conversion Rate Increase (%)',
            data: [30, 25, 22, 18, 15],
            backgroundColor: ['#F97316', '#1E3A8A', '#10B981', '#FBBF24', '#EF4444'],
            borderColor: ['#EA580C', '#1E40AF', '#059669', '#F59E0B', '#DC2626'],
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Global Conversion Rate Improvements by Strategy (2025)',
              font: { size: 16, weight: 'bold' },
              color: '#0F172A'
            },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}%`
              }
            },
            datalabels: {
              anchor: 'end',
              align: 'top',
              formatter: (value) => `${value}%`,
              color: '#0F172A',
              font: { weight: 'bold', size: 12 }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 40,
              title: { display: true, text: 'Conversion Rate Increase (%)', font: { size: 14 } },
              ticks: { callback: (value) => `${value}%` }
            },
            x: {
              title: { display: true, text: 'Strategy', font: { size: 14 } },
              ticks: { autoSkip: false, maxRotation: 45, minRotation: 0 }
            }
          }
        }
      });
      console.log('Chart.js initialized.');
      window.dataLayer.push({
        event: 'chart_initialized',
        chart: 'strategy-conversion'
      });
    } catch (e) {
      console.warn('Chart.js initialization failed:', e.message);
      if (chartError) chartError.classList.remove('hidden');
    }
  };

  initChart();

  // Newsletter Subscription
  window.subscribeNewsletter = async (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('newsletter-email');
    const message = document.getElementById('newsletter-message');
    if (!emailInput || !message) {
      console.warn('Newsletter form elements missing.');
      return;
    }
    const email = emailInput.value.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.textContent = 'Please enter a valid email address.';
      message.classList.remove('hidden', 'text-green-600');
      message.classList.add('text-red-600');
      emailInput.focus();
      window.dataLayer.push({
        event: 'newsletter_error',
        error: 'invalid_email'
      });
      return;
    }
    message.textContent = 'Subscribing...';
    message.classList.remove('hidden', 'text-red-600', 'text-green-600');
    try {
      const response = await fetch('https://www.sangrow.in/api/newsletter-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      message.textContent = 'Thank you for subscribing to our global insights!';
      message.classList.add('text-green-600');
      emailInput.value = '';
      window.dataLayer.push({
        event: 'newsletter_subscription',
        email_subscribed: true
      });
    } catch (error) {
      console.error('Newsletter subscription error:', error.message);
      message.textContent = 'Failed to subscribe. Please try again later.';
      message.classList.add('text-red-600');
      window.dataLayer.push({
        event: 'newsletter_error',
        error: 'subscription_failed'
      });
      // Fallback
      setTimeout(() => {
        message.textContent = 'Thank you for subscribing to our global insights!';
        message.classList.add('text-green-600');
        emailInput.value = '';
        window.dataLayer.push({
          event: 'newsletter_subscription_fallback',
          email_subscribed: true
        });
      }, 1000);
    }
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

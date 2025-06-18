document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide icons
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

  // Utility: Debounce function
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

  // FAQ Toggle
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
          icon.setAttribute('data-lucide', isOpen ? 'chevron-down' : 'chevron-up');
          lucide.createIcons({ icons: [icon] });
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
        }
      });
    } else {
      console.warn('FAQ question or answer missing.');
    }
  });

  // Chart.js Initialization
  const chartCanvas = document.getElementById('strategyConversionChart');
  const chartError = document.getElementById('chart-error');
  if (chartCanvas) {
    try {
      if (typeof Chart === 'undefined') {
        throw new Error('Chart.js library not loaded.');
      }
      chartCanvas.setAttribute('aria-label', 'Bar chart showing conversion rate improvements by strategy in 2025');
      const ctx = chartCanvas.getContext('2d');
      if (!ctx) {
        throw new Error('Failed to get 2D context for chart canvas.');
      }
      Chart.register(ChartDataLabels);
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['AI Personalization', 'AR/VR Storytelling', 'Zero-Party Data', 'Omnichannel', 'Sustainability'],
          datasets: [{
            label: 'Conversion Rate Increase (%)',
            data: [28, 25, 18, 20, 15],
            backgroundColor: [
              'rgba(249, 115, 22, 0.8)', // --primary
              'rgba(234, 88, 12, 0.8)', // --primary-dark
              'rgba(100, 116, 139, 0.8)', // --gray
              'rgba(51, 65, 85, 0.8)', // --gray-dark
              'rgba(15, 23, 42, 0.8)' // --dark
            ],
            borderColor: [
              'rgba(249, 115, 22, 1)',
              'rgba(234, 88, 12, 1)',
              'rgba(100, 116, 139, 1)',
              'rgba(51, 65, 85, 1)',
              'rgba(15, 23, 42, 1)'
            ],
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: true,
              text: 'Conversion Rate Improvements by Strategy (2025)',
              font: { size: 14, weight: 'bold' },
              color: '#0F172A',
              padding: { top: 10, bottom: 20 }
            },
            datalabels: {
              anchor: 'end',
              align: 'top',
              color: '#0F172A',
              font: { size: 12, weight: 'bold' },
              formatter: (value) => `${value}%`
            },
            tooltip: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.raw}%`
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              max: 40,
              ticks: {
                font: { size: 12 },
                color: '#334155',
                callback: (value) => `${value}%`
              },
              grid: { color: '#E5E7EB' },
              title: {
                display: true,
                text: 'Conversion Rate Increase (%)',
                font: { size: 12 },
                color: '#0F172A'
              }
            },
            x: {
              ticks: {
                font: { size: 12 },
                color: '#334155'
              },
              grid: { display: false }
            }
          }
        }
      });
      window.dataLayer.push({
        event: 'chart_initialized',
        chart_name: 'Strategy Conversion Rates'
      });
    } catch (error) {
      console.error('Chart initialization failed:', error.message);
      if (chartError) {
        chartError.classList.remove('hidden');
      }
    }
  } else {
    console.warn('Chart canvas element not found.');
  }

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

  // Newsletter Subscription
  window.subscribeNewsletter = (event) => {
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
      return;
    }
    message.textContent = 'Subscribing...';
    message.classList.remove('hidden', 'text-red-600', 'text-green-600');
    setTimeout(() => {
      message.textContent = 'Thank you for subscribing!';
      message.classList.add('text-green-600');
      emailInput.value = '';
      window.dataLayer.push({
        event: 'newsletter_subscription',
        email_subscribed: true
      });
    }, 1000);
  };

  // Scroll Progress for TOC Highlighting
  const tocLinks = document.querySelectorAll('.toc a');
  const sections = Array.from(tocLinks).map(link => document.querySelector(link.getAttribute('href')));
  let lastScrollY = window.scrollY;

  const updateScroll = debounce(() => {
    const scrollY = window.scrollY;
    const direction = scrollY > lastScrollY ? 'down' : 'up';
    lastScrollY = scrollY;

    // Highlight active TOC link
    let currentSection = null;
    sections.forEach((section, index) => {
      if (section) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150 && rect.bottom > 0) {
          currentSection = section;
          tocLinks.forEach(link => link.setAttribute('aria-current', 'false'));
          tocLinks[index].setAttribute('aria-current', 'true');
        }
      }
    });

    // Nav shadow
    if (direction === 'down' && scrollY > 100) {
      document.querySelector('nav')?.classList.add('shadow-md');
    } else if (direction === 'up' && scrollY <= 100) {
      document.querySelector('nav')?.classList.remove('shadow-md');
    }
  }, 10);

  window.addEventListener('scroll', updateScroll);
  window.addEventListener('resize', updateScroll);
  updateScroll();

  // Accessibility: Trap focus in mobile nav
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

// Configuration Object
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

    // Utility Functions
    const debounce = (func, wait) => {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
      };
    };

    const logWarn = (message) => {
      if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
        console.warn(message);
      }
    };

    // Blog Post Management
    let allBlogs = [];

    const renderBlogPosts = (blogs) => {
      const blogContainer = document.getElementById('blog-posts');
      const noResults = document.getElementById('no-results');
      blogContainer.innerHTML = '';

      if (blogs.length === 0) {
        noResults.classList.remove(CONFIG.classes.hidden);
        return;
      }

      noResults.classList.add(CONFIG.classes.hidden);
      blogs.forEach(blog => {
        const blogCard = document.createElement('article');
        blogCard.className = 'blog-card bg-white rounded-lg shadow-lg overflow-hidden';
        blogCard.innerHTML = `
          <img src="${blog.imageJpg}" alt="${blog.imageAlt}" class="w-full h-56 object-cover" loading="lazy">
          <div class="p-6">
            <h2 class="text-xl font-semibold mb-2 text-gray-900">${blog.title}</h2>
            <p class="text-gray-600 mb-4 line-clamp-3">${blog.excerpt}</p>
            <p class="text-sm text-gray-500 mb-4">Published: ${new Date(blog.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <a href="${blog.url}" class="text-primary hover:underline font-medium" aria-label="Read more about ${blog.title}">Read More</a>
          </div>
        `;
        blogContainer.appendChild(blogCard);
      });
    };

    const fetchBlogPosts = async () => {
      const blogContainer = document.getElementById('blog-posts');
      const errorMessage = document.getElementById('error-message');

      try {
        const response = await fetch('https://sangrow.in/blog/blog-posts.json');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const blogData = await response.json();

        const uniqueBlogs = [];
        const seenUrls = new Set();
        blogData.forEach(blog => {
          if (!seenUrls.has(blog.url)) {
            uniqueBlogs.push(blog);
            seenUrls.add(blog.url);
          }
        });

        // Sort blogs by datePublished in descending order (latest first)
        uniqueBlogs.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

        allBlogs = uniqueBlogs;
        renderBlogPosts(allBlogs);
        window.dataLayer?.push({ event: 'blog_posts_loaded', total_posts: allBlogs.length });
      } catch (error) {
        console.error('Error fetching blog posts:', error);
        errorMessage.classList.remove(CONFIG.classes.hidden);
        blogContainer.innerHTML = '';
        window.dataLayer?.push({ event: 'blog_posts_error', error: error.message });
      }
    };

    // Search Functionality
    const initializeSearch = () => {
      const searchInput = document.getElementById('search-input');
      if (!searchInput) {
        logWarn('Search input element (#search-input) not found.');
        return;
      }
      searchInput.addEventListener('input', debounce(() => {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const filteredBlogs = allBlogs.filter(blog =>
          blog.title.toLowerCase().includes(searchTerm) ||
          blog.excerpt.toLowerCase().includes(searchTerm)
        );
        // Maintain sorting by datePublished in search results
        filteredBlogs.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
        renderBlogPosts(filteredBlogs);
        window.dataLayer?.push({ event: 'blog_search', search_term: searchTerm, results_count: filteredBlogs.length });
      }, 300));
    };

    // Mobile Menu Functionality
    const initializeMobileMenu = () => {
      const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
      const mobileNav = document.querySelector('.mobile-nav');
      const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
      const mobileNavClose = document.querySelector('.mobile-nav-close');
      const navLinks = mobileNav?.querySelectorAll('a') || [];

      const updateFocusableElements = () => {
        return mobileNav?.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])') || [];
      };

      const toggleMobileMenu = debounce((open) => {
        if (!mobileNav || !mobileNavOverlay || !mobileMenuBtn) {
          logWarn('Mobile menu elements missing.');
          return;
        }
        mobileNav.classList.toggle('open', open);
        mobileNavOverlay.classList.toggle('open', open);
        mobileMenuBtn.setAttribute('aria-expanded', open);
        document.body.style.overflow = open ? 'hidden' : 'auto';
        if (open) {
          const focusableElements = updateFocusableElements();
          if (focusableElements.length) focusableElements[0].focus();
        } else {
          mobileMenuBtn.focus();
        }
        window.dataLayer?.push({ event: 'mobile_menu_toggle', state: open ? 'open' : 'closed' });
      }, 100);

      if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => toggleMobileMenu(!mobileNav.classList.contains('open')));
        mobileMenuBtn.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMobileMenu(!mobileNav.classList.contains('open'));
          }
        });
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
          window.dataLayer?.push({ event: 'nav_click', link_text: link.textContent.trim(), link_url: link.href });
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

      const focusableElements = updateFocusableElements();
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
    };

    // Newsletter Subscription
    window.subscribeNewsletter = () => {
      const emailInput = document.getElementById('newsletter-email');
      const message = document.getElementById('newsletter-message');
      const submitBtn = document.querySelector('.newsletter-button');

      if (!emailInput || !message) {
        logWarn('Newsletter form elements missing.');
        window.dataLayer?.push({ event: 'newsletter_error', error: 'missing_elements' });
        return;
      }

      if (typeof emailjs === 'undefined') {
        console.error('EmailJS SDK not loaded.');
        submitBtn.disabled = true;
        message.classList.remove(CONFIG.classes.hidden);
        message.innerHTML = '<span class="text-red-600">Error: Email service unavailable. Please try again later.</span>';
        window.dataLayer?.push({ event: 'newsletter_error', error: 'emailjs_not_loaded' });
        return;
      }

      try {
        emailjs.init(CONFIG.emailjs.userId);
        console.log('EmailJS initialized.');
      } catch (error) {
        console.error('Failed to initialize EmailJS:', error.message);
        submitBtn.disabled = true;
        message.classList.remove(CONFIG.classes.hidden);
        message.innerHTML = '<span class="text-red-600">Error: Email service initialization failed. Please try again later.</span>';
        window.dataLayer?.push({ event: 'newsletter_error', error: 'emailjs_init_failed' });
        return;
      }

      const currentTime = Date.now();
      let lastNewsletterSubmitTime = parseInt(localStorage.getItem('lastNewsletterSubmitTime') || '0', 10);

      if (currentTime - lastNewsletterSubmitTime < CONFIG.rateLimitInterval) {
        message.textContent = 'Please wait a moment before trying again.';
        message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
        message.classList.add('text-red-600');
        setTimeout(() => {
          message.classList.add(CONFIG.classes.hidden);
          message.textContent = '';
        }, CONFIG.rateLimitInterval);
        window.dataLayer?.push({ event: 'newsletter_error', error: 'rate_limit_exceeded' });
        return;
      }

      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        message.textContent = 'Please enter a valid email address.';
        message.classList.remove(CONFIG.classes.hidden, 'text-green-600');
        message.classList.add('text-red-600');
        emailInput.focus();
        window.dataLayer?.push({ event: 'newsletter_error', error: 'invalid_email' });
        return;
      }

      message.textContent = 'Subscribing...';
      message.classList.remove(CONFIG.classes.hidden, 'text-red-600', 'text-green-600');

      emailjs.send(CONFIG.emailjs.serviceId, CONFIG.emailjs.newsletterTemplateId, { email })
        .then((response) => {
          console.log('Newsletter subscription successful:', response.status);
          message.textContent = 'Thank you for subscribing to Sangrow Insights!';
          message.classList.add('text-green-600');
          emailInput.value = '';
          localStorage.setItem('lastNewsletterSubmitTime', Date.now().toString());
          window.dataLayer?.push({ event: 'newsletter_subscription', email_subscribed: true });
        })
        .catch((error) => {
          console.error('Newsletter subscription error:', error);
          message.textContent = 'Subscription failed. Please verify your email or try again later.';
          message.classList.add('text-red-600');
          window.dataLayer?.push({ event: 'newsletter_error', error: 'subscription_failed', details: error.message || 'Unknown error' });
        });
    };

    // Animation Observer
    const initializeAnimations = () => {
      const animateElements = document.querySelectorAll('.animate-slide-up');
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
    };

    // DOM Content Loaded
    document.addEventListener('DOMContentLoaded', () => {
      // Initialize Lucide Icons
      if (typeof lucide !== 'undefined') {
        try {
          lucide.createIcons();
          console.log('Lucide icons initialized.');
        } catch (e) {
          logWarn('Failed to initialize Lucide icons: ' + e.message);
        }
      } else {
        logWarn('Lucide icons library not loaded.');
      }

      // Initialize Features
      initializeMobileMenu();
      initializeSearch();
      initializeAnimations();
      fetchBlogPosts();
    });
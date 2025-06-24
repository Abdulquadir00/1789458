 // Function to dynamically generate slides
    function populateSlides(posts) {
      const swiperWrapper = document.getElementById('swiper-wrapper');
      if (!swiperWrapper) {
        console.warn('Swiper: Wrapper not found.');
        return;
      }

      swiperWrapper.innerHTML = ''; // Clear existing slides
      if (!Array.isArray(posts) || posts.length === 0) {
        console.warn('No posts available in JSON data.');
        swiperWrapper.innerHTML = '<div class="error-message">No posts available.</div>';
        return;
      }

      // Get current page URL path, normalized
const currentUrl = (window.location.href || '')
  .toLowerCase()
  .replace(/\/$/, ''); // Remove trailing slash

console.log('Current URL:', currentUrl);

// Filter out the current post if on a blog post page
const filteredPosts = (Array.isArray(posts) ? posts : []).filter(post => {
  // Normalize post URL, handling cases where post.url might be undefined or relative
  const postUrl = (post.url || '')
    .toLowerCase()
    .replace(/\/$/, ''); // Remove trailing slash

  // Normalize comparison by extracting pathname for both URLs
  const currentPath = currentUrl.replace(/^https?:\/\/[^\/]+/, ''); // Remove protocol and domain
  const normalizedPostUrl = postUrl.startsWith('http')
    ? postUrl.replace(/^https?:\/\/[^\/]+/, '') // Absolute URL: remove protocol and domain
    : postUrl; // Relative URL: use as is

  const isCurrentPost = normalizedPostUrl && currentPath === normalizedPostUrl;

  if (isCurrentPost) {
    console.log(`Excluding current post: ${post.title || 'Untitled'}, URL: ${postUrl}`);
  }

  return !isCurrentPost;
});

      // Sort posts by datePublished (newest first)
      filteredPosts.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));

      // Log filtered posts for debugging
      console.log('Filtered posts:', filteredPosts);

      if (filteredPosts.length === 0) {
        swiperWrapper.innerHTML = '<div class="error-message">No other recent posts available.</div>';
        return;
      }

      filteredPosts.forEach((post, index) => {
        const slide = document.createElement('div');
        slide.className = 'swiper-slide post-card animate-slide-up';
        slide.style.animationDelay = `${index * 0.1}s`;
        slide.innerHTML = `
          <picture>
            <source srcset="${post.imageWebp || ''}" type="image/webp">
            <img src="${post.imageJpg || 'https://via.placeholder.com/468x200?text=No+Image'}" alt="${post.imageAlt || 'Post image'}" width="468" height="200" sizes="(max-width: 468px) 100vw, 468px" class="w-full h-[200px] object-cover rounded-lg mb-3" loading="lazy">
          </picture>
          <h3 class="font-semibold text-sm lg:text-base">${post.title || 'Untitled'}</h3>
          <p class="date">${new Date(post.datePublished).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
          <p class="excerpt text-sm mt-2">${post.excerpt || 'No excerpt available.'}</p>
          <a href="${post.url || '#'}" class="text-primary hover:underline mt-2 inline-block text-sm" aria-label="Read more about ${post.title || 'this post'}" role="link">Read More</a>
        `;
        swiperWrapper.appendChild(slide);
      });
    }

    // Fetch posts from JSON file
    async function fetchPosts() {
      try {
        // Add cache-busting query parameter to avoid stale JSON
        const response = await fetch(`https://sangrow.in/blog/blog-posts.json?_t=${Date.now()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const posts = await response.json();
        if (!Array.isArray(posts)) {
          throw new Error('Invalid JSON format: Expected an array.');
        }

        // Log all fetched posts for debugging
        console.log('Fetched posts:', posts);

        // Display filtered and sorted posts (excluding current post on blog page)
        populateSlides(posts.slice(0, 6)); // Limit to 6 posts for performance
        setTimeout(() => initSwiper(), 100);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
        const swiperWrapper = document.getElementById('swiper-wrapper');
        if (swiperWrapper) {
          swiperWrapper.innerHTML = '<div class="error-message">Failed to load posts. Please try again later.</div>';
        }
        applyFallback(document.querySelector('.recent-posts-slider'));
      }
    }

    // Debounce utility function
    function debounce(func, wait) {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    }

    // Swiper initialization
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
          const swiperWrapper = sliderContainer.querySelector('.swiper-wrapper');
          const slides = swiperWrapper?.querySelectorAll('.swiper-slide.post-card') || [];
          const pagination = sliderContainer.querySelector('.swiper-pagination');
          const nextBtn = sliderContainer.querySelector('.swiper-button-next');
          const prevBtn = sliderContainer.querySelector('.swiper-button-prev');

          if (!swiperWrapper || slides.length === 0) {
            console.warn('Swiper: Wrapper or slides missing.');
            return false;
          }

          swiperInstance = new Swiper(sliderContainer, {
            slidesPerView: 1,
            spaceBetween: 16,
            centeredSlides: slides.length === 1,
            loop: slides.length > 2,
            pagination: pagination ? { el: '.swiper-pagination', clickable: true } : false,
            navigation: nextBtn && prevBtn ? { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' } : false,
            breakpoints: {
              640: { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 16 },
              1280: { slidesPerView: 3, spaceBetween: 16 }
            },
            autoplay: slides.length > 1 ? { delay: 5000, disableOnInteraction: true } : false,
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

          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({
            event: 'slider_initialized',
            slider_name: 'Recent Posts',
            slide_count: slides.length
          });

          window.addEventListener('resize', debounce(() => {
            swiperInstance.update();
          }, 100));

          return true;
        } catch (error) {
          console.error('Swiper: Initialization failed:', error.message);
          applyFallback(sliderContainer);
          return false;
        }
      };

      if (tryInitSwiper()) {
        return;
      }

      const observer = new MutationObserver((mutations, obs) => {
        if (tryInitSwiper()) {
          obs.disconnect();
        }
      });

      observer.observe(sliderContainer, {
        childList: true,
        subtree: true
      });

      setTimeout(() => {
        if (!swiperInstance) {
          console.warn('Swiper: No slides detected after timeout, applying fallback.');
          applyFallback(sliderContainer);
          observer.disconnect();
        }
      }, 5000);
    };

    function applyFallback(container) {
      console.log('Swiper: Applying fallback layout.');
      if (container) {
        container.classList.add('fallback');
      }
    }

    // Start fetching posts
    fetchPosts();
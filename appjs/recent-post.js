 document.addEventListener('DOMContentLoaded', () => {
      // Function to dynamically generate slides
      function populateSlides(posts) {
        const swiperWrapper = document.getElementById('swiper-wrapper');
        if (!swiperWrapper) {
          console.warn('Swiper: Wrapper not found.');
          return;
        }

        swiperWrapper.innerHTML = ''; // Clear existing content
        if (!Array.isArray(posts) || posts.length === 0) {
          console.warn('No posts available.');
          swiperWrapper.innerHTML = '<div class="error-message">No posts available.</div>';
          return;
        }

        // Get current page URL path, normalized
        const currentUrl = window.location.pathname.toLowerCase().replace(/\/$/, '');

        // Filter out the current post if on a blog post page
        const filteredPosts = posts.filter(post => {
          const postUrl = post.url ? post.url.toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '') : '';
          return postUrl && currentUrl !== postUrl;
        });

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
              <img src="${post.imageJpg || 'https://via.placeholder.com/360x160?text=No+Image'}" alt="${post.imageAlt || 'Post image'}" width="360" height="160" sizes="(max-width: 360px) 100vw, 360px" class="w-full h-[160px] object-cover rounded-lg mb-3" loading="lazy" fetchpriority="low">
            </picture>
            <h3 class="font-semibold text-sm lg:text-base">${post.title || 'Untitled'}</h3>
            <p class="text-sm mt-2">${post.excerpt || 'No excerpt available.'}</p>
            <a href="${post.url || '#'}" class="text-primary hover:underline mt-2 inline-block text-sm" aria-label="Read more about ${post.title || 'this post'}" role="link">Read More</a>
          `;
          swiperWrapper.appendChild(slide);
        });
      }

      // Fetch posts from JSON file
      async function fetchPosts(attempt = 1, maxAttempts = 3) {
        const swiperWrapper = document.getElementById('swiper-wrapper');
        try {
          const response = await fetch(`https://sangrow.in/blog/blog-posts.json?_t=${Date.now()}`);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const posts = await response.json();
          if (!Array.isArray(posts)) throw new Error('Invalid JSON format: Expected an array.');

          console.log('Raw JSON response:', posts); // Debug JSON
          populateSlides(posts.slice(0, 6)); // Limit to 6 posts
          initSwiper();
        } catch (error) {
          console.error(`Fetch attempt ${attempt} failed:`, error);
          if (attempt < maxAttempts) {
            setTimeout(() => fetchPosts(attempt + 1, maxAttempts), 2000);
          } else {
            if (swiperWrapper) {
              swiperWrapper.innerHTML = '<div class="error-message">Failed to load posts after multiple attempts.</div>';
              applyFallback(document.querySelector('.recent-posts-slider'));
            }
          }
        }
      }

      // Debounce utility function
      function debounce(func, wait) {
        let timeout;
        return function (...args) {
          clearTimeout(timeout);
          timeout = setTimeout(() => func(...args), wait);
        };
      }

      // Swiper initialization
      function initSwiper() {
        const sliderContainer = document.querySelector('.recent-posts-slider');
        if (!sliderContainer) {
          console.warn('Swiper: Container not found.');
          return;
        }

        if (typeof Swiper === 'undefined') {
          console.warn('Swiper: Library not loaded.');
          applyFallback(sliderContainer);
          return;
        }

        const swiperWrapper = sliderContainer.querySelector('.swiper-wrapper');
        const slides = swiperWrapper?.querySelectorAll('.swiper-slide.post-card') || [];

        if (!swiperWrapper || slides.length === 0) {
          console.warn('Swiper: No slides found.');
          applyFallback(sliderContainer);
          return;
        }

        const swiper = new Swiper(sliderContainer, {
          slidesPerView: 1,
          spaceBetween: 12,
          centeredSlides: slides.length === 1,
          loop: slides.length > 2,
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          breakpoints: {
            640: { slidesPerView: 2, spaceBetween: 12 },
            768: { slidesPerView: 2, spaceBetween: 12 },
            1024: { slidesPerView: 3, spaceBetween: 12 },
            1280: { slidesPerView: 3, spaceBetween: 12 }
          },
          autoplay: slides.length > 1 ? { delay: 5000, disableOnInteraction: true } : false,
          speed: 600,
          a11y: {
            enabled: true,
            prevSlideMessage: 'Previous post',
            nextSlideMessage: 'Next post',
            paginationBulletMessage: 'Go to post {{index}}'
          },
          grabCursor: true
        });

        // Enhance accessibility for navigation buttons
        ['.swiper-button-prev', '.swiper-button-next'].forEach(selector => {
          const btn = sliderContainer.querySelector(selector);
          if (btn) {
            btn.setAttribute('tabindex', '0');
            btn.setAttribute('role', 'button');
            btn.setAttribute('aria-label', selector.includes('next') ? 'Next post' : 'Previous post');
            btn.addEventListener('keydown', e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                btn.click();
              }
            });
          }
        });

        // Track slider initialization and slide changes
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'slider_initialized',
          slider_name: 'Recent Posts',
          slide_count: slides.length
        });

        swiper.on('slideChange', () => {
          window.dataLayer.push({
            event: 'slider_slide_change',
            slider_name: 'Recent Posts',
            slide_index: swiper.activeIndex
          });
        });

        // Update Swiper on resize
        window.addEventListener('resize', debounce(() => swiper.update(), 100));
      }

      // Apply fallback layout if Swiper fails
      function applyFallback(container) {
        console.log('Applying fallback layout.');
        if (container) container.classList.add('fallback');
      }

      // Start fetching posts
      fetchPosts();
    });

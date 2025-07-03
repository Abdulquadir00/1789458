 document.addEventListener('DOMContentLoaded', () => {
      // Function to format date
      function formatDate(dateString) {
        if (!dateString) {
          console.warn('datePublished missing for a post');
          return 'No date available';
        }
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            console.warn(`Invalid date format: ${dateString}`);
            return 'Invalid date';
          }
          return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        } catch (e) {
          console.warn(`Error parsing date: ${dateString}`, e);
          return 'Invalid date';
        }
      }

      // Fallback post if JSON fetch fails
      const fallbackPost = [{
        title: 'Sample Blog Post',
        datePublished: new Date().toISOString().split('T')[0],
        imageJpg: 'https://via.placeholder.com/360x180?text=Sample+Post',
        imageAlt: 'Sample post image',
        excerpt: 'This is a fallback post displayed when no posts are available.',
        url: '#'
      }];

      // Function to dynamically generate slides
      function populateSlides(posts) {
        const swiperWrapper = document.getElementById('swiper-wrapper');
        if (!swiperWrapper) {
          console.error('Swiper: Wrapper not found.');
          return;
        }

        swiperWrapper.innerHTML = ''; // Clear existing content
        if (!Array.isArray(posts) || posts.length === 0) {
          console.warn('No valid posts provided. Using fallback post.');
          posts = fallbackPost;
        }

        // Get current page URL path, normalized
        const currentUrl = window.location.pathname.toLowerCase().replace(/\/$/, '');
        console.log('Current page URL path:', currentUrl);

        // Filter out the current post if on a blog post page
        let filteredPosts = posts.filter(post => {
          if (!post.url) {
            console.warn('Post missing URL:', post.title);
            return true; // Include posts without URLs
          }
          const postUrl = post.url.toLowerCase().replace(/^https?:\/\/[^\/]+/, '').replace(/\/$/, '');
          console.log(`Comparing post URL: ${postUrl} with current URL: ${currentUrl}`);
          return postUrl !== currentUrl;
        });

        // If filtering removes all posts, use all posts to avoid empty slider
        if (filteredPosts.length === 0) {
          console.warn('No posts remain after filtering. Using all posts.');
          filteredPosts = posts;
        }

        // Map posts to ensure all required fields
        const displayPosts = filteredPosts.map(post => ({
          title: post.title || 'Untitled',
          datePublished: post.datePublished || null,
          imageWebp: post.imageWebp || '',
          imageJpg: post.imageJpg || 'https://via.placeholder.com/360x180?text=No+Image',
          imageAlt: post.imageAlt || 'Post image',
          excerpt: post.excerpt || 'No excerpt available.',
          url: post.url || '#'
        }));

        displayPosts.forEach((post, index) => {
          const slide = document.createElement('div');
          slide.className = 'swiper-slide post-card animate-slide-up';
          slide.style.animationDelay = `${index * 0.1}s`;
          slide.setAttribute('role', 'article');
          slide.setAttribute('aria-labelledby', `post-title-${index}`);
          slide.innerHTML = `
            <picture>
              <source srcset="${post.imageWebp}" type="image/webp">
              <img src="${post.imageJpg}" alt="${post.imageAlt}" width="360" height="180" sizes="(max-width: 360px) 100vw, 360px" class="w-full h-[180px] object-cover rounded-lg mb-4" loading="lazy" fetchpriority="low">
            </picture>
            <h3 id="post-title-${index}" class="font-semibold text-base">${post.title}</h3>
            <p class="date text-sm text-secondary">${formatDate(post.datePublished)}</p>
            <p class="excerpt text-sm">${post.excerpt}</p>
            <a href="${post.url}" class="text-primary hover:underline mt-3 inline-block text-sm" aria-label="Read more about ${post.title}" role="link">Read More</a>
          `;
          swiperWrapper.appendChild(slide);
        });

        console.log(`Populated ${displayPosts.length} slides, first post:`, displayPosts[0]);
      }

      // Fetch posts from JSON file
      async function fetchPosts(attempt = 1, maxAttempts = 3) {
        const swiperWrapper = document.getElementById('swiper-wrapper');
        try {
          console.log(`Attempting to fetch JSON (Attempt ${attempt}) from https://sangrow.in/blog/blog-posts.json`);
          const response = await fetch(`https://sangrow.in/blog/blog-posts.json?_t=${Date.now()}`);
          if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
          const posts = await response.json();
          if (!Array.isArray(posts)) throw new Error('Invalid JSON format: Expected an array.');

          console.log('Raw fetched posts:', posts);

          // Sort posts by datePublished (newest first)
          const sortedPosts = posts.sort((a, b) => {
            const dateA = a.datePublished ? new Date(a.datePublished) : new Date(0);
            const dateB = b.datePublished ? new Date(b.datePublished) : new Date(0);
            return dateB - dateA; // Descending order
          });

          console.log('Sorted posts:', sortedPosts);
          if (sortedPosts.length === 0) {
            console.warn('JSON array is empty. Using fallback post.');
            populateSlides(fallbackPost);
          } else {
            populateSlides(sortedPosts.slice(0, 6)); // Limit to 6 posts
          }
          initSwiper();
        } catch (error) {
          console.error(`Fetch attempt ${attempt} failed:`, error);
          if (attempt < maxAttempts) {
            console.log(`Retrying fetch, attempt ${attempt + 1} of ${maxAttempts}`);
            setTimeout(() => fetchPosts(attempt + 1, maxAttempts), 2000);
          } else {
            console.error('All fetch attempts failed. Using fallback post.');
            if (swiperWrapper) {
              swiperWrapper.innerHTML = '';
              populateSlides(fallbackPost);
              initSwiper();
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
          console.error('Swiper: Container not found.');
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
          spaceBetween: 16,
          centeredSlides: slides.length === 1,
          loop: slides.length > 2,
          pagination: { el: '.swiper-pagination', clickable: true },
          navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
          breakpoints: {
            360: { slidesPerView: 1.2, spaceBetween: 12 },
            480: { slidesPerView: 1.5, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2.5, spaceBetween: 16 },
            1024: { slidesPerView: 3.5, spaceBetween: 16 },
            1280: { slidesPerView: 4, spaceBetween: 16 }
          },
          autoplay: slides.length > 1 ? { delay: 5000, disableOnInteraction: true } : false,
          speed: 800,
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

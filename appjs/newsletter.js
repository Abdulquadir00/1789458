document.addEventListener('DOMContentLoaded', () => {
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
});
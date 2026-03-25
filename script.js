// ---------------------------------------------------------------------------
// Dark Mode - system detection, localStorage persistence, and toggle
// ---------------------------------------------------------------------------

(function initTheme() {
    const STORAGE_KEY = 'baw-theme';
    const LOGO_LIGHT = '/Images/long logo.png';
    const LOGO_DARK = '/white logo.png';

    function getSystemPreference() {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
        return 'light';
    }

    function swapLogos(theme) {
        const src = theme === 'dark' ? LOGO_DARK : LOGO_LIGHT;
        document.querySelectorAll('.logo-horizontal, .footer-logo').forEach(function (img) {
            img.setAttribute('src', src);
        });
        document.querySelectorAll('.mobile-menu-header img').forEach(function (img) {
            img.setAttribute('src', src);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (document.body) {
            swapLogos(theme);
        }
    }

    function getEffectiveTheme() {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') return stored;
        return getSystemPreference();
    }

    applyTheme(getEffectiveTheme());

    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
            if (!localStorage.getItem(STORAGE_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.classList.add('theme-transition');
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
        setTimeout(function () { document.documentElement.classList.remove('theme-transition'); }, 350);
    }

    function bindToggleButtons() {
        document.querySelectorAll('.theme-toggle').forEach(function (btn) {
            btn.addEventListener('click', toggleTheme);
        });
        swapLogos(getEffectiveTheme());
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bindToggleButtons);
    } else {
        bindToggleButtons();
    }
})();

// Mobile Menu Toggle - Initialize immediately and on DOM ready
(function() {
    'use strict';
    const MOBILE_NAV_BREAKPOINT = 1024;
    
    let mobileMenuToggle = null;
    let mainNav = null;
    let headerCtas = null;
    let initialized = false;
    let savedScrollY = 0;

    function reorderPrimaryNavAlphabetically() {
        const navList = document.querySelector('.nav-list');
        if (!navList) return;

        const navItems = Array.from(navList.children).filter(item => item.matches('.nav-item'));
        if (navItems.length < 2) return;

        navItems
            .sort((a, b) => {
                const aLabel = a.querySelector('.nav-link')?.textContent?.trim().toLowerCase() || '';
                const bLabel = b.querySelector('.nav-link')?.textContent?.trim().toLowerCase() || '';
                return aLabel.localeCompare(bLabel);
            })
            .forEach(item => navList.appendChild(item));
    }

    function reorderServicesDisplayOrder() {
        const serviceOrder = ['accounts', 'tax', 'advisory'];
        const serviceRank = { accounts: 0, tax: 1, advisory: 2 };

        const getServiceKey = (text) => {
            const normalized = (text || '').trim().toLowerCase();
            if (normalized.includes('account')) return 'accounts';
            if (normalized.includes('tax')) return 'tax';
            if (normalized.includes('advisory')) return 'advisory';
            return null;
        };

        const reorderContainerItems = (container, items, labelResolver) => {
            if (!container || items.length < 2) return;

            const keyedItems = items.map((item) => ({
                item,
                key: getServiceKey(labelResolver(item))
            }));

            const hasAllServices = serviceOrder.every((key) =>
                keyedItems.some((entry) => entry.key === key)
            );

            if (!hasAllServices) return;

            keyedItems
                .sort((a, b) => serviceRank[a.key] - serviceRank[b.key])
                .forEach((entry) => container.appendChild(entry.item));
        };

        // Mega menu (desktop + mobile): reorder service pillars.
        document.querySelectorAll('.mega-menu-content').forEach((container) => {
            const items = Array.from(container.querySelectorAll(':scope > .mega-menu-pillar'));
            reorderContainerItems(container, items, (item) => item.querySelector('h3')?.textContent || '');
        });

        // Home/service cards: reorder cards if all three services are present.
        document.querySelectorAll('.service-pillars .grid').forEach((container) => {
            const items = Array.from(container.querySelectorAll(':scope > .service-pillar-card'));
            reorderContainerItems(container, items, (item) => item.querySelector('h3')?.textContent || '');
        });

        // Spotlight sections (top-to-bottom order): Accounts, Tax, Advisory.
        const spotlightContainer = document.querySelector('main');
        if (spotlightContainer) {
            const spotlightSections = Array.from(
                spotlightContainer.querySelectorAll(':scope > section.service-spotlight-banner')
            );

            if (spotlightSections.length >= 3) {
                reorderContainerItems(
                    spotlightContainer,
                    spotlightSections,
                    (section) => section.querySelector('.service-banner-content h2')?.textContent || ''
                );
            }
        }
    }
    
    function getElements() {
        if (!mobileMenuToggle) mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        if (!mainNav) mainNav = document.querySelector('.main-nav');
        if (!headerCtas) headerCtas = document.querySelector('.header-ctas');
        return { mobileMenuToggle, mainNav, headerCtas };
    }
    
    function closeMobileMenu() {
        const { mainNav, headerCtas, mobileMenuToggle } = getElements();
        if (mainNav) mainNav.classList.remove('mobile-nav-open');
        if (headerCtas) headerCtas.classList.remove('mobile-nav-open');
        if (mobileMenuToggle) mobileMenuToggle.classList.remove('active');
        document.body.classList.remove('menu-open');
        document.documentElement.classList.remove('menu-open');
        document.body.style.top = '';
        if (savedScrollY > 0) {
            window.scrollTo(0, savedScrollY);
            savedScrollY = 0;
        }
    }
    
    function openMobileMenu() {
        const { mainNav, headerCtas, mobileMenuToggle } = getElements();
        if (mainNav) mainNav.classList.add('mobile-nav-open');
        if (headerCtas) headerCtas.classList.add('mobile-nav-open');
        if (mobileMenuToggle) mobileMenuToggle.classList.add('active');
        savedScrollY = window.scrollY || window.pageYOffset || 0;
        document.body.style.top = `-${savedScrollY}px`;
        document.body.classList.add('menu-open');
        document.documentElement.classList.add('menu-open');
    }
    
    function initMobileMenu() {
        if (initialized) return;
        reorderPrimaryNavAlphabetically();
        reorderServicesDisplayOrder();
        
        const { mobileMenuToggle, mainNav } = getElements();
        
        if (!mobileMenuToggle || !mainNav) {
            // Retry if elements not found
            setTimeout(initMobileMenu, 50);
            return;
        }
        
        initialized = true;
        
        // Toggle button click handler
        mobileMenuToggle.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const isOpen = mainNav.classList.contains('mobile-nav-open');
            
            if (isOpen) {
                closeMobileMenu();
            } else {
                openMobileMenu();
            }
        });
        
        // Mobile menu close button
        const mobileMenuClose = document.querySelector('.mobile-menu-close');
        if (mobileMenuClose) {
            mobileMenuClose.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                closeMobileMenu();
            });
        }
        
        // Close mobile menu when clicking on a nav link (except mega menu toggle)
        mainNav.addEventListener('click', function(e) {
            if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                const navLink = e.target.closest('.nav-link');
                const isMegaMenuToggle = e.target.closest('.has-mega-menu .nav-link');
                
                if (navLink && !isMegaMenuToggle) {
                    closeMobileMenu();
                }
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                const { mainNav, mobileMenuToggle } = getElements();
                const isClickInsideNav = mainNav && mainNav.contains(event.target);
                const isClickOnToggle = mobileMenuToggle && mobileMenuToggle.contains(event.target);
                
                if (!isClickInsideNav && !isClickOnToggle && mainNav && mainNav.classList.contains('mobile-nav-open')) {
                    closeMobileMenu();
                }
            }
        });
        
        // Close menu on window resize to desktop
        window.addEventListener('resize', function() {
            const { mainNav } = getElements();
            if (window.innerWidth > MOBILE_NAV_BREAKPOINT && mainNav && mainNav.classList.contains('mobile-nav-open')) {
                closeMobileMenu();
            }
        });
        
        // Handle mega menu on mobile (convert to accordion)
        const megaMenuItems = document.querySelectorAll('.has-mega-menu');
        
        megaMenuItems.forEach(item => {
            const navLink = item.querySelector('.nav-link');
            const megaMenu = item.querySelector('.mega-menu');
            
            if (navLink && megaMenu) {
                navLink.addEventListener('click', function(e) {
                    if (window.innerWidth <= MOBILE_NAV_BREAKPOINT) {
                        e.preventDefault();
                        e.stopPropagation();
                        const isOpen = item.classList.contains('mega-menu-open');
                        
                        // Close all other mega menus
                        megaMenuItems.forEach(otherItem => {
                            if (otherItem !== item) {
                                otherItem.classList.remove('mega-menu-open');
                            }
                        });
                        
                        // Toggle current mega menu
                        if (isOpen) {
                            item.classList.remove('mega-menu-open');
                        } else {
                            item.classList.add('mega-menu-open');
                        }
                    }
                });
            }
        });
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMobileMenu);
    } else {
        initMobileMenu();
    }
    
    // Also try after a delay as fallback
    setTimeout(initMobileMenu, 100);
})();

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href.length > 1) {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Form Validation Helper
function validateField(field) {
    const value = field.value.trim();
    const fieldGroup = field.closest('.form-group');
    const existingError = fieldGroup.querySelector('.error-message');
    
    // Remove existing error
    if (existingError) {
        existingError.remove();
    }
    fieldGroup.classList.remove('error');
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        fieldGroup.classList.add('error');
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This field is required';
        fieldGroup.appendChild(errorMsg);
        return false;
    }
    
    // Validate email
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            fieldGroup.classList.add('error');
            const errorMsg = document.createElement('span');
            errorMsg.className = 'error-message';
            errorMsg.textContent = 'Please enter a valid email address';
            fieldGroup.appendChild(errorMsg);
            return false;
        }
    }
    
    return true;
}

// Form Submission Handler
function handleFormSubmit(form, formName) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    // Validate all required fields
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        // Scroll to first error
        const firstError = form.querySelector('.error');
        if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.querySelector('input, textarea, select')?.focus();
        }
        return false;
    }
    
    // Get form data
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.classList.add('loading');
    submitButton.disabled = true;
    
    // Simulate API call (replace with actual API call)
    setTimeout(() => {
        console.log(`${formName} submission:`, data);
        
        // Remove loading state
        submitButton.classList.remove('loading');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        
        // Show success message
        const successMsg = document.createElement('div');
        successMsg.className = 'success-message';
        successMsg.style.cssText = 'background: #d1fae5; color: #065f46; padding: var(--spacing-md); border-radius: var(--radius-sm); margin-top: var(--spacing-md); text-align: center; font-weight: 600;';
        successMsg.textContent = 'Thank you! We\'ll be in touch soon.';
        form.appendChild(successMsg);
        
        // Reset form
        form.reset();
        
        // Remove success message after 5 seconds
        setTimeout(() => {
            successMsg.remove();
        }, 5000);
        
        // Scroll to success message
        successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 1000);
    
    return true;
}

// Contact/enquiry forms temporarily removed – replaced with phone/email module. Reinstate handlers when forms are wired.

// Service Quick Navigation Active State
document.addEventListener('DOMContentLoaded', function() {
    const quickNavLinks = document.querySelectorAll('.service-quick-nav a');
    const serviceSections = document.querySelectorAll('.service-section');
    
    if (quickNavLinks.length > 0 && serviceSections.length > 0) {
        // Update active state on scroll
        function updateActiveNav() {
            let current = '';
            serviceSections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.pageYOffset >= sectionTop - 100) {
                    current = section.getAttribute('id');
                }
            });
            
            quickNavLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + current) {
                    link.classList.add('active');
                }
            });
        }
        
        window.addEventListener('scroll', updateActiveNav);
        updateActiveNav(); // Initial call
    }
    
    // Back to Top Button
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.setAttribute('aria-label', 'Back to top');
    backToTop.innerHTML = '↑';
    document.body.appendChild(backToTop);
    
    function toggleBackToTop() {
        if (window.innerWidth <= 1024) {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        } else {
            backToTop.classList.remove('visible');
        }
    }
    
    backToTop.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    window.addEventListener('scroll', toggleBackToTop);
    toggleBackToTop(); // Initial check
});

// Hero Image Carousel
document.addEventListener('DOMContentLoaded', function() {
    const carouselImages = document.querySelectorAll('.hero-carousel-img');
    
    if (carouselImages.length > 0) {
        let currentIndex = 0;
        
        function showNextImage() {
            // Remove active class from current image
            carouselImages[currentIndex].classList.remove('active');
            
            // Move to next image
            currentIndex = (currentIndex + 1) % carouselImages.length;
            
            // Add active class to next image
            carouselImages[currentIndex].classList.add('active');
        }
        
        // Start the carousel - change image every 3 seconds
        setInterval(showNextImage, 3000);
    }

    // Google Maps error handling
    setupMapErrorHandling();
    
    // Header shrink on scroll is initialized automatically via IIFE
    // No need to call setupHeaderShrink() here as it's self-initializing
    
    // Mega menu positioning is handled by CSS
});

// Header shrink on scroll - Initialize immediately
(function() {
    'use strict';
    
    const scrollThreshold = 50;
    let ticking = false;
    let header = null;
    let scrollListenerAdded = false;
    
    function getHeader() {
        if (!header) {
            header = document.querySelector('.site-header');
        }
        return header;
    }
    
    function handleScroll() {
        const h = getHeader();
        if (!h) return;
        
        const currentScrollY = window.scrollY || window.pageYOffset || 0;
        
        if (currentScrollY > scrollThreshold) {
            h.classList.add('scrolled');
        } else {
            h.classList.remove('scrolled');
        }
    }
    
    function scrollHandler() {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScroll();
                ticking = false;
            });
            ticking = true;
        }
    }
    
    // Initialize when DOM is ready
    function init() {
        const h = getHeader();
        if (h) {
            // Initial check
            handleScroll();
            
            // Add scroll listener only once
            if (!scrollListenerAdded) {
                window.addEventListener('scroll', scrollHandler, { passive: true });
                scrollListenerAdded = true;
            }
            
            return true; // Successfully initialized
        }
        return false; // Header not found yet
    }
    
    // Start initialization - try multiple times to ensure it works
    function startInit() {
        // Try immediately if DOM is ready
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            if (init()) return; // Success, no need for more attempts
        }
        
        // Also try on DOMContentLoaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                init();
            }, { once: true });
        }
        
        // Try on window load
        window.addEventListener('load', function() {
            init();
            handleScroll(); // Check scroll position on load
        }, { once: true });
        
        // Retry attempts with increasing delays
        let attempts = 0;
        const maxAttempts = 10;
        const retryInterval = setInterval(function() {
            attempts++;
            if (init() || attempts >= maxAttempts) {
                clearInterval(retryInterval);
            }
        }, 100);
    }
    
    // Start immediately
    startInit();
    
    // Also expose function for manual calls if needed
    window.setupHeaderShrink = function() {
        init();
        handleScroll();
    };
})();

// Google Maps error handling and fallback
function setupMapErrorHandling() {
    const mapContainers = document.querySelectorAll('.location-map');
    
    mapContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        const fallback = container.querySelector('.map-fallback');
        
        if (!iframe || !fallback) return;
        
        let loadTimeout;
        let hasLoaded = false;
        let errorDetected = false;
        let checkInterval;
        let timeoutStarted = false;
        let observer;
        let hasTriggeredLoad = false;
        let hasRetried = false;

        function buildMapEmbedUrl() {
            const lat = container.getAttribute('data-lat');
            const lng = container.getAttribute('data-lng');
            if (lat && lng) {
                return `https://www.google.com/maps?q=${lat},${lng}&hl=en&z=14&t=k&output=embed`;
            }
            return iframe.getAttribute('data-src') || iframe.getAttribute('src') || '';
        }

        function triggerMapLoad(forceRefresh = false) {
            const baseUrl = buildMapEmbedUrl();
            if (!baseUrl) return;

            if (!hasTriggeredLoad || forceRefresh) {
                const nextUrl = forceRefresh ? `${baseUrl}&retry=${Date.now()}` : baseUrl;
                iframe.setAttribute('src', nextUrl);
                hasTriggeredLoad = true;
            }
        }
        
        // Improved: Check if iframe actually loaded content (not just the iframe element)
        function checkMapLoaded() {
            if (errorDetected || hasLoaded) return;
            
            try {
                // Try to access iframe content to verify it loaded
                // This will throw CORS error if map didn't load properly, which is actually good
                const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                
                if (iframeDoc) {
                    // If we can access the document, check for error indicators
                    const body = iframeDoc.body;
                    if (body) {
                        const bodyText = body.textContent || body.innerText || '';
                        const bodyHTML = body.innerHTML || '';
                        
                        // Check for common Google Maps error messages
                        if (bodyText.includes('Map data') || 
                            bodyText.includes('For development purposes only') ||
                            bodyHTML.includes('maps/api/js') ||
                            bodyHTML.length > 100) {
                            // Map appears to have loaded (has content)
                            hasLoaded = true;
                            clearTimeout(loadTimeout);
                            if (checkInterval) clearInterval(checkInterval);
                            if (observer) observer.disconnect();
                            return;
                        }
                        
                        // Check for error messages
                        if (bodyText.includes('Something went wrong') || 
                            bodyText.includes('didn\'t load') || 
                            bodyText.includes('Oops!') ||
                            bodyText.includes('Map unavailable') ||
                            bodyText.includes('This page can\'t load Google Maps correctly')) {
                            console.warn('Map error detected in content');
                            showMapFallback(container, iframe, fallback);
                            errorDetected = true;
                            if (checkInterval) clearInterval(checkInterval);
                            if (observer) observer.disconnect();
                            return;
                        }
                    }
                }
            } catch (e) {
                // CORS error is expected for cross-origin iframes
                // If we get here, the iframe loaded but we can't access content (normal)
                // We'll rely on the load event and timeout instead
            }
        }
        
        // Start timeout only when map becomes visible
        function startTimeout() {
            if (timeoutStarted || hasLoaded || errorDetected) return;
            timeoutStarted = true;
            triggerMapLoad();
            
            // Set a timeout to detect if map doesn't load within reasonable time
            loadTimeout = setTimeout(() => {
                if (!hasLoaded && !errorDetected) {
                    if (!hasRetried) {
                        // Retry once on late scroll/network jitter before falling back.
                        hasRetried = true;
                        timeoutStarted = false;
                        triggerMapLoad(true);
                        startTimeout();
                        return;
                    }

                    console.warn('Map load timeout, showing fallback');
                    showMapFallback(container, iframe, fallback);
                    errorDetected = true;
                    if (checkInterval) clearInterval(checkInterval);
                    if (observer) observer.disconnect();
                }
            }, 10000); // 10 seconds from when map becomes visible
        }
        
        // Use Intersection Observer to start timeout only when map is visible
        observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !timeoutStarted && !hasLoaded && !errorDetected) {
                    // Map just became visible, start the timeout now
                    startTimeout();
                }
            });
        }, {
            threshold: 0.1 // Start when 10% of map is visible
        });
        
        observer.observe(container);

        // Keep iframes deferred until visible to avoid stale lazy loads.
        if (iframe.hasAttribute('src')) {
            iframe.setAttribute('data-src', iframe.getAttribute('src'));
            iframe.removeAttribute('src');
        }
        
        // Listen for successful load event
        iframe.addEventListener('load', () => {
            // If map is visible, start timeout if not already started
            const rect = container.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !timeoutStarted) {
                startTimeout();
            }
            
            // Give it a moment to fully render
            setTimeout(() => {
                checkMapLoaded();
                
                // Continue checking periodically for a few seconds
                if (!errorDetected && !hasLoaded) {
                    checkInterval = setInterval(() => {
                        checkMapLoaded();
                        if (hasLoaded || errorDetected) {
                            clearInterval(checkInterval);
                        }
                    }, 500);
                    
                    // Stop checking after 5 seconds
                    setTimeout(() => {
                        if (checkInterval) clearInterval(checkInterval);
                        if (!hasLoaded && !errorDetected) {
                            // If still not loaded after checks, assume it's working
                            // (CORS prevents us from verifying, but load event fired)
                            hasLoaded = true;
                            clearTimeout(loadTimeout);
                            if (observer) observer.disconnect();
                        }
                    }, 5000);
                }
            }, 1000);
        });
        
        // Handle iframe errors (though these rarely fire for iframes)
        iframe.addEventListener('error', () => {
            if (!errorDetected) {
                console.warn('Map iframe error event');
                showMapFallback(container, iframe, fallback);
                errorDetected = true;
                clearTimeout(loadTimeout);
                if (checkInterval) clearInterval(checkInterval);
                if (observer) observer.disconnect();
            }
        });
        
        // Listen for postMessage from iframe (if Google Maps sends error messages)
        const messageHandler = (event) => {
            // Only process messages from Google Maps domain
            if (event.origin.includes('google.com') || event.origin.includes('googleapis.com')) {
                if (event.data && typeof event.data === 'string' && 
                    (event.data.includes('error') || event.data.includes('failed') || 
                     event.data.includes('unavailable'))) {
                    if (!errorDetected && container.contains(iframe)) {
                        console.warn('Map error message received');
                        showMapFallback(container, iframe, fallback);
                        errorDetected = true;
                        clearTimeout(loadTimeout);
                        if (checkInterval) clearInterval(checkInterval);
                        if (observer) observer.disconnect();
                        window.removeEventListener('message', messageHandler);
                    }
                }
            }
        };
        
        window.addEventListener('message', messageHandler);
    });
}

function handleMapError(location) {
    const container = document.querySelector(`.location-map[data-location="${location}"]`);
    if (container) {
        const iframe = container.querySelector('iframe');
        const fallback = container.querySelector('.map-fallback');
        if (iframe && fallback) {
            showMapFallback(container, iframe, fallback);
        }
    }
}

function showMapFallback(container, iframe, fallback) {
    if (iframe) {
        iframe.style.display = 'none';
    }
    if (fallback) {
        fallback.style.display = 'flex';
    }
}

// Fix mega menu positioning to escape container bounds
function setupMegaMenuPositioning() {
    const megaMenuItems = document.querySelectorAll('.has-mega-menu');
    
    megaMenuItems.forEach(item => {
        const navLink = item.querySelector('.nav-link');
        const megaMenu = item.querySelector('.mega-menu');
        
        if (!navLink || !megaMenu) return;
        
        function updateMegaMenuPosition() {
            if (window.innerWidth > 1024) { // Desktop only
                const navLinkRect = navLink.getBoundingClientRect();
                const headerRect = document.querySelector('.site-header').getBoundingClientRect();
                
                // Calculate position relative to viewport
                const topPosition = headerRect.bottom + 4; // 4px gap
                const leftPosition = navLinkRect.left + (navLinkRect.width / 2);
                
                megaMenu.style.top = `${topPosition}px`;
                megaMenu.style.left = `${leftPosition}px`;
                megaMenu.style.transform = 'translateX(-50%)';
            } else {
                // Reset for mobile
                megaMenu.style.top = '';
                megaMenu.style.left = '';
                megaMenu.style.transform = '';
            }
        }
        
        // Update on hover
        item.addEventListener('mouseenter', () => {
            if (window.innerWidth > 1024) {
                updateMegaMenuPosition();
            }
        });
        
        // Update on scroll/resize
        window.addEventListener('scroll', updateMegaMenuPosition, { passive: true });
        window.addEventListener('resize', updateMegaMenuPosition);
    });
}

function setupAccordions() {
    const expandableSections = document.querySelectorAll('.sub-pillar-expandable');
    
    if (expandableSections.length === 0) return;
    
    expandableSections.forEach(section => {
        const header = section.querySelector('.sub-pillar-expandable-header');
        const content = section.querySelector('.sub-pillar-expandable-content');
        
        if (!header || !content) return;
        
        if (!section.classList.contains('active')) {
            content.style.maxHeight = '0';
        }
        
        header.style.cursor = 'pointer';
        
        header.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const isActive = section.classList.contains('active');
            
            if (isActive) {
                section.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                section.classList.add('active');
                content.style.maxHeight = 'none';
                const height = content.scrollHeight;
                content.style.maxHeight = '0';
                void content.offsetHeight;
                requestAnimationFrame(() => {
                    content.style.maxHeight = height + 'px';
                });
            }
        });
        
        const sectionId = section.id;
        if (sectionId && window.location.hash === '#' + sectionId) {
            section.classList.add('active');
            content.style.maxHeight = 'none';
            const height = content.scrollHeight;
            content.style.maxHeight = height + 'px';
            setTimeout(() => {
                const headerHeight = document.querySelector('.site-header')?.offsetHeight || 80;
                const sectionTop = section.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
                window.scrollTo({ top: sectionTop, behavior: 'smooth' });
            }, 100);
        }
    });
}

function setupFaqAccordions() {
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length === 0) return;

    faqItems.forEach(item => {
        const header = item.querySelector('.faq-item-header');
        const content = item.querySelector('.faq-item-content');
        if (!header || !content) return;

        if (!item.classList.contains('active')) {
            content.style.maxHeight = '0';
        }

        header.addEventListener('click', function (e) {
            e.preventDefault();
            const isActive = item.classList.contains('active');

            if (isActive) {
                item.classList.remove('active');
                content.style.maxHeight = '0';
            } else {
                item.classList.add('active');
                content.style.maxHeight = 'none';
                const height = content.scrollHeight;
                content.style.maxHeight = '0';
                void content.offsetHeight;
                requestAnimationFrame(() => {
                    content.style.maxHeight = height + 'px';
                });
            }
        });
    });
}

// Initialize accordions on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { setupAccordions(); setupFaqAccordions(); });
} else {
    setupAccordions();
    setupFaqAccordions();
}
// ============================================
// SCROLL ANIMATIONS (Intersection Observer)
// ============================================

function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.scroll-fade-in, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in');
    
    if (animatedElements.length === 0) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(el => observer.observe(el));
}

// ============================================
// RIPPLE EFFECT (Mobile Tap Feedback)
// ============================================

function initRippleEffects() {
    const rippleElements = document.querySelectorAll('.btn, .card, .service-pillar-card, .sector-card');
    
    rippleElements.forEach(element => {
        element.classList.add('ripple-container', 'touch-target');
        
        const createRipple = (e) => {
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            
            const rect = element.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
            const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            
            element.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        };
        
        element.addEventListener('touchstart', createRipple);
        element.addEventListener('mousedown', createRipple);
    });
}

// ============================================

// ============================================
// ANIMATED STATISTICS COUNTER
// ============================================

function animateCounter(element, target, duration = 2000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    const formatStatNumber = (num) => Math.floor(num).toLocaleString('en-GB');
    
    const updateCounter = () => {
        current += increment;
        if (current < target) {
            element.textContent = formatStatNumber(current);
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = Number(target).toLocaleString('en-GB');
        }
    };
    
    updateCounter();
}

function initAnimatedStats() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    
    if (statNumbers.length === 0) return;
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                entry.target.classList.add('animated');
                const target = parseInt(entry.target.getAttribute('data-count'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// ============================================
// TESTIMONIALS CAROUSEL
// ============================================

function initTestimonialsCarousel() {
    const carousel = document.querySelector('.testimonials-carousel');
    if (!carousel) return;
    if (carousel.dataset.initialized === 'true') return;
    carousel.dataset.initialized = 'true';
    
    const track = carousel.querySelector('.testimonials-track');
    const slides = carousel.querySelectorAll('.testimonial-slide');
    const dots = carousel.querySelectorAll('.testimonial-dot');
    const prevBtn = carousel.querySelector('.testimonial-nav-btn.prev');
    const nextBtn = carousel.querySelector('.testimonial-nav-btn.next');
    
    if (!track || slides.length === 0) return;
    
    let currentIndex = 0;
    let isTransitioning = false;
    let touchStartX = 0;
    let touchEndX = 0;
    
    function updateCarousel() {
        const slideWidth = carousel.getBoundingClientRect().width;
        track.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }
    
    function goToSlide(index) {
        if (isTransitioning) return;
        currentIndex = Math.max(0, Math.min(index, slides.length - 1));
        isTransitioning = true;
        updateCarousel();
        setTimeout(() => { isTransitioning = false; }, 500);
    }
    
    function nextSlide() {
        if (isTransitioning) return;
        currentIndex = (currentIndex + 1) % slides.length; // Wrap to 0 after last slide
        isTransitioning = true;
        updateCarousel();
        setTimeout(() => { isTransitioning = false; }, 500);
    }
    
    function prevSlide() {
        if (isTransitioning) return;
        currentIndex = (currentIndex - 1 + slides.length) % slides.length; // Wrap to last slide when going back from first
        isTransitioning = true;
        updateCarousel();
        setTimeout(() => { isTransitioning = false; }, 500);
    }
    
    // Auto-play
    let autoPlayInterval = setInterval(nextSlide, 5000);
    
    function resetAutoPlay() {
        clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, 5000);
    }
    
    // Navigation buttons
    if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); resetAutoPlay(); });
    if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); resetAutoPlay(); });
    
    // Dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => { goToSlide(index); resetAutoPlay(); });
    });
    
    // Touch/swipe support
    track.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    });
    
    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].clientX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
            resetAutoPlay();
        }
    }
    
    // Pause on hover
    carousel.addEventListener('mouseenter', () => clearInterval(autoPlayInterval));
    carousel.addEventListener('mouseleave', () => resetAutoPlay());

    // Keep alignment correct after orientation/viewport changes on mobile.
    window.addEventListener('resize', updateCarousel, { passive: true });

    // Ensure initial position is explicitly set.
    updateCarousel();
}

// ============================================
// SCROLL PROGRESS INDICATOR
// ============================================

function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    document.body.appendChild(progressBar);
    
    function updateProgress() {
        const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    }
    
    window.addEventListener('scroll', updateProgress);
    updateProgress();
}

// ============================================
// HOMEPAGE "WHAT'S NEW" WIDGET
// ============================================

function initWhatsNewWidget() {
    const widget = document.getElementById('whats-new-widget');
    if (!widget) return;
    if (widget.dataset.initialized === 'true') return;
    widget.dataset.initialized = 'true';

    const updatedEl = document.getElementById('whats-new-updated');
    const periodEl = document.getElementById('whats-new-period');
    const deadlineEl = document.getElementById('whats-new-deadline');
    const countdownEl = document.getElementById('whats-new-countdown');
    const rotatingTitleEl = document.getElementById('whats-new-rotating-title');
    const rotatingCopyEl = document.getElementById('whats-new-rotating-copy');
    const rotatingPanel = widget.querySelector('.whats-new-rotating-panel');

    const timestampFormatter = new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const deadlineFormatter = new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const advisoryNotes = [
        {
            title: 'Action this month',
            copy: 'Check your digital record quality now so quarterly submissions are straightforward and complete.'
        },
        {
            title: 'Software readiness',
            copy: 'If you are still choosing software, shortlist options early and plan migration before the next reporting window.'
        },
        {
            title: 'Landlord check',
            copy: 'Landlords should review property income records each month to avoid bottlenecks near quarterly deadlines.'
        },
        {
            title: 'Self-employed check',
            copy: 'Keep expense categorisation up to date to reduce rework at end-of-period finalisation.'
        }
    ];

    function getTaxYearPeriod(date) {
        const year = date.getFullYear();
        const startOfTaxYear = new Date(year, 3, 6); // 6 April
        const startYear = date >= startOfTaxYear ? year : year - 1;
        const endYear = startYear + 1;
        return `Tax year ${startYear}/${String(endYear).slice(-2)}`;
    }

    function getQuarterHint(date) {
        const month = date.getMonth();
        if (month >= 3 && month <= 5) return 'Q1 window (Apr-Jun)';
        if (month >= 6 && month <= 8) return 'Q2 window (Jul-Sep)';
        if (month >= 9 && month <= 11) return 'Q3 window (Oct-Dec)';
        return 'Q4 window (Jan-Mar)';
    }

    function getNextMtdDeadline(now) {
        const monthSlots = [1, 4, 7, 10]; // Feb, May, Aug, Nov
        const yearsToCheck = [now.getFullYear(), now.getFullYear() + 1];
        const candidates = [];

        yearsToCheck.forEach((year) => {
            monthSlots.forEach((month) => {
                candidates.push(new Date(year, month, 7, 23, 59, 59));
            });
        });

        candidates.sort((a, b) => a - b);
        return candidates.find((date) => date > now) || candidates[candidates.length - 1];
    }

    function updateWidgetTimestampAndDates() {
        const now = new Date();
        const nextDeadline = getNextMtdDeadline(now);
        const msRemaining = nextDeadline.getTime() - now.getTime();
        const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

        if (updatedEl) {
            updatedEl.textContent = timestampFormatter.format(now);
        }

        if (periodEl) {
            periodEl.textContent = `${getTaxYearPeriod(now)} - ${getQuarterHint(now)}`;
        }

        if (deadlineEl) {
            deadlineEl.textContent = deadlineFormatter.format(nextDeadline);
        }

        if (countdownEl) {
            if (daysRemaining > 1) {
                countdownEl.textContent = `${daysRemaining} days remaining to prepare and submit`;
            } else if (daysRemaining === 1) {
                countdownEl.textContent = '1 day remaining - final checks recommended';
            } else {
                countdownEl.textContent = 'Deadline day - submit as soon as possible';
            }
        }
    }

    function rotateAdviserNote(index) {
        if (!rotatingTitleEl || !rotatingCopyEl) return;
        const note = advisoryNotes[index % advisoryNotes.length];

        if (rotatingPanel) rotatingPanel.classList.add('is-updating');
        setTimeout(() => {
            rotatingTitleEl.textContent = note.title;
            rotatingCopyEl.textContent = note.copy;
            if (rotatingPanel) rotatingPanel.classList.remove('is-updating');
        }, 180);
    }

    updateWidgetTimestampAndDates();
    rotateAdviserNote(0);

    let noteIndex = 1;
    setInterval(updateWidgetTimestampAndDates, 60000);
    setInterval(() => {
        rotateAdviserNote(noteIndex);
        noteIndex += 1;
    }, 7000);
}

// ============================================
// INITIALIZE ALL FEATURES
// ============================================

// ---------------------------------------------------------------------------
// Rotating CTAs - randomly swap the last CTA on each page for a fresh message
// ---------------------------------------------------------------------------

const CTA_POOL = [
    {
        heading: "Ready to streamline your accounts?",
        text: "Let us handle the numbers so you can focus on what you do best.",
        primaryLabel: "Talk to Us",
    },
    {
        heading: "Need help with tax planning?",
        text: "Our team can help you stay compliant and find ways to be more tax-efficient.",
        primaryLabel: "Get in Touch",
    },
    {
        heading: "Looking for expert business advice?",
        text: "From growth planning to exit strategy, we provide the insight you need to move forward.",
        primaryLabel: "Speak to an Adviser",
    },
    {
        heading: "Not sure where to start?",
        text: "We\u2019ll help you figure out exactly what you need - no jargon, no obligation.",
        primaryLabel: "Let\u2019s Talk",
    },
    {
        heading: "Want to take control of your finances?",
        text: "Clear, proactive accounting that helps you make better business decisions.",
        primaryLabel: "Get Started",
    },
    {
        heading: "Is your business ready for growth?",
        text: "We help ambitious businesses scale with the right financial support in place.",
        primaryLabel: "Find Out More",
    },
    {
        heading: "Time for a fresh pair of eyes?",
        text: "Sometimes a second opinion can save you time, stress, and money.",
        primaryLabel: "Book a Chat",
    },
    {
        heading: "Could you be paying less tax?",
        text: "Many businesses overpay without realising. Let us review your position.",
        primaryLabel: "Request a Review",
    },
    {
        heading: "Thinking about your next step?",
        text: "Whether you\u2019re starting up, scaling, or planning ahead - we\u2019re here to help.",
        primaryLabel: "Talk to Our Team",
    },
    {
        heading: "Let\u2019s make your accounting work for you",
        text: "Accounting shouldn\u2019t be a headache. We make it simple, clear, and genuinely useful.",
        primaryLabel: "Contact Us",
    },
];

function rotateCTAs() {
    const pick = () => CTA_POOL[Math.floor(Math.random() * CTA_POOL.length)];

    function applyCTA(container, variation) {
        const h2 = container.querySelector('h2');
        const p = container.querySelector(':scope > p, :scope > .blog-post-cta > p');
        if (h2) h2.textContent = variation.heading;

        const directP = container.querySelector(':scope > p');
        if (directP) directP.textContent = variation.text;

        const actionsContainer = container.querySelector('.cta-banner-actions, .blog-post-cta-actions');
        if (actionsContainer) {
            const primaryBtn = actionsContainer.querySelector('.btn-primary');
            if (primaryBtn) primaryBtn.textContent = variation.primaryLabel;
        }
    }

    // Rotate the last .cta-banner on the page (the generic / final CTA)
    const ctaBanners = document.querySelectorAll('.cta-banner');
    if (ctaBanners.length > 0) {
        const lastBanner = ctaBanners[ctaBanners.length - 1];
        applyCTA(lastBanner, pick());

        // If the page has 3+ banners (like services hub), also rotate the second-to-last
        if (ctaBanners.length >= 3) {
            const secondLast = ctaBanners[ctaBanners.length - 2];
            applyCTA(secondLast, pick());
        }
    }

    // Rotate the blog-post CTA
    const blogCTA = document.querySelector('.blog-post-cta');
    if (blogCTA) {
        const v = pick();
        const h2 = blogCTA.querySelector('h2');
        const p = blogCTA.querySelector('p');
        if (h2) h2.textContent = v.heading;
        if (p) p.textContent = v.text;
        const primaryBtn = blogCTA.querySelector('.blog-post-cta-actions .btn-primary');
        if (primaryBtn) primaryBtn.textContent = v.primaryLabel;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initScrollAnimations();
    initRippleEffects();
    initAnimatedStats();
    initTestimonialsCarousel();
    initScrollProgress();
    initWhatsNewWidget();
    rotateCTAs();
});

// Also run if DOM already loaded
if (document.readyState !== 'loading') {
    initScrollAnimations();
    initRippleEffects();
    initAnimatedStats();
    initTestimonialsCarousel();
    initScrollProgress();
    initWhatsNewWidget();
    rotateCTAs();
}
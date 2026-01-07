// Mobile Menu Toggle - Initialize immediately and on DOM ready
(function() {
    'use strict';
    
    let mobileMenuToggle = null;
    let mainNav = null;
    let headerCtas = null;
    let initialized = false;
    
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
    }
    
    function openMobileMenu() {
        const { mainNav, headerCtas, mobileMenuToggle } = getElements();
        if (mainNav) mainNav.classList.add('mobile-nav-open');
        if (headerCtas) headerCtas.classList.add('mobile-nav-open');
        if (mobileMenuToggle) mobileMenuToggle.classList.add('active');
        document.body.classList.add('menu-open');
    }
    
    function initMobileMenu() {
        if (initialized) return;
        
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
            if (window.innerWidth <= 768) {
                const navLink = e.target.closest('.nav-link');
                const isMegaMenuToggle = e.target.closest('.has-mega-menu .nav-link');
                
                if (navLink && !isMegaMenuToggle) {
                    closeMobileMenu();
                }
            }
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(event) {
            if (window.innerWidth <= 768) {
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
            if (window.innerWidth > 768 && mainNav && mainNav.classList.contains('mobile-nav-open')) {
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
                    if (window.innerWidth <= 768) {
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

// Enquiry Form Handler (Homepage)
const enquiryForm = document.getElementById('enquiry-form');
if (enquiryForm) {
    // Real-time validation
    const enquiryFields = enquiryForm.querySelectorAll('input, textarea, select');
    enquiryFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
    });
    
    enquiryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(this, 'Enquiry');
    });
}

// Contact Form Handler
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    // Real-time validation
    const contactFields = contactForm.querySelectorAll('input, textarea, select');
    contactFields.forEach(field => {
        field.addEventListener('blur', () => validateField(field));
    });
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleFormSubmit(this, 'Contact');
    });
}

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
        if (window.innerWidth <= 768) {
            if (window.pageYOffset > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
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
    
    // Debug sticky header positioning
    debugStickyHeader();
    
    // Header shrink on scroll is initialized automatically via IIFE
    // No need to call setupHeaderShrink() here as it's self-initializing
    
    // Mega menu positioning is handled by CSS
});

// Debug sticky header positioning
function debugStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) {
        console.error('❌ Header element not found (.site-header)');
        return;
    }
    
    console.log('🔍 Debugging Sticky Header:');
    console.log('Header element:', header);
    
    // Check computed styles
    const computedStyle = window.getComputedStyle(header);
    console.log('Computed position:', computedStyle.position);
    console.log('Computed top:', computedStyle.top);
    console.log('Computed z-index:', computedStyle.zIndex);
    console.log('Computed width:', computedStyle.width);
    console.log('Computed left:', computedStyle.left);
    console.log('Computed right:', computedStyle.right);
    
    // Check parent elements
    let parent = header.parentElement;
    let parentLevel = 1;
    while (parent && parentLevel <= 3) {
        const parentStyle = window.getComputedStyle(parent);
        console.log(`Parent ${parentLevel} (${parent.tagName}):`, {
            element: parent,
            position: parentStyle.position,
            overflow: parentStyle.overflow,
            overflowX: parentStyle.overflowX,
            overflowY: parentStyle.overflowY,
            height: parentStyle.height,
            maxHeight: parentStyle.maxHeight
        });
        parent = parent.parentElement;
        parentLevel++;
    }
    
    // Check if header is in viewport
    const rect = header.getBoundingClientRect();
    console.log('Header bounding rect:', {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        inViewport: rect.top >= 0 && rect.top < window.innerHeight
    });
    
    // Monitor scroll events
    let scrollCount = 0;
    let lastHeaderTop = header.getBoundingClientRect().top;
    window.addEventListener('scroll', () => {
        scrollCount++;
        const newRect = header.getBoundingClientRect();
        const newComputed = window.getComputedStyle(header);
        const scrollY = window.scrollY || window.pageYOffset;
        
        // Log every scroll to see behavior
        if (scrollCount <= 5 || scrollCount % 10 === 0) {
            const isSticking = newRect.top === 0;
            const movedWithScroll = Math.abs(newRect.top - lastHeaderTop) > 1;
            
            console.log(`📜 Scroll #${scrollCount}:`, {
                scrollY: scrollY,
                headerTop: newRect.top,
                headerPosition: newComputed.position,
                isSticking: isSticking,
                movedWithScroll: movedWithScroll,
                expectedBehavior: scrollY > 0 ? 'Should be at top: 0' : 'At natural position'
            });
            
            if (scrollY > 50 && !isSticking) {
                console.warn('⚠️ PROBLEM: Scrolled but header is NOT sticking!', {
                    scrollY: scrollY,
                    headerTop: newRect.top,
                    shouldBeAt: 0
                });
                
                // Check all ancestors for overflow
                let ancestor = header.parentElement;
                let ancestorLevel = 1;
                while (ancestor && ancestorLevel <= 5) {
                    const ancestorStyle = window.getComputedStyle(ancestor);
                    const overflow = ancestorStyle.overflow;
                    const overflowY = ancestorStyle.overflowY;
                    const overflowX = ancestorStyle.overflowX;
                    
                    if (overflow !== 'visible' || overflowY !== 'visible' || overflowX !== 'visible') {
                        console.error(`❌ Found overflow issue on ancestor ${ancestorLevel} (${ancestor.tagName}):`, {
                            element: ancestor,
                            overflow: overflow,
                            overflowY: overflowY,
                            overflowX: overflowX,
                            position: ancestorStyle.position,
                            height: ancestorStyle.height
                        });
                        
                        // Try to fix it immediately
                        if (ancestor.tagName === 'HTML' || ancestor.tagName === 'BODY') {
                            console.log(`🔧 Attempting to fix ${ancestor.tagName} overflow...`);
                            ancestor.style.overflow = 'visible';
                            ancestor.style.overflowX = 'visible';
                            ancestor.style.overflowY = 'visible';
                            console.log(`✅ Set ${ancestor.tagName} overflow to visible`);
                        }
                    }
                    ancestor = ancestor.parentElement;
                    ancestorLevel++;
                }
            }
        }
        
        lastHeaderTop = newRect.top;
    }, { passive: true });
    
    // Check on page load
    console.log('Initial scroll position:', window.scrollY);
    console.log('Window height:', window.innerHeight);
    console.log('Document height:', document.documentElement.scrollHeight);
    
    // Force check after a short delay
    setTimeout(() => {
        const finalRect = header.getBoundingClientRect();
        const finalComputed = window.getComputedStyle(header);
        console.log('⏱️ After 1 second:', {
            headerTop: finalRect.top,
            headerPosition: finalComputed.position,
            scrollY: window.scrollY,
            isSticky: finalRect.top === 0 && finalComputed.position === 'sticky'
        });
        
        if (finalComputed.position !== 'sticky' && finalComputed.position !== '-webkit-sticky') {
            console.error('❌ Header is NOT sticky! Position is:', finalComputed.position);
            console.log('Trying to force sticky...');
            header.style.position = 'sticky';
            header.style.top = '0';
            header.style.zIndex = '1000';
            console.log('Applied inline styles. New position:', window.getComputedStyle(header).position);
        } else {
            console.log('✅ Header position is sticky');
        }
        
        // Aggressively fix overflow on html and body
        const htmlEl = document.documentElement;
        const bodyEl = document.body;
        const htmlStyle = window.getComputedStyle(htmlEl);
        const bodyStyle = window.getComputedStyle(bodyEl);
        
        console.log('🔍 Current overflow values:', {
            html: { overflow: htmlStyle.overflow, overflowX: htmlStyle.overflowX, overflowY: htmlStyle.overflowY },
            body: { overflow: bodyStyle.overflow, overflowX: bodyStyle.overflowX, overflowY: bodyStyle.overflowY }
        });
        
        // Force remove ALL overflow constraints
        console.log('🔧 Forcing overflow to visible on html and body...');
        htmlEl.style.setProperty('overflow', 'visible', 'important');
        htmlEl.style.setProperty('overflow-x', 'visible', 'important');
        htmlEl.style.setProperty('overflow-y', 'visible', 'important');
        
        bodyEl.style.setProperty('overflow', 'visible', 'important');
        bodyEl.style.setProperty('overflow-x', 'visible', 'important');
        bodyEl.style.setProperty('overflow-y', 'visible', 'important');
        
        console.log('✅ Applied overflow fixes with !important');
        
        // Re-check after fixing overflow
        setTimeout(() => {
            const testRect = header.getBoundingClientRect();
            const testScroll = window.scrollY || window.pageYOffset;
            if (testScroll > 10) {
                const isNowSticking = testRect.top === 0;
                console.log('🔧 After overflow fix:', {
                    scrollY: testScroll,
                    headerTop: testRect.top,
                    isSticking: isNowSticking,
                    success: isNowSticking ? '✅ FIXED!' : '❌ Still not working'
                });
            }
        }, 500);
    }, 1000);
}

// Header shrink on scroll - Initialize immediately
(function() {
    'use strict';
    
    const scrollThreshold = 50;
    let ticking = false;
    let header = null;
    
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
            
            // Add scroll listener
            window.addEventListener('scroll', scrollHandler, { passive: true });
            
            // Check on load in case page loads scrolled
            window.addEventListener('load', handleScroll, { passive: true });
        } else {
            // Retry if header not found
            setTimeout(init, 50);
        }
    }
    
    // Start initialization - try multiple times to ensure it works
    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // DOM already loaded
            init();
        }
        
        // Also try after a short delay as fallback
        setTimeout(init, 100);
        setTimeout(init, 500);
    }
    
    startInit();
    
    // Also expose function for manual calls if needed
    window.setupHeaderShrink = init;
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
        
        // Set a timeout to detect if map doesn't load within reasonable time
        loadTimeout = setTimeout(() => {
            if (!hasLoaded && !errorDetected) {
                console.warn('Map load timeout, showing fallback');
                showMapFallback(container, iframe, fallback);
                errorDetected = true;
            }
        }, 8000); // 8 second timeout
        
        // Listen for successful load
        iframe.addEventListener('load', () => {
            hasLoaded = true;
            clearTimeout(loadTimeout);
            
            // After load, check for error messages (with CORS limitations)
            setTimeout(() => {
                if (!errorDetected) {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        if (iframeDoc && iframeDoc.body) {
                            const bodyText = iframeDoc.body.textContent || iframeDoc.body.innerText || '';
                            if (bodyText.includes('Something went wrong') || 
                                bodyText.includes('didn\'t load') || 
                                bodyText.includes('Oops!') ||
                                bodyText.includes('JavaScript console')) {
                                console.warn('Map error detected in content');
                                showMapFallback(container, iframe, fallback);
                                errorDetected = true;
                            }
                        }
                    } catch (e) {
                        // CORS error - can't check content directly
                        // This is expected and normal for cross-origin iframes
                    }
                }
            }, 2000); // Check 2 seconds after load
        });
        
        // Handle iframe errors
        iframe.addEventListener('error', () => {
            if (!errorDetected) {
                console.warn('Map iframe error event');
                showMapFallback(container, iframe, fallback);
                errorDetected = true;
            }
        });
        
        // Listen for postMessage from iframe (if Google Maps sends error messages)
        window.addEventListener('message', (event) => {
            // Only process messages from Google Maps domain
            if (event.origin.includes('google.com') || event.origin.includes('googleapis.com')) {
                if (event.data && typeof event.data === 'string' && 
                    (event.data.includes('error') || event.data.includes('failed'))) {
                    if (!errorDetected && container.contains(iframe)) {
                        console.warn('Map error message received');
                        showMapFallback(container, iframe, fallback);
                        errorDetected = true;
                    }
                }
            }
        });
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
            if (window.innerWidth > 768) { // Desktop only
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
            if (window.innerWidth > 768) {
                updateMegaMenuPosition();
            }
        });
        
        // Update on scroll/resize
        window.addEventListener('scroll', updateMegaMenuPosition, { passive: true });
        window.addEventListener('resize', updateMegaMenuPosition);
    });
}


document.addEventListener('DOMContentLoaded', () => {
    // 1. STICKY NAVBAR SCROLL EFFECT
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // 2. MOBILE BURGER MENU
    const burgerBtn = document.getElementById('burger-menu-btn');
    const navLinks = document.getElementById('nav-links');
    if (burgerBtn && navLinks) {
        burgerBtn.addEventListener('click', () => {
            navLinks.classList.toggle('open');
            // Animate burger lines
            const lines = burgerBtn.querySelectorAll('.burger-line');
            if (navLinks.classList.contains('open')) {
                lines[0].style.transform = 'rotate(45deg) translate(6px, 6px)';
                lines[1].style.opacity = '0';
                lines[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
            } else {
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            }
        });

        // Close mobile menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
                const lines = burgerBtn.querySelectorAll('.burger-line');
                lines[0].style.transform = 'none';
                lines[1].style.opacity = '1';
                lines[2].style.transform = 'none';
            });
        });
    }

    // 3. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    const revealElements = document.querySelectorAll('.reveal, .reveal-zoom');
    
    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    // Once animated, no need to track it again
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        // Fallback if observer is not supported
        revealElements.forEach(el => el.classList.add('active'));
    }

    // 4. PRODUCT TAB FILTERING
    const filterTabs = document.querySelectorAll('.filter-tab');
    const productCards = document.querySelectorAll('.grid .card');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from other tabs
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            productCards.forEach(card => {
                // Apply animate scale-down effect
                card.style.transform = 'scale(0.95)';
                card.style.opacity = '0';
                
                setTimeout(() => {
                    if (filterValue === 'all' || card.classList.contains(filterValue)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.transform = 'scale(1)';
                            card.style.opacity = '1';
                        }, 50);
                    } else {
                        card.style.display = 'none';
                    }
                }, 300);
            });
        });
    });

    // Auto-filter when clicking category megamenu links
    document.querySelectorAll('.dropdown-content a').forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href').substring(1);
            const targetCard = document.getElementById(targetId);
            
            if (targetCard) {
                // Determine category filter based on card classes
                let category = 'all';
                if (targetCard.classList.contains('pulses')) category = 'pulses';
                else if (targetCard.classList.contains('rice')) category = 'rice';
                else if (targetCard.classList.contains('flour')) category = 'flour';

                // Find matching filter tab and click it
                const matchingTab = document.querySelector(`.filter-tab[data-filter="${category}"]`);
                if (matchingTab) {
                    matchingTab.click();
                }
                
                // Allow time for display toggles before scroll
                setTimeout(() => {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Highlight pulse effect on card
                    targetCard.classList.remove('target-active');
                    void targetCard.offsetWidth; // Trigger reflow
                    targetCard.classList.add('target-active');
                }, 400);
            }
        });
    });

    // 5. INQUIRY CART DRAWER OPERATIONS
    let cart = [];

    // Helper functions for safe storage access under file:// protocol
    const safeGetStorageItem = (key) => {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.warn('localStorage access blocked by security origin policy:', e);
            return null;
        }
    };

    const safeSetStorageItem = (key, value) => {
        try {
            localStorage.setItem(key, value);
        } catch (e) {
            console.warn('localStorage write blocked by security origin policy:', e);
        }
    };

    // Load cart safely
    const savedCart = safeGetStorageItem('kanha_inquiry_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = [];
        }
    }

    const drawer = document.getElementById('inquiry-drawer');
    const overlay = document.getElementById('drawer-overlay');
    const openCartBtn = document.getElementById('cart-float-btn');
    const closeCartBtn = document.getElementById('drawer-close-btn');
    const cartBadge = document.getElementById('cart-badge-count');
    const cartContainer = document.getElementById('drawer-items-container');
    const submitBtn = document.getElementById('submit-inquiry-btn');
    const whatsappFloatBtn = document.getElementById('whatsapp-float-btn');

    // Toggle Drawer Open/Close
    const toggleDrawer = () => {
        drawer.classList.toggle('open');
        overlay.classList.toggle('open');
    };

    if (openCartBtn) openCartBtn.addEventListener('click', toggleDrawer);
    if (closeCartBtn) closeCartBtn.addEventListener('click', toggleDrawer);
    if (overlay) overlay.addEventListener('click', toggleDrawer);

    // Save Cart safely
    const saveCart = () => {
        safeSetStorageItem('kanha_inquiry_cart', JSON.stringify(cart));
        updateCartUI();
    };

    // Update Cart Badge and Render items
    const updateCartUI = () => {
        // Count total item records
        const totalItems = cart.reduce((total, item) => total + item.qty, 0);
        if (cartBadge) {
            cartBadge.textContent = totalItems;
            if (totalItems > 0) {
                cartBadge.style.display = 'flex';
                // Add minor bounce animation on change
                cartBadge.style.transform = 'scale(1.2)';
                setTimeout(() => cartBadge.style.transform = 'scale(1)', 200);
            } else {
                cartBadge.style.display = 'none';
            }
        }

        if (!cartContainer) return;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="empty-cart-message">
                    <span>🛒</span>
                    Your inquiry list is empty. Add products to request a quote!
                </div>
            `;
            return;
        }

        // Render Cart items list
        let htmlContent = '';
        cart.forEach((item, index) => {
            htmlContent += `
                <div class="drawer-item">
                    <img class="drawer-item-img" src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=Food'">
                    <div class="drawer-item-details">
                        <div class="drawer-item-name">${item.name}</div>
                        <div class="drawer-item-controls">
                            <div class="drawer-item-quantity">
                                <button class="qty-btn dec-qty" data-index="${index}">&minus;</button>
                                <span class="qty-val">${item.qty} ${item.qty === 1 ? 'Bag' : 'Bags'}</span>
                                <button class="qty-btn inc-qty" data-index="${index}">&plus;</button>
                            </div>
                            <button class="drawer-item-remove" data-index="${index}" title="Remove Item">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        cartContainer.innerHTML = htmlContent;

        // Setup Event Listeners inside Cart Drawer
        cartContainer.querySelectorAll('.dec-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                if (cart[idx].qty > 1) {
                    cart[idx].qty--;
                } else {
                    cart.splice(idx, 1);
                }
                saveCart();
            });
        });

        cartContainer.querySelectorAll('.inc-qty').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                cart[idx].qty++;
                saveCart();
            });
        });

        cartContainer.querySelectorAll('.drawer-item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const idx = parseInt(btn.getAttribute('data-index'));
                cart.splice(idx, 1);
                saveCart();
            });
        });
    };

    // Add to Cart Button Logic
    document.querySelectorAll('.add-to-inquiry-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-product-id');
            const name = btn.getAttribute('data-product-name');
            
            // Get card image URL
            const card = btn.closest('.card') || btn.closest('.favorite-card');
            const imgElement = card ? card.querySelector('img') : null;
            const imgUrl = imgElement ? imgElement.src : 'https://via.placeholder.com/60x60?text=Food';

            // Check if item already exists in cart
            const existingItem = cart.find(item => item.id === id);
            if (existingItem) {
                existingItem.qty++;
            } else {
                cart.push({ id, name, img: imgUrl, qty: 1 });
            }

            saveCart();
            
            // Open Cart Drawer automatically to show addition
            if (!drawer.classList.contains('open')) {
                toggleDrawer();
            }
        });
    });

    // 6. WHATSAPP ENCODED MESSAGE COMPILER
    const phoneNo = '919717230435'; // Target wholesale representative mobile

    const sendWhatsAppMessage = (messageText) => {
        const encodedText = encodeURIComponent(messageText);
        window.open(`https://wa.me/${phoneNo}?text=${encodedText}`, '_blank');
    };

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                alert('Your cart is empty. Please add products to send an inquiry!');
                return;
            }

            let message = `Hello Kanha Agro Foods,\n\nI would like to request a wholesale bulk quote for the following products:\n\n`;
            cart.forEach((item, index) => {
                message += `${index + 1}. ${item.name} - ${item.qty} ${item.qty === 1 ? 'Bag' : 'Bags'}\n`;
            });
            message += `\nPlease provide availability and price quotes for the same. Thank you!`;

            sendWhatsAppMessage(message);
        });
    }

    if (whatsappFloatBtn) {
        whatsappFloatBtn.addEventListener('click', () => {
            const welcomeMsg = `Hello Kanha Agro Foods, I would like to make a business inquiry about your products.`;
            sendWhatsAppMessage(welcomeMsg);
        });
    }

    // Initialize UI on load
    updateCartUI();
});

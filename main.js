// Scroll Reveal Animation
const reveal = () => {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;
        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', reveal);

// Navbar scroll effect
const header = document.querySelector('.glass-nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});

// Hero Slider Logic
const initSlider = () => {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;
    const slideInterval = 5000; // 5 seconds per slide

    const nextSlide = () => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    };

    setInterval(nextSlide, slideInterval);
};

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.setAttribute('data-lucide', 'x');
        } else {
            icon.setAttribute('data-lucide', 'menu');
        }
        lucide.createIcons();
    });

    // Close menu when clicking a link
    const links = navLinks.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.querySelector('i').setAttribute('data-lucide', 'menu');
            lucide.createIcons();
        });
    });
}

// --- Shopping Cart Logic ---

let cart = JSON.parse(localStorage.getItem('romaran_cart')) || [];

const cartBtn = document.getElementById('cart-btn');
const closeCartBtn = document.getElementById('close-cart');
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountBadge = document.getElementById('cart-count');
const whatsappOrderBtn = document.getElementById('whatsapp-order-btn');
const clearCartBtn = document.getElementById('clear-cart');

const confirmModal = document.getElementById('confirm-modal');
const modalCancel = document.getElementById('modal-cancel');
const modalConfirm = document.getElementById('modal-confirm');

// Toggle Cart
const toggleCart = () => {
    cartDrawer.classList.toggle('active');
    cartOverlay.classList.toggle('active');
    if (cartDrawer.classList.contains('active')) {
        renderCart();
    }
};

if (cartBtn) cartBtn.addEventListener('click', toggleCart);
if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCart);
if (cartOverlay) cartOverlay.addEventListener('click', toggleCart);

// Custom Confirm Modal Logic
const showConfirmModal = () => {
    if (cart.length === 0) return;
    confirmModal.classList.add('active');
};

const hideConfirmModal = () => {
    confirmModal.classList.remove('active');
};

if (clearCartBtn) clearCartBtn.addEventListener('click', showConfirmModal);
if (modalCancel) modalCancel.addEventListener('click', hideConfirmModal);
if (confirmModal) confirmModal.addEventListener('click', (e) => {
    if (e.target === confirmModal) hideConfirmModal();
});

if (modalConfirm) modalConfirm.addEventListener('click', () => {
    cart = [];
    saveCart();
    renderCart();
    updateCartCount();
    hideConfirmModal();
    showToast('Carrito vaciado');
});

// Add to Cart
// Icon Mapping Fallback for existing items
const iconMap = {
    "Franela Personalizada": "shirt",
    "Taza Sublimada": "coffee",
    "Gorra Personalizada": "crown",
    "Vinil Textil": "scissors",
    "Pop Socket": "circle-dot",
    "Llavero / Lanyard": "link"
};

const addToCart = (name, quantity = 1, icon = 'package', options = {}) => {
    const qty = parseInt(quantity);

    // Create a unique key based on name and options (like size)
    const optionsKey = Object.values(options).join('-');
    const itemKey = optionsKey ? `${name}-${optionsKey}` : name;

    const existingItem = cart.find(item => item.key === itemKey);

    // Use mapped icon if provided icon is default
    const finalIcon = (icon === 'package' && iconMap[name]) ? iconMap[name] : icon;

    if (existingItem) {
        existingItem.qty += qty;
    } else {
        cart.push({ key: itemKey, name, qty: qty, icon: finalIcon, options: options });
    }
    saveCart();
    updateCartCount();

    const optionText = options.size ? ` (Talla ${options.size})` : "";
    showToast(`¡Añadido ${qty}x ${name}${optionText}!`);
};

// Toast System
const showToast = (message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i data-lucide="check-circle" style="color: #25D366"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Remove toast after animation
    setTimeout(() => {
        toast.remove();
    }, 3000);
};

// Remove from Cart
const removeFromCart = (key) => {
    cart = cart.filter(item => item.key !== key);
    saveCart();
    renderCart();
    updateCartCount();
};

// Update Qty
const updateQty = (key, delta) => {
    const item = cart.find(item => item.key === key);
    if (item) {
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(key);
        } else {
            saveCart();
            renderCart();
            updateCartCount();
        }
    }
};

// Save to LocalStorage
const saveCart = () => {
    localStorage.setItem('romaran_cart', JSON.stringify(cart));
};

// Update Badge Count
const updateCartCount = () => {
    if (cartCountBadge) {
        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountBadge.textContent = totalItems;
    }
};

// Render Cart UI
const renderCart = () => {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<div class="empty-cart-msg">Tu carrito está vacío</div>';
        if (whatsappOrderBtn) whatsappOrderBtn.disabled = true;
        return;
    }

    if (whatsappOrderBtn) whatsappOrderBtn.disabled = false;
    cartItemsContainer.innerHTML = cart.map(item => {
        const icon = item.icon && item.icon !== 'package' ? item.icon : (iconMap[item.name] || 'package');
        const sizeText = item.options && item.options.size ? `<span class="cart-item-option">Talla: ${item.options.size}</span>` : "";

        return `
            <div class="cart-item">
                <div class="item-info">
                    <div class="item-title-row">
                        <i data-lucide="${icon}" class="item-icon"></i>
                        <div class="item-details">
                            <h4>${item.name}</h4>
                            ${sizeText}
                        </div>
                    </div>
                </div>
                <div class="item-qty">
                    <button class="qty-btn" onclick="updateQty('${item.key || item.name}', -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateQty('${item.key || item.name}', 1)">+</button>
                    <button class="remove-item" onclick="removeFromCart('${item.key || item.name}')">
                        <i data-lucide="trash-2"></i>
                    </button>
                </div>
            </div>
        `;
    }).join('');

    lucide.createIcons();
};

// Send Order to WhatsApp
if (whatsappOrderBtn) {
    whatsappOrderBtn.addEventListener('click', () => {
        const phoneNumber = "584126902476";
        let message = "¡Hola Romaran Subli! 👋\n\nMe gustaría realizar un pedido con los siguientes productos:\n\n";

        cart.forEach(item => {
            const size = item.options && item.options.size ? ` [Talla: ${item.options.size}]` : "";
            message += `✅ ${item.qty}x ${item.name}${size}\n`;
        });

        const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
        message += `\n*Total de artículos:* ${totalItems}\n\n📎 *Adjunto a continuación los archivos (PDF/Imágenes) para mi diseño.*`;

        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
}

// Event Listeners for Sizes
document.querySelectorAll('.size-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const parent = btn.parentElement;
        parent.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    });
});

// Event Listeners for Landing Page Qty Selectors
document.querySelectorAll('.qty-btn-main').forEach(btn => {
    btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const input = document.getElementById(`qty-${id}`);
        if (!input) return;

        let val = parseInt(input.value);
        if (btn.classList.contains('plus')) {
            val++;
        } else if (btn.classList.contains('minus') && val > 1) {
            val--;
        }
        input.value = val;
    });
});

// Event Listeners for "Add to Cart" buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
        const productName = btn.getAttribute('data-name');
        const inputId = btn.getAttribute('data-input');
        const iconName = btn.getAttribute('data-icon');
        const input = document.getElementById(inputId);
        const quantity = input ? input.value : 1;

        const options = {};
        // Check if there are size options for this product
        const productCard = btn.closest('.product-card');
        if (productCard) {
            const activeSize = productCard.querySelector('.size-btn.active');
            if (activeSize) {
                options.size = activeSize.getAttribute('data-size');
            }
        }

        addToCart(productName, quantity, iconName, options);

        // Reset input to 1 after adding
        if (input) input.value = 1;
    });
});

// Initial load
window.addEventListener('load', () => {
    reveal();
    initSlider();
    updateCartCount();
});

// Expose functions to global scope for onclick handlers
window.updateQty = updateQty;
window.removeFromCart = removeFromCart;

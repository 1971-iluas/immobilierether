/**
 * ============================================
 * IMMOBILIER ETHER - SCRIPTS PRINCIPAUX
 * Version améliorée et complète
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // SÉLECTEURS DOM (Cache pour performance)
    // ============================================
    const DOM = {
        menuToggle: document.getElementById('menuToggle'),
        navMenu: document.getElementById('navMenu'),
        header: document.getElementById('header'),
        parallax: document.querySelector('.parallax'),
        
        // Éléments avec animations
        reveals: document.querySelectorAll('.reveal'),
        revealsLeft: document.querySelectorAll('.reveal-left'),
        revealsRight: document.querySelectorAll('.reveal-right'),
        revealsScale: document.querySelectorAll('.reveal-scale'),
        
        // Modals
        modalTriggers: document.querySelectorAll('[data-modal]'),
        modalCloses: document.querySelectorAll('.modal-close, [data-modal-close]'),
        
        // Tabs
        tabContainers: document.querySelectorAll('[data-tabs]'),
        
        // Accordions
        accordions: document.querySelectorAll('[data-accordion]'),
        
        // Forms
        forms: document.querySelectorAll('form[data-validate]'),
        
        // Toast container
        toastContainer: document.querySelector('.toast-container'),
        
        // Back to top button
        backToTop: document.querySelector('.back-to-top'),
        
        // Dropdowns
        dropdowns: document.querySelectorAll('[data-dropdown]'),
        
        // Counters
        counters: document.querySelectorAll('[data-counter]'),
        
        // Tooltips
        tooltips: document.querySelectorAll('[data-tooltip]')
    };

    // ============================================
    // ÉTAT GLOBAL
    // ============================================
    const State = {
        scrollY: 0,
        scrollDirection: 'down',
        lastScrollY: 0,
        isMenuOpen: false,
        activeModal: null,
        isAnimating: false,
        resizeTimeout: null,
        scrollTimeout: null
    };

    // ============================================
    // UTILITAIRES
    // ============================================
    const Utils = {
        /**
         * Debounce - Limite la fréquence d'exécution d'une fonction
         */
        debounce(func, wait = 100) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle - Limite le nombre d'exécutions par intervalle
         */
        throttle(func, limit = 100) {
            let inThrottle;
            return function(...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Vérifie si un élément est visible dans le viewport
         */
        isElementInViewport(el, offset = 100) {
            const rect = el.getBoundingClientRect();
            return (
                rect.top <= (window.innerHeight - offset) &&
                rect.bottom >= offset
            );
        },

        /**
         * Animation fluide avec requestAnimationFrame
         */
        smoothScrollTo(target, duration = 800) {
            const start = window.pageYOffset;
            const targetPosition = typeof target === 'number' ? target : target.offsetTop;
            const distance = targetPosition - start;
            const startTime = performance.now();

            function animation(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Fonction d'easing easeInOutQuad
                const ease = progress < 0.5
                    ? 2 * progress * progress
                    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
                
                window.scrollTo(0, start + distance * ease);
                
                if (progress < 1) {
                    requestAnimationFrame(animation);
                }
            }
            
            requestAnimationFrame(animation);
        },

        /**
         * Génère un ID unique
         */
        generateId() {
            return 'id-' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Gestion des cookies
         */
        cookie: {
            set(name, value, days = 7) {
                const expires = new Date(Date.now() + days * 864e5).toUTCString();
                document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
            },
            get(name) {
                return document.cookie.split('; ').reduce((r, v) => {
                    const parts = v.split('=');
                    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
                }, '');
            },
            delete(name) {
                this.set(name, '', -1);
            }
        },

        /**
         * Stockage local
         */
        storage: {
            set(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn('LocalStorage non disponible');
                }
            },
            get(key, defaultValue = null) {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : defaultValue;
                } catch (e) {
                    return defaultValue;
                }
            },
            remove(key) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn('LocalStorage non disponible');
                }
            }
        }
    };

    // ============================================
    // GESTION DU MENU MOBILE
    // ============================================
    function initMobileMenu() {
        if (!DOM.menuToggle || !DOM.navMenu) return;

        // Toggle menu
        DOM.menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            DOM.navMenu.classList.toggle('active');
            DOM.menuToggle.classList.toggle('active');
            State.isMenuOpen = DOM.navMenu.classList.contains('active');
            
            // Animation du hamburger
            const icon = DOM.menuToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            }
            
            // Empêcher le scroll du body quand le menu est ouvert
            document.body.style.overflow = State.isMenuOpen ? 'hidden' : '';
        });

        // Fermer le menu en cliquant à l'extérieur
        document.addEventListener('click', (e) => {
            if (State.isMenuOpen && !DOM.navMenu.contains(e.target) && !DOM.menuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Fermer le menu lors du redimensionnement (si > 900px)
        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > 900 && State.isMenuOpen) {
                closeMenu();
            }
        }, 150));

        // Fermer le menu lors du scroll
        window.addEventListener('scroll', Utils.throttle(() => {
            if (State.isMenuOpen) {
                closeMenu();
            }
        }, 100));
    }

    function closeMenu() {
        if (!DOM.navMenu || !DOM.menuToggle) return;
        
        DOM.navMenu.classList.remove('active');
        DOM.menuToggle.classList.remove('active');
        State.isMenuOpen = false;
        document.body.style.overflow = '';
        
        const icon = DOM.menuToggle.querySelector('i');
        if (icon) {
            icon.classList.add('fa-bars');
            icon.classList.remove('fa-times');
        }
    }

    // ============================================
    // ANIMATIONS AU SCROLL (Reveal)
    // ============================================
    function initRevealAnimations() {
        const allReveals = [
            ...DOM.reveals,
            ...DOM.revealsLeft,
            ...DOM.revealsRight,
            ...DOM.revealsScale
        ];

        if (allReveals.length === 0) return;

        // Observer pour les animations au scroll
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    
                    // Optionnel: arrêter d'observer après l'animation
                    // revealObserver.unobserve(entry.target);
                } else {
                    // Optionnel: retirer la classe quand l'élément sort du viewport
                    // entry.target.classList.remove('visible');
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        allReveals.forEach(el => revealObserver.observe(el));
        
        // Vérification initiale
        checkReveals();
    }

    function checkReveals() {
        const allReveals = [
            ...DOM.reveals,
            ...DOM.revealsLeft,
            ...DOM.revealsRight,
            ...DOM.revealsScale
        ];

        allReveals.forEach(item => {
            if (Utils.isElementInViewport(item, 100)) {
                item.classList.add('visible');
            }
        });
    }

    // ============================================
    // EFFET PARALLAX
    // ============================================
    function initParallax() {
        if (!DOM.parallax) return;

        const updateParallax = () => {
            if (State.isAnimating) return;
            
            State.isAnimating = true;
            requestAnimationFrame(() => {
                const offset = window.scrollY * 0.25;
                DOM.parallax.style.backgroundPosition = `center calc(50% + ${offset}px)`;
                State.isAnimating = false;
            });
        };

        window.addEventListener('scroll', Utils.throttle(updateParallax, 16));
    }

    // ============================================
    // HEADER SCROLL
    // ============================================
    function initHeaderScroll() {
        if (!DOM.header) return;

        const updateHeader = () => {
            const currentScrollY = window.scrollY;
            
            // Direction du scroll
            State.scrollDirection = currentScrollY > State.lastScrollY ? 'down' : 'up';
            
            // Ajouter/supprimer la classe scrolled
            if (currentScrollY > 50) {
                DOM.header.classList.add('scrolled');
            } else {
                DOM.header.classList.remove('scrolled');
            }
            
            // Cacher/montrer le header selon la direction du scroll
            if (currentScrollY > 300) {
                if (State.scrollDirection === 'down' && !State.isMenuOpen) {
                    DOM.header.style.transform = 'translateY(-100%)';
                } else {
                    DOM.header.style.transform = 'translateY(0)';
                }
            } else {
                DOM.header.style.transform = 'translateY(0)';
            }
            
            State.lastScrollY = currentScrollY;
            State.scrollY = currentScrollY;
        };

        window.addEventListener('scroll', Utils.throttle(updateHeader, 50));
        updateHeader();
    }

    // ============================================
    // BOUTON RETOUR EN HAUT
    // ============================================
    function initBackToTop() {
        const button = DOM.backToTop || createBackToTopButton();
        
        const toggleButton = () => {
            if (window.scrollY > 400) {
                button.classList.add('visible');
            } else {
                button.classList.remove('visible');
            }
        };

        button.addEventListener('click', (e) => {
            e.preventDefault();
            Utils.smoothScrollTo(0, 800);
        });

        window.addEventListener('scroll', Utils.throttle(toggleButton, 100));
        toggleButton();
    }

    function createBackToTopButton() {
        const button = document.createElement('button');
        button.className = 'back-to-top';
        button.setAttribute('aria-label', 'Retour en haut');
        button.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
        
        // Styles inline
        Object.assign(button.style, {
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'var(--blue-dark)',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            opacity: '0',
            visibility: 'hidden',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
            zIndex: '998',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
        });

        document.body.appendChild(button);
        
        // Ajouter la classe visible
        const style = document.createElement('style');
        style.textContent = `
            .back-to-top.visible {
                opacity: 1 !important;
                visibility: visible !important;
            }
            .back-to-top:hover {
                background: var(--orange) !important;
                transform: translateY(-5px) !important;
                box-shadow: 0 8px 25px rgba(249, 107, 29, 0.3) !important;
            }
        `;
        document.head.appendChild(style);
        
        return button;
    }

    // ============================================
    // MODALS
    // ============================================
    function initModals() {
        // Ouvrir modal
        DOM.modalTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                const modal = document.getElementById(modalId);
                if (modal) {
                    openModal(modal);
                }
            });
        });

        // Fermer modal
        DOM.modalCloses.forEach(close => {
            close.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = close.closest('.modal-overlay') || close.closest('.modal');
                if (modal) {
                    closeModal(modal);
                }
            });
        });

        // Fermer en cliquant sur l'overlay
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                closeModal(e.target);
            }
        });

        // Fermer avec Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && State.activeModal) {
                closeModal(State.activeModal);
            }
        });
    }

    function openModal(modal) {
        const overlay = modal.classList.contains('modal-overlay') ? modal : modal.closest('.modal-overlay');
        if (!overlay) return;
        
        overlay.classList.add('active');
        State.activeModal = overlay;
        document.body.style.overflow = 'hidden';
        
        // Focus sur le premier champ input
        const firstInput = overlay.querySelector('input, textarea, select, button:not(.modal-close)');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }

    function closeModal(modal) {
        const overlay = modal.classList.contains('modal-overlay') ? modal : modal.closest('.modal-overlay');
        if (!overlay) return;
        
        overlay.classList.remove('active');
        State.activeModal = null;
        document.body.style.overflow = '';
    }

    // ============================================
    // TABS
    // ============================================
    function initTabs() {
        DOM.tabContainers.forEach(container => {
            const tabs = container.querySelectorAll('[data-tab]');
            const panes = container.querySelectorAll('[data-tab-pane]');
            
            tabs.forEach(tab => {
                tab.addEventListener('click', () => {
                    const tabId = tab.dataset.tab;
                    
                    // Désactiver tous les tabs
                    tabs.forEach(t => t.classList.remove('active'));
                    panes.forEach(p => p.classList.remove('active'));
                    
                    // Activer le tab sélectionné
                    tab.classList.add('active');
                    const activePane = container.querySelector(`[data-tab-pane="${tabId}"]`);
                    if (activePane) {
                        activePane.classList.add('active');
                    }
                });
            });
        });
    }

    // ============================================
    // ACCORDIONS
    // ============================================
    function initAccordions() {
        DOM.accordions.forEach(accordion => {
            const items = accordion.querySelectorAll('.accordion-item');
            
            items.forEach(item => {
                const header = item.querySelector('.accordion-header');
                if (!header) return;
                
                header.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Fermer tous les autres items si l'accordion est en mode "single"
                    if (accordion.dataset.accordion === 'single' && !isActive) {
                        items.forEach(i => i.classList.remove('active'));
                    }
                    
                    // Toggle l'item courant
                    item.classList.toggle('active');
                });
            });
        });
    }

    // ============================================
    // FORMULAIRES
    // ============================================
    function initForms() {
        DOM.forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            
            // Validation en temps réel
            inputs.forEach(input => {
                input.addEventListener('blur', () => validateField(input));
                input.addEventListener('input', () => {
                    if (input.classList.contains('error')) {
                        validateField(input);
                    }
                });
            });
            
            // Soumission du formulaire
            form.addEventListener('submit', (e) => {
                let isValid = true;
                
                inputs.forEach(input => {
                    if (!validateField(input)) {
                        isValid = false;
                    }
                });
                
                if (!isValid) {
                    e.preventDefault();
                    showToast('Veuillez corriger les erreurs du formulaire.', 'error', 'Erreur');
                }
            });
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const formGroup = field.closest('.form-group');
        const errorElement = formGroup?.querySelector('.error-message') || createErrorElement(formGroup);
        
        let isValid = true;
        let errorMessage = '';
        
        // Validation required
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'Ce champ est requis.';
        }
        
        // Validation email
        if (field.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer une adresse email valide.';
        }
        
        // Validation tel
        if (field.type === 'tel' && value && !/^[\d\s\-+()]{10,}$/.test(value)) {
            isValid = false;
            errorMessage = 'Veuillez entrer un numéro de téléphone valide.';
        }
        
        // Validation minlength
        const minLength = field.dataset.minLength || field.getAttribute('minlength');
        if (minLength && value.length < parseInt(minLength)) {
            isValid = false;
            errorMessage = `Minimum ${minLength} caractères requis.`;
        }
        
        // Validation maxlength
        const maxLength = field.dataset.maxLength || field.getAttribute('maxlength');
        if (maxLength && value.length > parseInt(maxLength)) {
            isValid = false;
            errorMessage = `Maximum ${maxLength} caractères autorisés.`;
        }
        
        // Mise à jour de l'interface
        if (!isValid) {
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'flex';
        } else {
            field.classList.remove('error');
            errorElement.style.display = 'none';
        }
        
        return isValid;
    }

    function createErrorElement(formGroup) {
        if (!formGroup) return null;
        
        const errorEl = document.createElement('div');
        errorEl.className = 'error-message';
        errorEl.innerHTML = '<i class="fa-solid fa-circle-exclamation"></i><span></span>';
        formGroup.appendChild(errorEl);
        return errorEl;
    }

    // ============================================
    // TOAST NOTIFICATIONS
    // ============================================
    function showToast(message, type = 'info', title = '') {
        const container = DOM.toastContainer || createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        
        const icons = {
            success: 'fa-circle-check',
            error: 'fa-circle-exclamation',
            warning: 'fa-triangle-exclamation',
            info: 'fa-circle-info'
        };
        
        const titles = {
            success: title || 'Succès',
            error: title || 'Erreur',
            warning: title || 'Attention',
            info: title || 'Information'
        };
        
        toast.innerHTML = `
            <i class="fa-solid ${icons[type] || icons.info}"></i>
            <div class="toast-content">
                <div class="toast-title">${titles[type]}</div>
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" aria-label="Fermer">
                <i class="fa-solid fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Fermer le toast
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => removeToast(toast));
        
        // Auto-fermeture après 5 secondes
        setTimeout(() => removeToast(toast), 5000);
    }

    function createToastContainer() {
        const container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
        DOM.toastContainer = container;
        return container;
    }

    function removeToast(toast) {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }

    // ============================================
    // DROPDOWNS
    // ============================================
    function initDropdowns() {
        DOM.dropdowns.forEach(dropdown => {
            const trigger = dropdown.querySelector('[data-dropdown-trigger]');
            const menu = dropdown.querySelector('[data-dropdown-menu]');
            
            if (!trigger || !menu) return;
            
            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Fermer les autres dropdowns
                document.querySelectorAll('[data-dropdown-menu].active').forEach(m => {
                    if (m !== menu) m.classList.remove('active');
                });
                
                menu.classList.toggle('active');
            });
        });
        
        // Fermer les dropdowns en cliquant à l'extérieur
        document.addEventListener('click', () => {
            document.querySelectorAll('[data-dropdown-menu].active').forEach(menu => {
                menu.classList.remove('active');
            });
        });
    }

    // ============================================
    // COMPTEURS (Animation de chiffres)
    // ============================================
    function initCounters() {
        if (DOM.counters.length === 0) return;
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    animateCounter(counter);
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        DOM.counters.forEach(counter => counterObserver.observe(counter));
    }

    function animateCounter(counter) {
        const target = parseInt(counter.dataset.counter) || 0;
        const duration = parseInt(counter.dataset.duration) || 2000;
        const suffix = counter.dataset.suffix || '';
        const prefix = counter.dataset.prefix || '';
        
        let start = 0;
        const increment = target / (duration / 16);
        const startTime = performance.now();
        
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const value = Math.floor(progress * target);
            
            counter.textContent = prefix + value + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                counter.textContent = prefix + target + suffix;
            }
        }
        
        requestAnimationFrame(update);
    }

    // ============================================
    // TOOLTIPS
    // ============================================
    function initTooltips() {
        DOM.tooltips.forEach(element => {
            const text = element.dataset.tooltip;
            if (!text) return;
            
            element.classList.add('tooltip');
            
            const tooltipText = document.createElement('span');
            tooltipText.className = 'tooltip-text';
            tooltipText.textContent = text;
            element.appendChild(tooltipText);
        });
    }

    // ============================================
    // LAZY LOADING DES IMAGES
    // ============================================
    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if (images.length === 0) return;
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '50px' });
        
        images.forEach(img => imageObserver.observe(img));
    }

    // ============================================
    // SMOOTH SCROLL POUR LES ANCRES
    // ============================================
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                const target = document.querySelector(href);
                
                if (target) {
                    e.preventDefault();
                    Utils.smoothScrollTo(target, 800);
                    
                    // Mettre à jour l'URL sans sauter
                    history.pushState(null, null, href);
                    
                    // Fermer le menu mobile si ouvert
                    if (State.isMenuOpen) {
                        closeMenu();
                    }
                }
            });
        });
    }

    // ============================================
    // GESTION DU THÈME (DARK/LIGHT)
    // ============================================
    function initTheme() {
        const themeToggle = document.querySelector('[data-theme-toggle]');
        if (!themeToggle) return;
        
        const savedTheme = Utils.storage.get('theme', 'light');
        applyTheme(savedTheme);
        
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            applyTheme(newTheme);
            Utils.storage.set('theme', newTheme);
        });
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        
        const icon = document.querySelector('[data-theme-toggle] i');
        if (icon) {
            icon.className = theme === 'light' ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
        }
    }

    // ============================================
    // DÉTECTION DE L'APPAREIL
    // ============================================
    function detectDevice() {
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        
        document.documentElement.classList.toggle('is-mobile', isMobile);
        document.documentElement.classList.toggle('is-touch', isTouch);
        
        return { isMobile, isTouch };
    }

    // ============================================
    // GESTION DES ERREURS GLOBALES
    // ============================================
    function initErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Erreur globale:', e.error);
            // Possibilité d'envoyer à un service de monitoring
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Promesse non gérée:', e.reason);
        });
    }

    // ============================================
    // INITIALISATION PRINCIPALE
    // ============================================
    function init() {
        // Détection de l'appareil
        detectDevice();
        
        // Initialisation des composants
        initMobileMenu();
        initRevealAnimations();
        initParallax();
        initHeaderScroll();
        initBackToTop();
        initModals();
        initTabs();
        initAccordions();
        initForms();
        initDropdowns();
        initCounters();
        initTooltips();
        initLazyLoading();
        initSmoothScroll();
        initTheme();
        initErrorHandling();
        
        // Exposer les fonctions utiles globalement
        window.ImmobilierEther = {
            showToast,
            openModal,
            closeModal,
            Utils
        };
        
        console.log('✅ Immobilier Ether - Scripts chargés avec succès');
    }

    // ============================================
    // DÉMARRAGE
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
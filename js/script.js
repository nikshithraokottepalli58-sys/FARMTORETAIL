// Global Variables
let currentUser = null;
let notifications = [];
let isLoggedIn = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    startStatsAnimation();
    loadWeatherData();
    checkUserSession();
    initializeFormValidation();
});

// Initialize application
function initializeApp() {
    console.log('AgriConnect Platform Initialized');
    
    // Add smooth scrolling for standard in-page links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return; // allow JS-handled links
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Add scroll effect to navbar
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Navigation Functions
function navigateTo(page) {
    if (!isLoggedIn) {
        showMessage('Please login to access this feature.', 'warning');
        openLogin();
        return;
    }
    window.location.href = `pages/${page}`;
}

// Reveal hidden sections like About/Contact on demand
function revealSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.remove('d-none');
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function openLogin() {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    clearFormErrors();
}  

function openRegister() {
    const registerModal = new bootstrap.Modal(document.getElementById('registerModal'));
    registerModal.show();
    clearFormErrors();
}

function switchToRegister() {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
    loginModal.hide();
    setTimeout(() => {
        openRegister();
    }, 300);
}

function switchToLogin() {
    const registerModal = bootstrap.Modal.getInstance(document.getElementById('registerModal'));
    registerModal.hide();
    setTimeout(() => {
        openLogin();
    }, 300);
}

// Authentication Functions
function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const loginData = {
        userType: formData.get('userType'),
        email: formData.get('email'),
        password: formData.get('password'),
        rememberMe: formData.get('rememberMe')
    };

    // Validate form data
    if (!loginData.userType || !loginData.email || !loginData.password) {
        showError('loginError', 'Please fill in all required fields.');
        return;
    }

    // Show loading state
    showLoadingState('login', true);

    // Simulate API call
    setTimeout(() => {
        // Mock authentication logic
        if (authenticateUser(loginData)) {
            // Store user session
            currentUser = {
                email: loginData.email,
                userType: loginData.userType,
                loginTime: new Date().toISOString()
            };
            
            // Store in localStorage if remember me is checked
            if (loginData.rememberMe) {
                localStorage.setItem('agriconnect_user', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('agriconnect_user', JSON.stringify(currentUser));
            }
            
            isLoggedIn = true;
            showSuccess('loginSuccess', 'Login successful! Welcome to AgriConnect.');
            
            // Update UI
            updateLoginUI();
            
            // Close modal after delay
            setTimeout(() => {
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                loginModal.hide();
                clearFormErrors();
                form.reset();
            }, 1500);
            
        } else {
            showError('loginError', 'Invalid email or password. Please try again.');
        }
        
        showLoadingState('login', false);
    }, 1500);
}

function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    const registerData = {
        fullName: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        userType: formData.get('userType'),
        state: formData.get('state'),
        district: formData.get('district'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
        agreeTerms: formData.get('agreeTerms')
    };

    // Validate form data
    if (!validateRegistrationData(registerData)) {
        return;
    }

    // Show loading state
    showLoadingState('register', true);

    // Simulate API call
    setTimeout(() => {
        // Mock registration logic
        if (registerUser(registerData)) {
            showSuccess('registerSuccess', 'Registration successful! Please login to continue.');
            
            // Clear form and switch to login after delay
            setTimeout(() => {
                form.reset();
                switchToLogin();
            }, 2000);
            
        } else {
            showError('registerError', 'Registration failed. Email might already be in use.');
        }
        
        showLoadingState('register', false);
    }, 2000);
}

// Mock Authentication Functions
function authenticateUser(loginData) {
    // In a real application, this would make an API call to your backend
    // For demo purposes, we'll accept any valid email format
    const validEmails = [
        'farmer@test.com',
        'trader@test.com', 
        'buyer@test.com',
        'landowner@test.com',
        'laborer@test.com',
        'demo@agriconnect.com'
    ];
    
    return validEmails.includes(loginData.email) || loginData.email.includes('@');
}

function registerUser(registerData) {
    // In a real application, this would make an API call to your backend
    // For demo purposes, we'll return true for valid data
    return true;
}

// Validation Functions
function validateRegistrationData(data) {
    // Check required fields
    const requiredFields = ['fullName', 'email', 'phone', 'userType', 'state', 'district', 'password', 'confirmPassword'];
    for (let field of requiredFields) {
        if (!data[field]) {
            showError('registerError', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}.`);
            return false;
        }
    }

    // Validate email
    if (!isValidEmail(data.email)) {
        showError('registerError', 'Please enter a valid email address.');
        return false;
    }

    // Validate phone
    if (!isValidPhone(data.phone)) {
        showError('registerError', 'Please enter a valid 10-digit phone number.');
        return false;
    }

    // Validate password
    if (data.password.length < 6) {
        showError('registerError', 'Password must be at least 6 characters long.');
        return false;
    }

    // Check password confirmation
    if (data.password !== data.confirmPassword) {
        showError('registerError', 'Passwords do not match.');
        return false;
    }

    // Check terms agreement
    if (!data.agreeTerms) {
        showError('registerError', 'Please agree to the Terms of Service and Privacy Policy.');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
}

// UI Helper Functions
function showLoadingState(type, isLoading) {
    const button = document.getElementById(`${type}Btn`);
    const textSpan = button.querySelector(`.${type}-text`);
    const spinnerSpan = button.querySelector(`.${type}-spinner`);
    
    if (isLoading) {
        button.disabled = true;
        textSpan.classList.add('d-none');
        spinnerSpan.classList.remove('d-none');
    } else {
        button.disabled = false;
        textSpan.classList.remove('d-none');
        spinnerSpan.classList.add('d-none');
    }
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
        
        // Hide success message if visible
        const successElement = document.getElementById(elementId.replace('Error', 'Success'));
        if (successElement) {
            successElement.classList.add('d-none');
        }
    }
}

function showSuccess(elementId, message) {
    const successElement = document.getElementById(elementId);
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('d-none');
        
        // Hide error message if visible
        const errorElement = document.getElementById(elementId.replace('Success', 'Error'));
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
    }
}

function clearFormErrors() {
    const errorElements = document.querySelectorAll('.alert');
    errorElements.forEach(element => {
        element.classList.add('d-none');
    });
}

function showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    toast.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Session Management
function checkUserSession() {
    const storedUser = localStorage.getItem('agriconnect_user') || sessionStorage.getItem('agriconnect_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        isLoggedIn = true;
        updateLoginUI();
    }
}

function updateLoginUI() {
    const loginButton = document.querySelector('button[onclick="openLogin()"]');
    if (loginButton && currentUser) {
        loginButton.textContent = `Welcome, ${currentUser.userType}`;
        loginButton.onclick = showUserMenu;
        
        // Add logout option
        const logoutButton = document.createElement('button');
        logoutButton.className = 'btn btn-outline-light ms-2';
        logoutButton.textContent = 'Logout';
        logoutButton.onclick = logout;
        loginButton.parentNode.appendChild(logoutButton);
    }
}

function logout() {
    localStorage.removeItem('agriconnect_user');
    sessionStorage.removeItem('agriconnect_user');
    currentUser = null;
    isLoggedIn = false;
    location.reload();
}

function showUserMenu() {
    // Create user menu dropdown
    const menu = document.createElement('div');
    menu.className = 'dropdown-menu show position-absolute';
    menu.style.cssText = 'top: 100%; right: 0;';
    menu.innerHTML = `
        <a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a>
        <a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a>
        <div class="dropdown-divider"></div>
        <a class="dropdown-item" href="#" onclick="logout()"><i class="fas fa-sign-out-alt me-2"></i>Logout</a>
    `;
    
    // Remove existing menu
    const existingMenu = document.querySelector('.dropdown-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu() {
            menu.remove();
            document.removeEventListener('click', closeMenu);
        });
    }, 100);
}

// Form Validation Enhancement
function initializeFormValidation() {
    // Real-time password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    const password = document.getElementById('registerPassword');
    
    if (confirmPassword && password) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && this.value !== password.value) {
                this.setCustomValidity('Passwords do not match');
                this.classList.add('is-invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
            }
        });
    }
    
    // Email validation
    const emailInputs = document.querySelectorAll('input[type="email"]');
    emailInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.setCustomValidity('Please enter a valid email address');
                this.classList.add('is-invalid');
            } else {
                this.setCustomValidity('');
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Phone validation
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').slice(0, 10);
            if (this.value.length === 10) {
                this.classList.remove('is-invalid');
                this.classList.add('is-valid');
            } else {
                this.classList.remove('is-valid');
            }
        });
    }
}

// Stats Animation
function startStatsAnimation() {
    const stats = document.querySelectorAll('[data-count]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Weather Data (Mock)
function loadWeatherData() {
    // Mock weather data - in real app, this would call a weather API
    const weatherData = {
        temperature: '28°C',
        condition: 'Sunny',
        humidity: '65%',
        windSpeed: '12 km/h',
        forecast: 'Good for farming activities'
    };
    
    // You can use this data to update weather widgets
    console.log('Weather data loaded:', weatherData);
}

// Forgot Password Function
function showForgotPassword() {
    const email = prompt('Please enter your email address:');
    if (email && isValidEmail(email)) {
        showMessage('Password reset link has been sent to your email.', 'success');
    } else if (email) {
        showMessage('Please enter a valid email address.', 'danger');
    }
}

// Initialize tooltips and popovers if using Bootstrap
function initializeBootstrapComponents() {
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

// Call initialization when DOM is ready
document.addEventListener('DOMContentLoaded', initializeBootstrapComponents);
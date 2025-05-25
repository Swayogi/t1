// frontend/js/auth.js
document.addEventListener('DOMContentLoaded', () => {
    const messageDiv = document.getElementById('message'); // Common message div

    // --- REGISTRATION LOGIC ---
    const registerForm = document.querySelector('form#registerForm'); 
    if (registerForm && window.location.pathname.includes('register.html')) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            if (messageDiv) messageDiv.innerHTML = ''; 
            if (messageDiv) messageDiv.className = 'mb-3';

            const username = registerForm.querySelector('#username').value; // Scoped query
            const email = registerForm.querySelector('#email').value;     // Scoped query
            const password = registerForm.querySelector('#password').value; // Scoped query
            const confirmPassword = registerForm.querySelector('#confirmPassword').value; // Scoped query

            if (password !== confirmPassword) {
                if (messageDiv) {
                    messageDiv.textContent = 'Passwords do not match!';
                    messageDiv.className = 'alert alert-danger'; 
                }
                return;
            }

            try {
                if (!window.apiService || typeof window.apiService.post !== 'function') {
                    throw new Error('ApiService not available for registration.');
                }
                const data = await window.apiService.post('/auth/register', { username, email, password }); 
                
                if (messageDiv) {
                    messageDiv.textContent = 'Registration successful! Please login.';
                    messageDiv.className = 'alert alert-success';
                }
                registerForm.reset(); 

            } catch (error) {
                let errorMessage = 'Registration failed. Please try again.';
                if (error.data && error.data.errors && error.data.errors.length > 0) {
                    errorMessage = error.data.errors.map(err => err.msg).join(' ');
                } else if (error.data && error.data.msg) {
                    errorMessage = error.data.msg;
                }
                
                if (messageDiv) {
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'alert alert-danger';
                }
                console.error('Registration error:', error);
            }
        });
    }

    // --- LOGIN LOGIC ---
    const loginForm = document.querySelector('form#loginForm'); 
    if (loginForm && window.location.pathname.includes('login.html')) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault(); 

            if (messageDiv) messageDiv.innerHTML = ''; 
            if (messageDiv) messageDiv.className = 'mb-3';

            const email = loginForm.querySelector('#email').value;     // Scoped query
            const password = loginForm.querySelector('#password').value; // Scoped query

            try {
                if (!window.apiService || typeof window.apiService.post !== 'function' || typeof window.apiService.storeToken !== 'function') {
                    throw new Error('ApiService not available for login. Ensure js/apiService.js is loaded correctly and exposes functions on window.apiService.');
                }
                
                const data = await window.apiService.post('/auth/login', { email, password });
                
                if (data.token) {
                    window.apiService.storeToken(data.token);
                    if (messageDiv) {
                        messageDiv.textContent = 'Login successful! Redirecting to dashboard...';
                        messageDiv.className = 'alert alert-success';
                    }
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000); 
                } else {
                    throw new Error('Login successful, but no token received.');
                }

            } catch (error) {
                let errorMessage = 'Login failed. Please check your credentials or try again.';
                if (error.data && error.data.errors && error.data.errors.length > 0) {
                    errorMessage = error.data.errors.map(err => err.msg).join(' ');
                } else if (error.data && error.data.msg) {
                    errorMessage = error.data.msg; 
                }
                
                if (messageDiv) {
                    messageDiv.textContent = errorMessage;
                    messageDiv.className = 'alert alert-danger';
                }
                console.error('Login error:', error);
            }
        });
    }
});

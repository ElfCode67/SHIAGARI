// Add to the top of each JS file (landing.js, idea.js, etc.)
async function checkAuth() {
    try {
        const response = await fetch('../auth/check_session.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            window.location.href = '../index.php';
        }
    } catch (error) {
        window.location.href = '../index.php';
    }
}

// Call this when page loads
checkAuth();
// SHIAGARI - Authentication JavaScript

// Toggle between login and signup forms
document.getElementById('showSignup')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
});

document.getElementById('showLogin')?.addEventListener('click', (e) => {
    e.preventDefault();
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
});

// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            btn.classList.remove('fa-eye-slash');
            btn.classList.add('fa-eye');
        } else {
            input.type = 'password';
            btn.classList.remove('fa-eye');
            btn.classList.add('fa-eye-slash');
        }
    });
});

// Show toast notification
let toastTimeout = null;

function showToast(message, isError = false) {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    const icon = toast.querySelector('i');
    
    toastText.textContent = message;
    if (isError) {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#f97316';
        toast.style.borderLeftColor = '#f97316';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#10b981';
        toast.style.borderLeftColor = '#10b981';
    }
    
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Handle Login
document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const login = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    if (!login || !password) {
        showToast('Please fill in all fields', true);
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('login', login);
        formData.append('password', password);
        
        const response = await fetch('auth/login.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message);
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showToast(data.message, true);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        showToast('Connection error. Please try again.', true);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Handle Signup
document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const full_name = document.getElementById('signupFullName').value;
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirm_password = document.getElementById('signupConfirmPassword').value;
    
    if (!full_name || !username || !email || !password || !confirm_password) {
        showToast('Please fill in all fields', true);
        return;
    }
    
    if (password !== confirm_password) {
        showToast('Passwords do not match', true);
        return;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters', true);
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    submitBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('full_name', full_name);
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password);
        formData.append('confirm_password', confirm_password);
        
        const response = await fetch('auth/register.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message);
            setTimeout(() => {
                window.location.href = 'dashboard.php';
            }, 1500);
        } else {
            showToast(data.message, true);
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    } catch (error) {
        showToast('Connection error. Please try again.', true);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
});

// Enter key to submit
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const form = input.closest('form');
            if (form) form.dispatchEvent(new Event('submit'));
        }
    });
});
<?php
require_once 'config/database.php';

if (isset($_SESSION['user_id']) && isset($_SESSION['logged_in'])) {
    header('Location: dashboard.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHIAGARI · Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: linear-gradient(135deg, #0b1626 0%, #0a0f1c 100%);
            font-family: 'Inter', sans-serif;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .auth-container { width: 100%; max-width: 460px; }
        .auth-card {
            background: #0f172a;
            border-radius: 32px;
            padding: 48px 40px;
            box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
            border: 1px solid rgba(59,130,246,0.2);
        }
        .auth-header { text-align: center; margin-bottom: 40px; }
        .auth-header h1 {
            font-size: 36px;
            font-weight: 800;
            background: linear-gradient(135deg, #FFFFFF 0%, #94a3b8 100%);
            background-clip: text;
            -webkit-background-clip: text;
            color: transparent;
        }
        .auth-header p { color: #6b7280; font-size: 14px; margin-top: 8px; }
        .auth-form h2 {
            font-size: 24px;
            font-weight: 600;
            color: #e2e8f0;
            margin-bottom: 24px;
            text-align: center;
        }
        .input-group {
            position: relative;
            margin-bottom: 20px;
        }
        .input-group i:first-child {
            position: absolute;
            left: 16px;
            top: 50%;
            transform: translateY(-50%);
            color: #6b7280;
        }
        .input-group input {
            width: 100%;
            padding: 14px 16px 14px 46px;
            background: #1e293b;
            border: 1px solid #2d3a5e;
            border-radius: 16px;
            color: #e2e8f0;
            font-size: 14px;
        }
        .input-group input:focus {
            outline: none;
            border-color: #3b82f6;
        }
        .auth-btn {
            width: 100%;
            padding: 14px;
            background: #3b82f6;
            border: none;
            border-radius: 16px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            margin-top: 8px;
        }
        .auth-btn:hover { background: #2563eb; }
        .auth-switch {
            text-align: center;
            margin-top: 24px;
            color: #6b7280;
            font-size: 14px;
        }
        .auth-switch a { color: #3b82f6; text-decoration: none; }
        .toast {
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #1e293b;
            padding: 12px 20px;
            border-radius: 40px;
            display: flex;
            align-items: center;
            gap: 10px;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            z-index: 1100;
        }
        .toast.show { transform: translateX(0); }
    </style>
</head>
<body>
<div class="auth-container">
    <div class="auth-card">
        <div class="auth-header">
            <h1>SHIAGARI</h1>
            <p>Rise to the challenge</p>
        </div>

        <div id="loginForm" class="auth-form">
            <h2>Welcome Back</h2>
            <form id="loginFormElement">
                <div class="input-group">
                    <i class="fas fa-envelope"></i>
                    <input type="text" id="loginEmail" placeholder="Email or Username" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="loginPassword" placeholder="Password" required>
                </div>
                <button type="submit" class="auth-btn">Login</button>
            </form>
            <p class="auth-switch">Don't have an account? <a href="#" id="showSignup">Sign up</a></p>
        </div>

        <div id="signupForm" class="auth-form" style="display: none;">
            <h2>Create Account</h2>
            <form id="signupFormElement">
                <div class="input-group">
                    <i class="fas fa-user"></i>
                    <input type="text" id="signupFullName" placeholder="Full Name" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-at"></i>
                    <input type="text" id="signupUsername" placeholder="Username" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-envelope"></i>
                    <input type="email" id="signupEmail" placeholder="Email" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="signupPassword" placeholder="Password" required>
                </div>
                <div class="input-group">
                    <i class="fas fa-lock"></i>
                    <input type="password" id="signupConfirmPassword" placeholder="Confirm Password" required>
                </div>
                <button type="submit" class="auth-btn">Sign Up</button>
            </form>
            <p class="auth-switch">Already have an account? <a href="#" id="showLogin">Login</a></p>
        </div>
    </div>
</div>

<div class="toast" id="toastMsg"><i class="fas fa-check-circle"></i><span id="toastText"></span></div>

<script>
function showToast(message, isError = false) {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

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

document.getElementById('loginFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('login', document.getElementById('loginEmail').value);
    formData.append('password', document.getElementById('loginPassword').value);
    
    const response = await fetch('auth/login.php', { method: 'POST', body: formData });
    const data = await response.json();
    
    if (data.success) {
        showToast(data.message);
        setTimeout(() => window.location.href = 'dashboard.php', 1000);
    } else {
        showToast(data.message, true);
    }
});

document.getElementById('signupFormElement')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('full_name', document.getElementById('signupFullName').value);
    formData.append('username', document.getElementById('signupUsername').value);
    formData.append('email', document.getElementById('signupEmail').value);
    formData.append('password', document.getElementById('signupPassword').value);
    formData.append('confirm_password', document.getElementById('signupConfirmPassword').value);
    
    const response = await fetch('auth/register.php', { method: 'POST', body: formData });
    const data = await response.json();
    
    if (data.success) {
        showToast(data.message);
        setTimeout(() => window.location.href = 'dashboard.php', 1000);
    } else {
        showToast(data.message, true);
    }
});
</script>
</body>
</html>
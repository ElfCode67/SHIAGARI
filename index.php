<?php
require_once 'config/database.php';

// If already logged in, redirect to dashboard
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
    <title>SHIAGARI · Login / Sign Up</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="css/auth.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="auth-header">
                <h1>SHIAGARI</h1>
                <p>Rise to the challenge</p>
            </div>

            <!-- Login Form -->
            <div class="auth-form" id="loginForm">
                <h2><i class="fas fa-sign-in-alt"></i> Welcome Back</h2>
                <form id="loginFormElement">
                    <div class="input-group">
                        <i class="fas fa-envelope"></i>
                        <input type="text" id="loginEmail" placeholder="Email or Username" required>
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="loginPassword" placeholder="Password" required>
                        <i class="fas fa-eye-slash toggle-password" data-target="loginPassword"></i>
                    </div>
                    <button type="submit" class="auth-btn">Login</button>
                </form>
                <p class="auth-switch">
                    Don't have an account? <a href="#" id="showSignup">Sign up</a>
                </p>
            </div>

            <!-- Signup Form -->
            <div class="auth-form" id="signupForm" style="display: none;">
                <h2><i class="fas fa-user-plus"></i> Create Account</h2>
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
                        <i class="fas fa-eye-slash toggle-password" data-target="signupPassword"></i>
                    </div>
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" id="signupConfirmPassword" placeholder="Confirm Password" required>
                        <i class="fas fa-eye-slash toggle-password" data-target="signupConfirmPassword"></i>
                    </div>
                    <button type="submit" class="auth-btn">Sign Up</button>
                </form>
                <p class="auth-switch">
                    Already have an account? <a href="#" id="showLogin">Login</a>
                </p>
            </div>

            <div class="auth-footer">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
            </div>
        </div>
    </div>

    <!-- Toast Notification -->
    <div class="toast" id="toastMsg">
        <i class="fas fa-check-circle"></i>
        <span id="toastText">Message</span>
    </div>

    <script src="js/auth.js"></script>
</body>
</html>
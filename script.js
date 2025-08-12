// Configuration - Update these values with your actual WhatsApp group link and Google Drive download link
const CONFIG = {
    whatsappGroupLink: "https://chat.whatsapp.com/KE4EhL007X66Zf0HYezMH8", // Replace with your actual WhatsApp group invite link
    driveDownloadLink: "https://drive.google.com/drive/folders/1xAYgMPgPKLYW-s48UCGJZ2_knb0YEmJA?usp=drive_link", // Replace with your actual Google Drive link
    groupName: "Your Group Name" // Replace with your actual group name
};

// Database for storing user data
let userDatabase = [];

// DOM elements
const whatsappBtn = document.getElementById('whatsapp-btn');
const downloadSection = document.getElementById('download-section');
const downloadLinkInput = document.getElementById('download-link');
const copyBtn = document.getElementById('copy-btn');
const downloadBtn = document.getElementById('download-btn');
const userNameInput = document.getElementById('user-name');
const userPhoneInput = document.getElementById('user-phone');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Load existing database from localStorage
    loadUserDatabase();
    
    // Set the download link
    downloadLinkInput.value = CONFIG.driveDownloadLink;
    downloadBtn.href = CONFIG.driveDownloadLink;
    
    // Add click event to WhatsApp button
    whatsappBtn.addEventListener('click', handleWhatsAppClick);
    
    // Add click event to copy button
    copyBtn.addEventListener('click', handleCopyClick);
    
    // Add input validation for form fields
    userNameInput.addEventListener('input', validateForm);
    userPhoneInput.addEventListener('input', validateForm);
    
    // Reset user joined status every time page loads
    localStorage.removeItem('whatsappGroupJoined');
    
    // Add export button to page
    addExportButton();
});

// Load user database from localStorage
function loadUserDatabase() {
    const savedData = localStorage.getItem('userDatabase');
    if (savedData) {
        userDatabase = JSON.parse(savedData);
    }
}

// Save user database to localStorage
function saveUserDatabase() {
    localStorage.setItem('userDatabase', JSON.stringify(userDatabase));
}

// Check if user already exists in database
function isUserExists(name, phone) {
    return userDatabase.some(user => 
        user.name.toLowerCase() === name.toLowerCase() || 
        user.phone === phone
    );
}

// Add user to database
function addUserToDatabase(name, phone) {
    const user = {
        id: Date.now(),
        name: name.trim(),
        phone: phone.trim(),
        joinDate: new Date().toISOString(),
        groupName: CONFIG.groupName
    };
    
    userDatabase.push(user);
    saveUserDatabase();
    return user;
}

// Add admin access button to the page
function addExportButton() {
    const adminBtn = document.createElement('button');
    adminBtn.innerHTML = '<i class="fas fa-info-circle"></i>';
    adminBtn.className = 'admin-button';
    adminBtn.style.cssText = `
        position: fixed;
        top: 20px;
        left: 20px;
        background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
        color: white;
        border: none;
        padding: 12px;
        border-radius: 50%;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 5px 15px rgba(108, 117, 125, 0.3);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 45px;
        height: 45px;
    `;
    
    adminBtn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.1)';
        this.style.boxShadow = '0 8px 20px rgba(108, 117, 125, 0.4)';
    });
    
    adminBtn.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
        this.style.boxShadow = '0 5px 15px rgba(108, 117, 125, 0.3)';
    });
    
    adminBtn.addEventListener('click', showAdminLogin);
    document.body.appendChild(adminBtn);
}

// Admin configuration
const ADMIN_CONFIG = {
    passcode: "159753", // Change this to your desired admin passcode
    sessionTimeout: 30 * 60 * 1000 // 30 minutes in milliseconds
};

let adminSession = null;

// Show admin login modal
function showAdminLogin() {
    const modal = document.createElement('div');
    modal.className = 'admin-modal';
    modal.innerHTML = `
        <div class="admin-modal-content">
            <div class="admin-modal-header">
                <h3><i class="fas fa-lock"></i> Admin Access</h3>
                <button class="close-btn" onclick="closeAdminModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="admin-modal-body">
                <p>Enter admin passcode to access user data:</p>
                <div class="passcode-input">
                    <input type="password" id="admin-passcode" placeholder="Enter passcode" maxlength="20">
                    <button onclick="verifyAdminPasscode()" class="verify-btn">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
                <div id="passcode-error" class="error-message" style="display: none;">
                    <i class="fas fa-exclamation-triangle"></i>
                    <span>Incorrect passcode. Please try again.</span>
                </div>
            </div>
        </div>
    `;
    
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    const passcodeInput = modal.querySelector('#admin-passcode');
    const verifyBtn = modal.querySelector('.verify-btn');
    
    passcodeInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            verifyAdminPasscode();
        }
    });
    
    // Focus on input
    setTimeout(() => passcodeInput.focus(), 100);
}

// Close admin modal
function closeAdminModal() {
    const modal = document.querySelector('.admin-modal');
    if (modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
}

// Verify admin passcode
function verifyAdminPasscode() {
    const passcodeInput = document.getElementById('admin-passcode');
    const errorDiv = document.getElementById('passcode-error');
    const passcode = passcodeInput.value;
    
    if (passcode === ADMIN_CONFIG.passcode) {
        // Set admin session
        adminSession = {
            startTime: Date.now(),
            expiresAt: Date.now() + ADMIN_CONFIG.sessionTimeout
        };
        localStorage.setItem('adminSession', JSON.stringify(adminSession));
        
        // Close modal and show admin panel
        closeAdminModal();
        showAdminPanel();
        
        showNotification('Admin access granted!', 'success');
    } else {
        // Show error
        errorDiv.style.display = 'flex';
        passcodeInput.style.borderColor = '#dc3545';
        passcodeInput.value = '';
        passcodeInput.focus();
        
        // Hide error after 3 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
            passcodeInput.style.borderColor = '#e9ecef';
        }, 3000);
    }
}

// Show admin panel
function showAdminPanel() {
    const panel = document.createElement('div');
    panel.className = 'admin-panel';
    panel.innerHTML = `
        <div class="admin-panel-content">
            <div class="admin-panel-header">
                <h3><i class="fas fa-user-shield"></i> Admin Panel</h3>
                <button class="close-btn" onclick="closeAdminPanel()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="admin-panel-body">
                <div class="stats-section">
                    <h4>User Statistics</h4>
                    <div class="stats-grid">
                        <div class="stat-item">
                            <div class="stat-number">${userDatabase.length}</div>
                            <div class="stat-label">Total Users</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">${new Date().toLocaleDateString()}</div>
                            <div class="stat-label">Today's Date</div>
                        </div>
                    </div>
                </div>
                <div class="actions-section">
                    <h4>Actions</h4>
                    <button onclick="exportToExcel()" class="admin-action-btn export-btn">
                        <i class="fas fa-download"></i>
                        Export User Data (${userDatabase.length} users)
                    </button>
                    <button onclick="clearUserDatabase()" class="admin-action-btn clear-btn">
                        <i class="fas fa-trash"></i>
                        Clear All Data
                    </button>
                </div>
                <div class="session-info">
                    <small>Session expires in: <span id="session-timer">30:00</span></small>
                </div>
            </div>
        </div>
    `;
    
    panel.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    document.body.appendChild(panel);
    
    // Start session timer
    startSessionTimer();
}

// Close admin panel
function closeAdminPanel() {
    const panel = document.querySelector('.admin-panel');
    if (panel) {
        panel.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
        }, 300);
    }
}

// Start session timer
function startSessionTimer() {
    const timerElement = document.getElementById('session-timer');
    if (!timerElement) return;
    
    const updateTimer = () => {
        if (!adminSession) return;
        
        const timeLeft = adminSession.expiresAt - Date.now();
        if (timeLeft <= 0) {
            // Session expired
            adminSession = null;
            localStorage.removeItem('adminSession');
            closeAdminPanel();
            showNotification('Admin session expired. Please login again.', 'info');
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    // Store interval ID to clear later
    panel.timerInterval = timerInterval;
}

// Clear user database
function clearUserDatabase() {
    if (confirm('Are you sure you want to clear all user data? This action cannot be undone.')) {
        userDatabase = [];
        saveUserDatabase();
        closeAdminPanel();
        showNotification('All user data has been cleared.', 'success');
    }
}

// Check admin session on page load
function checkAdminSession() {
    const savedSession = localStorage.getItem('adminSession');
    if (savedSession) {
        adminSession = JSON.parse(savedSession);
        if (adminSession.expiresAt > Date.now()) {
            // Session is still valid
            return true;
        } else {
            // Session expired
            adminSession = null;
            localStorage.removeItem('adminSession');
        }
    }
    return false;
}

// Export data to Excel/CSV format (admin only)
function exportToExcel() {
    if (!checkAdminSession()) {
        showNotification('Admin access required. Please login again.', 'error');
        return;
    }
    
    if (userDatabase.length === 0) {
        showNotification('No user data to export.', 'info');
        return;
    }
    
    // Create CSV content
    const headers = ['ID', 'Name', 'Phone', 'Join Date', 'Group Name'];
    const csvContent = [
        headers.join(','),
        ...userDatabase.map(user => [
            user.id,
            `"${user.name}"`,
            user.phone,
            user.joinDate,
            `"${user.groupName}"`
        ].join(','))
    ].join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `whatsapp_users_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification(`Exported ${userDatabase.length} user records to CSV file!`, 'success');
}

// Validate form fields
function validateForm() {
    const name = userNameInput.value.trim();
    const phone = userPhoneInput.value.trim();
    
    // Basic validation
    const isNameValid = name.length >= 2;
    const isPhoneValid = phone.length >= 10;
    
    // Check for duplicates
    const isDuplicate = isUserExists(name, phone);
    
    // Enable/disable button based on validation
    whatsappBtn.disabled = !(isNameValid && isPhoneValid) || isDuplicate;
    
    // Add visual feedback
    userNameInput.style.borderColor = isNameValid ? '#28a745' : '#dc3545';
    userPhoneInput.style.borderColor = isPhoneValid ? '#28a745' : '#dc3545';
    
    // Show duplicate warning
    if (isDuplicate && name && phone) {
        showNotification('This user has already joined the group.', 'error');
    }
}

// Show download section
function showDownloadSection() {
    downloadSection.style.display = 'block';
    
    // Scroll to download section smoothly
    downloadSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
    });
    
    // Show success message
    showNotification('Success! Your download link is now available.', 'success');
}

// Handle copy button click
function handleCopyClick() {
    downloadLinkInput.select();
    downloadLinkInput.setSelectionRange(0, 99999); // For mobile devices
    
    try {
        // Copy to clipboard
        document.execCommand('copy');
        
        // Show success message
        showNotification('Download link copied to clipboard!', 'success');
        
        // Change button text temporarily
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        copyBtn.style.background = '#28a745';
        
        setTimeout(() => {
            copyBtn.innerHTML = originalText;
            copyBtn.style.background = '#6c757d';
        }, 2000);
        
    } catch (err) {
        // Fallback for modern browsers
        navigator.clipboard.writeText(downloadLinkInput.value).then(() => {
            showNotification('Download link copied to clipboard!', 'success');
        }).catch(() => {
            showNotification('Failed to copy link. Please select and copy manually.', 'error');
        });
    }
}

// Mark user as joined
function markUserJoined() {
    localStorage.setItem('whatsappGroupJoined', 'true');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 5000);
}

// Add some interactive effects
document.addEventListener('DOMContentLoaded', function() {
    // Add hover effects to steps (desktop only)
    const steps = document.querySelectorAll('.step');
    steps.forEach(step => {
        step.addEventListener('mouseenter', function() {
            if (window.innerWidth > 768) { // Only on desktop
                this.style.transform = 'scale(1.05)';
                this.style.transition = 'transform 0.3s ease';
            }
        });
        
        step.addEventListener('mouseleave', function() {
            if (window.innerWidth > 768) { // Only on desktop
                this.style.transform = 'scale(1)';
            }
        });
        
        // Add touch feedback for mobile
        step.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        step.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add click effect to benefits
    const benefits = document.querySelectorAll('.benefits li');
    benefits.forEach(benefit => {
        benefit.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
        
        // Add touch feedback for mobile
        benefit.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        benefit.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Improve mobile form experience
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        // Prevent zoom on iOS when focusing on inputs
        input.addEventListener('focus', function() {
            if (window.innerWidth <= 768) {
                setTimeout(() => {
                    this.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        });
    });
    
    // Add mobile-specific button improvements
    const buttons = document.querySelectorAll('button, .whatsapp-button, .download-button');
    buttons.forEach(button => {
        // Add touch feedback
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
            this.style.transition = 'transform 0.1s ease';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = 'scale(1)';
        });
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to join WhatsApp group
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleWhatsAppClick();
    }
    
    // Ctrl/Cmd + C to copy download link (when download section is visible)
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && downloadSection.style.display !== 'none') {
        e.preventDefault();
        handleCopyClick();
    }
    
    // Ctrl/Cmd + E to open admin panel
    if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        showAdminLogin();
    }
});

// Add analytics tracking (optional)
function trackEvent(eventName, eventData = {}) {
    // You can integrate with Google Analytics, Facebook Pixel, or other analytics here
    console.log('Event tracked:', eventName, eventData);
    
    // Example: Track WhatsApp button clicks
    if (eventName === 'whatsapp_click') {
        // Add your analytics code here
    }
}

// Update the WhatsApp click handler to include tracking
function handleWhatsAppClick() {
    // Get user data
    const userName = userNameInput.value.trim();
    const userPhone = userPhoneInput.value.trim();
    
    // Validate form again
    if (!userName || !userPhone) {
        showNotification('Please fill in all required fields.', 'error');
        return;
    }
    
    // Check for duplicates
    if (isUserExists(userName, userPhone)) {
        showNotification('This user has already joined the group.', 'error');
        return;
    }
    
    // Add user to database
    const newUser = addUserToDatabase(userName, userPhone);
    
    trackEvent('whatsapp_click', {
        groupName: CONFIG.groupName,
        userName: userName,
        userPhone: userPhone,
        userId: newUser.id,
        timestamp: new Date().toISOString()
    });
    
    // Show loading state
    whatsappBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Opening WhatsApp...';
    whatsappBtn.disabled = true;
    
    // Simulate a small delay for better UX
    setTimeout(() => {
        // Open WhatsApp group link in new tab
        window.open(CONFIG.whatsappGroupLink, '_blank');
        
        // Show download section after a short delay
        setTimeout(() => {
            showDownloadSection();
            markUserJoined();
            
            // Store user data
            localStorage.setItem('userName', userName);
            localStorage.setItem('userPhone', userPhone);
        }, 2000);
        
        // Reset button
        whatsappBtn.innerHTML = '<i class="fab fa-whatsapp"></i> Join WhatsApp Group';
        whatsappBtn.disabled = false;
    }, 1000);
} 
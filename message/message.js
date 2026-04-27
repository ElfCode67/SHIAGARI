// SHIAGARI - Chat Module (PHP + MySQL Version)

let conversations = {};
let currentUser = '';
let currentUserId = null;
let allUsers = [];

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('../auth/check_session.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            window.location.href = '../index.php';
        }
        currentUserId = data.user?.id;
        return data.logged_in;
    } catch (error) {
        window.location.href = '../index.php';
    }
}

// Fetch all users for chat list
async function loadUsers() {
    try {
        const response = await fetch('../api/messages.php?action=get_users');
        const data = await response.json();
        
        if (data.success) {
            allUsers = data.users;
            renderChatList();
        }
    } catch (error) {
        console.error('Error loading users:', error);
    }
}

// Fetch messages for a specific user
async function loadMessages(otherUserId, otherUserName) {
    try {
        const response = await fetch(`../api/messages.php?action=get_messages&other_user_id=${otherUserId}`);
        const data = await response.json();
        
        if (data.success) {
            if (!conversations[otherUserName]) {
                conversations[otherUserName] = {
                    id: otherUserId,
                    messages: []
                };
            }
            conversations[otherUserName].messages = data.messages;
            renderMessages();
        }
    } catch (error) {
        console.error('Error loading messages:', error);
        showToast('Error loading messages', 'error');
    }
}

// Send a message
async function sendMessage(toUserId, message) {
    if (!message.trim()) return false;
    
    try {
        const response = await fetch('../api/messages.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'send',
                to_user_id: toUserId,
                message: message.trim()
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Reload messages for this conversation
            await loadMessages(toUserId, currentUser);
            showToast('Message sent', 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error sending message', 'error');
        return false;
    }
}

// Mark messages as read
async function markAsRead(otherUserId) {
    try {
        await fetch('../api/messages.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'mark_read',
                other_user_id: otherUserId
            })
        });
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
}

// Render chat list
function renderChatList() {
    const chatListContainer = document.querySelector('.chat-list');
    if (!chatListContainer) return;
    
    // Keep the header
    const header = chatListContainer.querySelector('.chat-list-header');
    
    let usersHtml = '';
    allUsers.forEach(user => {
        // Don't show current user in chat list
        if (user.id == currentUserId) return;
        
        const avatarUrl = `https://ui-avatars.com/api/?background=${user.avatar_color || '3b82f6'}&color=fff&name=${user.username?.charAt(0) || 'U'}`;
        const statusClass = user.status || 'offline';
        const statusText = statusClass === 'online' ? '🟢 Online' : (statusClass === 'away' ? '🟡 Away' : '⚫ Offline');
        
        usersHtml += `
            <div class="chat-user" data-user-id="${user.id}" data-user-name="${user.full_name || user.username}">
                <img src="${avatarUrl}" alt="${user.full_name || user.username}">
                <div class="chat-user-info">
                    <span class="chat-user-name">${escapeHtml(user.full_name || user.username)}</span>
                    <span class="chat-user-preview">${statusText}</span>
                </div>
            </div>
        `;
    });
    
    // Update the chat list (keep header, replace users)
    const existingUsers = chatListContainer.querySelectorAll('.chat-user');
    existingUsers.forEach(el => el.remove());
    chatListContainer.insertAdjacentHTML('beforeend', usersHtml);
    
    // Attach click handlers
    document.querySelectorAll('.chat-user').forEach(user => {
        user.addEventListener('click', async () => {
            const userId = user.getAttribute('data-user-id');
            const userName = user.getAttribute('data-user-name');
            
            // Remove active class from all
            document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
            user.classList.add('active');
            
            currentUser = userName;
            await loadMessages(userId, userName);
            await markAsRead(userId);
            
            // Update chat header
            const avatarUrl = user.querySelector('img').src;
            document.getElementById('currentAvatar').src = avatarUrl;
            document.getElementById('currentUserName').textContent = userName;
        });
    });
}

// Render messages in chat window
function renderMessages() {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody) return;
    
    const messages = conversations[currentUser]?.messages || [];
    
    if (messages.length === 0) {
        chatBody.innerHTML = `
            <div class="empty-chat">
                <i class="fas fa-comments"></i>
                <p>No messages yet. Start a conversation!</p>
            </div>
        `;
        return;
    }
    
    chatBody.innerHTML = messages.map(msg => {
        const isMe = msg.sender_id == currentUserId;
        const senderInitial = isMe ? 'ME' : (msg.sender_name?.charAt(0) || 'U');
        
        return `
            <div class="msg ${isMe ? 'right' : 'left'}">
                ${!isMe ? `<div class="msg-avatar">${escapeHtml(senderInitial)}</div>` : ''}
                <div class="msg-content">
                    <div class="msg-text">${escapeHtml(msg.message)}</div>
                    <div class="msg-time">${formatTime(msg.created_at)}</div>
                </div>
            </div>
        `;
    }).join('');
    
    // Scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}m ago`;
    } else if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}h ago`;
    } else {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
}

// Send message handler
function initSendMessage() {
    const sendBtn = document.getElementById('sendBtn');
    const messageInput = document.getElementById('messageInput');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', async () => {
            if (!currentUser) {
                showToast('Select a user to chat with', 'error');
                return;
            }
            
            const otherUser = allUsers.find(u => (u.full_name || u.username) === currentUser);
            if (otherUser) {
                await sendMessage(otherUser.id, messageInput.value);
                messageInput.value = '';
                messageInput.focus();
            }
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                if (!currentUser) {
                    showToast('Select a user to chat with', 'error');
                    return;
                }
                
                const otherUser = allUsers.find(u => (u.full_name || u.username) === currentUser);
                if (otherUser) {
                    await sendMessage(otherUser.id, messageInput.value);
                    messageInput.value = '';
                }
            }
        });
    }
}

// Poll for new messages every 5 seconds
let pollInterval = null;

function startPolling() {
    if (pollInterval) clearInterval(pollInterval);
    
    pollInterval = setInterval(async () => {
        if (currentUser) {
            const otherUser = allUsers.find(u => (u.full_name || u.username) === currentUser);
            if (otherUser) {
                await loadMessages(otherUser.id, currentUser);
            }
        }
    }, 5000);
}

// Drag functionality
const chatWindow = document.getElementById('chatWindow');
const dragHandle = document.getElementById('dragHandle');
let isDragging = false;
let dragOffsetX, dragOffsetY;

function initDrag() {
    if (!chatWindow || !dragHandle) return;
    
    dragHandle.addEventListener('mousedown', (e) => {
        if (e.target.closest('.chat-header-actions')) return;
        isDragging = true;
        const rect = chatWindow.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
        chatWindow.style.position = 'fixed';
        chatWindow.style.cursor = 'grabbing';
    });
    
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = e.clientX - dragOffsetX;
        let newTop = e.clientY - dragOffsetY;
        
        newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - chatWindow.offsetWidth));
        newTop = Math.max(0, Math.min(newTop, window.innerHeight - chatWindow.offsetHeight));
        
        chatWindow.style.left = newLeft + 'px';
        chatWindow.style.top = newTop + 'px';
        chatWindow.style.right = 'auto';
        chatWindow.style.bottom = 'auto';
    });
    
    document.addEventListener('mouseup', () => {
        isDragging = false;
        if (chatWindow) chatWindow.style.cursor = '';
    });
}

// Minimize functionality
function initMinimize() {
    const minBtn = document.getElementById('minBtn');
    if (minBtn) {
        minBtn.addEventListener('click', () => {
            chatWindow.classList.toggle('minimized');
            const icon = minBtn.querySelector('i');
            if (chatWindow.classList.contains('minimized')) {
                icon.className = 'fas fa-window-maximize';
            } else {
                icon.className = 'fas fa-minus';
            }
        });
    }
}

// Set initial position
function setInitialPosition() {
    if (chatWindow) {
        chatWindow.style.position = 'fixed';
        chatWindow.style.bottom = '20px';
        chatWindow.style.right = '20px';
        chatWindow.style.left = 'auto';
        chatWindow.style.top = 'auto';
    }
}

// Toast notification
let toastTimeout = null;

function showToast(message, type = 'success') {
    let toast = document.getElementById('chatToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'chatToast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas"></i><span id="chatToastText"></span>';
        document.body.appendChild(toast);
        
        toast.style.position = 'fixed';
        toast.style.bottom = '30px';
        toast.style.right = '30px';
        toast.style.background = '#1e293b';
        toast.style.padding = '12px 20px';
        toast.style.borderRadius = '40px';
        toast.style.display = 'flex';
        toast.style.alignItems = 'center';
        toast.style.gap = '10px';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '500';
        toast.style.borderLeft = '4px solid #10b981';
        toast.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
        toast.style.transform = 'translateX(400px)';
        toast.style.transition = 'transform 0.3s ease';
        toast.style.zIndex = '1100';
    }
    
    const icon = toast.querySelector('i');
    const toastText = document.getElementById('chatToastText');
    
    toastText.textContent = message;
    if (type === 'error') {
        icon.className = 'fas fa-exclamation-triangle';
        icon.style.color = '#f97316';
        toast.style.borderLeftColor = '#f97316';
    } else if (type === 'info') {
        icon.className = 'fas fa-info-circle';
        icon.style.color = '#3b82f6';
        toast.style.borderLeftColor = '#3b82f6';
    } else {
        icon.className = 'fas fa-check-circle';
        icon.style.color = '#10b981';
        toast.style.borderLeftColor = '#10b981';
    }
    
    toast.classList.add('show');
    toast.style.transform = 'translateX(0)';
    
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.style.transform = 'translateX(400px)';
        toast.classList.remove('show');
    }, 2500);
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadUsers();
    initDrag();
    initMinimize();
    initSendMessage();
    setInitialPosition();
    startPolling();
    
    // Add empty chat message styles if not present
    const style = document.createElement('style');
    style.textContent = `
        .empty-chat {
            text-align: center;
            padding: 60px 20px;
            color: #6b7280;
        }
        .empty-chat i {
            font-size: 48px;
            margin-bottom: 16px;
            opacity: 0.5;
        }
        .empty-chat p {
            font-size: 14px;
        }
    `;
    document.head.appendChild(style);
});
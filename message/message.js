// SHIAGARI - Chat Module (Frontend Only)

let currentUser = null;
let messages = [];

// Demo users
const users = [
  { id: 1, name: 'Vince Villar', avatar: 'VV', status: 'online' },
  { id: 2, name: 'Ayelet De Castro', avatar: 'AD', status: 'online' },
  { id: 3, name: 'Sean Arkin', avatar: 'SA', status: 'away' },
  { id: 4, name: 'Maria Santos', avatar: 'MS', status: 'offline' }
];

// Demo messages for each user
const messageHistory = {
  1: [
    { id: 1, text: 'Hello!', sender: 'other', time: '10:30 AM' },
    { id: 2, text: 'Hi there! 👋', sender: 'me', time: '10:31 AM' },
    { id: 3, text: 'How is the project going?', sender: 'other', time: '10:32 AM' },
    { id: 4, text: 'Going great! Almost done.', sender: 'me', time: '10:33 AM' }
  ],
  2: [
    { id: 1, text: 'Great work on the design!', sender: 'other', time: '9:15 AM' },
    { id: 2, text: 'Thank you!', sender: 'me', time: '9:16 AM' }
  ],
  3: [
    { id: 1, text: 'Meeting at 2pm?', sender: 'other', time: 'Yesterday' },
    { id: 2, text: 'Yes, see you then', sender: 'me', time: 'Yesterday' }
  ],
  4: []
};

// ========== DATA (Backend: replace with API) ==========

function loadUsers() {
  // TODO: Replace with fetch('/api/users')
  renderUserList();
}

function loadMessages(userId) {
  // TODO: Replace with fetch(`/api/messages/${userId}`)
  messages = messageHistory[userId] || [];
  renderMessages();
}

function sendMessage(userId, text) {
  if (!text.trim()) return;
  
  // TODO: Replace with fetch('/api/messages', { method: 'POST', body: {...} })
  messages.push({
    id: Date.now(),
    text: text.trim(),
    sender: 'me',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });
  
  // Simulate reply (remove in production)
  setTimeout(() => {
    const replies = ['Thanks! 👍', 'Interesting!', 'I agree!', 'Let me check that.'];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    messages.push({
      id: Date.now(),
      text: randomReply,
      sender: 'other',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    renderMessages();
    saveToLocalStorage(userId);
    showToast(`New message from ${currentUser?.name}`);
  }, 1000);
  
  renderMessages();
  saveToLocalStorage(userId);
  showToast('Message sent');
}

// Save to localStorage (temporary - backend will replace)
function saveToLocalStorage(userId) {
  const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '{}');
  allMessages[userId] = messages;
  localStorage.setItem('chat_messages', JSON.stringify(allMessages));
}

function loadFromLocalStorage(userId) {
  const allMessages = JSON.parse(localStorage.getItem('chat_messages') || '{}');
  if (allMessages[userId]) {
    messages = allMessages[userId];
  } else {
    messages = messageHistory[userId] || [];
  }
  renderMessages();
}

// ========== RENDER ==========

function renderUserList() {
  const container = document.getElementById('chatList');
  if (!container) return;
  
  container.innerHTML = users.map(user => `
    <div class="chat-user" data-id="${user.id}">
      <div class="chat-avatar">${user.avatar}</div>
      <div class="chat-user-info">
        <span class="chat-user-name">${escapeHtml(user.name)}</span>
        <span class="chat-user-preview">${user.status === 'online' ? '🟢 Online' : (user.status === 'away' ? '🟡 Away' : '⚫ Offline')}</span>
      </div>
    </div>
  `).join('');
  
  // Add click handlers
  document.querySelectorAll('.chat-user').forEach(user => {
    user.onclick = () => {
      const userId = parseInt(user.dataset.id);
      const userData = users.find(u => u.id === userId);
      switchChat(userId, userData);
    };
  });
}

function switchChat(userId, userData) {
  currentUser = userData;
  
  // Update active state
  document.querySelectorAll('.chat-user').forEach(u => u.classList.remove('active'));
  document.querySelector(`.chat-user[data-id="${userId}"]`).classList.add('active');
  
  // Update header
  document.getElementById('currentAvatar').innerText = userData.avatar;
  document.getElementById('currentUserName').innerText = userData.name;
  
  // Enable input
  document.getElementById('messageInput').disabled = false;
  document.getElementById('sendBtn').disabled = false;
  document.getElementById('messageInput').focus();
  
  // Load messages
  loadFromLocalStorage(userId);
}

function renderMessages() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  
  if (!messages.length) {
    container.innerHTML = '<div class="empty-chat">No messages yet. Say hello!</div>';
    return;
  }
  
  container.innerHTML = messages.map(msg => `
    <div class="message ${msg.sender === 'me' ? 'sent' : 'received'}">
      <div class="message-bubble">
        <div>${escapeHtml(msg.text)}</div>
        <div class="message-time">${msg.time}</div>
      </div>
    </div>
  `).join('');
  
  // Scroll to bottom
  container.scrollTop = container.scrollHeight;
}

// ========== SEND MESSAGE ==========

function initSendMessage() {
  const sendBtn = document.getElementById('sendBtn');
  const messageInput = document.getElementById('messageInput');
  
  sendBtn.onclick = () => {
    if (currentUser && messageInput.value.trim()) {
      sendMessage(currentUser.id, messageInput.value);
      messageInput.value = '';
      messageInput.focus();
    }
  };
  
  messageInput.onkeypress = (e) => {
    if (e.key === 'Enter' && currentUser && messageInput.value.trim()) {
      sendMessage(currentUser.id, messageInput.value);
      messageInput.value = '';
    }
  };
}

// ========== DRAG WINDOW ==========

let isDragging = false;
let dragOffsetX, dragOffsetY;

function initDrag() {
  const chatWindow = document.getElementById('chatWindow');
  const dragHandle = document.getElementById('dragHandle');
  
  dragHandle.onmousedown = (e) => {
    if (e.target.closest('.minimize-btn')) return;
    isDragging = true;
    const rect = chatWindow.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    chatWindow.style.position = 'relative';
    chatWindow.style.cursor = 'grabbing';
  };
  
  document.onmousemove = (e) => {
    if (!isDragging) return;
    chatWindow.style.position = 'fixed';
    chatWindow.style.left = (e.clientX - dragOffsetX) + 'px';
    chatWindow.style.top = (e.clientY - dragOffsetY) + 'px';
    chatWindow.style.right = 'auto';
    chatWindow.style.bottom = 'auto';
  };
  
  document.onmouseup = () => {
    isDragging = false;
    if (chatWindow) chatWindow.style.cursor = '';
  };
}

// ========== MINIMIZE WINDOW ==========

function initMinimize() {
  const minBtn = document.getElementById('minimizeBtn');
  const chatWindow = document.getElementById('chatWindow');
  
  minBtn.onclick = () => {
    chatWindow.classList.toggle('minimized');
    minBtn.innerText = chatWindow.classList.contains('minimized') ? '+' : '−';
  };
}

// Add minimized styles
function addMinimizeStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .chat-window.minimized .chat-messages,
    .chat-window.minimized .chat-input-area {
      display: none;
    }
    .chat-window.minimized {
      height: 60px;
    }
  `;
  document.head.appendChild(style);
}

// ========== TOAST ==========

function showToast(msg) {
  const toast = document.getElementById('toastMsg');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  loadUsers();
  initSendMessage();
  initDrag();
  initMinimize();
  addMinimizeStyles();
});
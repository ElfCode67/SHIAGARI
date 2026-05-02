// SHIAGARI - Post Board (Frontend Only)

let posts = [];

// ========== DATA (Backend: replace with API) ==========

function loadPosts() {
  // TODO: Replace with fetch('/api/posts')
  const stored = localStorage.getItem('posts');
  posts = stored ? JSON.parse(stored) : [
    {
      id: 1,
      author: 'Sean Arkin Balmes',
      role: 'Project Manager',
      avatar: 'SA',
      content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      isAnnouncement: true,
      announcementTitle: 'ANNOUNCEMENT',
      likes: 12,
      timestamp: Date.now() - 86400000,
      likedBy: []
    },
    {
      id: 2,
      author: 'Sean Arkin Balmes',
      role: 'Project Manager',
      avatar: 'SA',
      content: 'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
      isAnnouncement: false,
      announcementTitle: null,
      likes: 5,
      timestamp: Date.now() - 172800000,
      likedBy: []
    }
  ];
  render();
  updateCount();
}

function savePosts() {
  // TODO: Replace with fetch('/api/posts', { method: 'POST' })
  localStorage.setItem('posts', JSON.stringify(posts));
  updateCount();
}

function updateCount() {
  document.getElementById('postCount').innerText = posts.length;
}

// ========== RENDER ==========

function render() {
  const container = document.getElementById('postsContainer');
  
  if (!posts.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-newspaper"></i><p>No posts yet. Be the first to share!</p></div>';
    return;
  }
  
  const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
  
  container.innerHTML = sortedPosts.map(post => {
    const isLiked = post.likedBy && post.likedBy.includes('current_user');
    
    return `
      <div class="post" data-id="${post.id}">
        <div class="post-header">
          <div class="post-avatar">${post.avatar}</div>
          <div class="post-user-info">
            <div class="post-author">${escapeHtml(post.author)}</div>
            <div class="post-role">${escapeHtml(post.role)}</div>
            <div class="post-time">${formatTime(post.timestamp)}</div>
          </div>
        </div>
        ${post.isAnnouncement ? `<div class="announcement-badge"><i class="fas fa-bullhorn"></i> ${escapeHtml(post.announcementTitle || 'ANNOUNCEMENT')}</div>` : ''}
        <div class="post-content">${escapeHtml(post.content)}</div>
        <div class="post-actions">
          <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}">
            <i class="fas fa-heart"></i> ${post.likes} Likes
          </button>
        </div>
      </div>
    `;
  }).join('');
  
  // Add like handlers
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.onclick = () => {
      const postId = parseInt(btn.dataset.id);
      toggleLike(postId);
    };
  });
}

function formatTime(timestamp) {
  const diff = Date.now() - timestamp;
  if (diff < 3600000) {
    const mins = Math.floor(diff / 60000);
    return `${mins} minute${mins !== 1 ? 's' : ''} ago`;
  } else if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }
  return new Date(timestamp).toLocaleDateString();
}

// ========== CRUD ==========

function addPost(content) {
  if (!content.trim()) {
    showToast('Please enter some content', true);
    return false;
  }
  
  const newPost = {
    id: Date.now(),
    author: 'You',
    role: 'Team Member',
    avatar: '👤',
    content: content.trim(),
    isAnnouncement: false,
    announcementTitle: null,
    likes: 0,
    timestamp: Date.now(),
    likedBy: []
  };
  
  posts.unshift(newPost);
  savePosts();
  render();
  showToast('Post published!');
  return true;
}

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  
  if (!post.likedBy) post.likedBy = [];
  
  const userLiked = post.likedBy.includes('current_user');
  
  if (userLiked) {
    post.likedBy = post.likedBy.filter(id => id !== 'current_user');
    post.likes--;
    showToast('Removed like');
  } else {
    post.likedBy.push('current_user');
    post.likes++;
    showToast('Liked!');
  }
  
  savePosts();
  render();
}

// ========== CREATE POST ==========

function initCreatePost() {
  const postBtn = document.getElementById('postBtn');
  const postInput = document.getElementById('postInput');
  
  postBtn.onclick = () => {
    addPost(postInput.value);
    postInput.value = '';
    postInput.focus();
  };
  
  postInput.onkeypress = (e) => {
    if (e.key === 'Enter') {
      addPost(postInput.value);
      postInput.value = '';
    }
  };
}

// ========== TOAST ==========

function showToast(msg, isError = false) {
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
  loadPosts();
  initCreatePost();
});
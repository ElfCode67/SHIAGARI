// SHIAGARI - Post Board (PHP + MySQL Version)

let posts = [];

// Check if user is logged in
async function checkAuth() {
    try {
        const response = await fetch('../auth/check_session.php');
        const data = await response.json();
        
        if (!data.logged_in) {
            window.location.href = '../index.php';
        }
        return data.logged_in;
    } catch (error) {
        window.location.href = '../index.php';
    }
}

// Fetch posts from database
async function loadPosts() {
    try {
        const response = await fetch('../api/posts.php');
        const data = await response.json();
        
        if (data.success) {
            posts = data.posts;
            renderPosts();
            updatePostCount();
        } else if (data.message === 'Not logged in') {
            window.location.href = '../index.php';
        }
    } catch (error) {
        console.error('Error loading posts:', error);
        showToast('Error loading posts', 'error');
    }
}

// Add post to database
async function addPost(content, isAnnouncement = false, announcementTitle = null) {
    if (!content || !content.trim()) {
        showToast('Please enter some content', 'error');
        return false;
    }
    
    try {
        const response = await fetch('../api/posts.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: content.trim(),
                is_announcement: isAnnouncement,
                announcement_title: announcementTitle
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadPosts();
            showToast('Post published!', 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error creating post', 'error');
        return false;
    }
}

// Like/unlike post
async function toggleLike(postId, currentLiked) {
    try {
        const response = await fetch('../api/posts.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                post_id: postId,
                action: currentLiked ? 'unlike' : 'like'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadPosts();
            showToast(currentLiked ? 'Removed like' : 'Liked!', 'success');
        } else {
            showToast(data.message, 'error');
        }
    } catch (error) {
        showToast('Error updating like', 'error');
    }
}

// Update post count
function updatePostCount() {
    const countSpan = document.getElementById('postCount');
    if (countSpan) countSpan.textContent = posts.length;
}

// Format time
function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleDateString();
    }
}

// Escape HTML
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render posts
function renderPosts() {
    const container = document.getElementById('postsContainer');
    if (!container) return;
    
    if (posts.length === 0) {
        container.innerHTML = `
            <div class="empty-posts">
                <i class="fas fa-newspaper"></i>
                <p>No posts yet. Be the first to share something!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = posts.map(post => {
        const isLiked = post.user_liked == 1;
        const avatarUrl = `https://ui-avatars.com/api/?background=${post.avatar_color || '3b82f6'}&color=fff&name=${post.avatar || post.full_name?.charAt(0) || 'U'}`;
        
        return `
            <div class="post" data-id="${post.id}">
                <div class="post-header">
                    <img src="${avatarUrl}" alt="${escapeHtml(post.full_name)}" class="post-avatar">
                    <div class="post-user-info">
                        <div class="post-author">
                            ${escapeHtml(post.full_name)}
                            <span class="post-role">${escapeHtml(post.role || 'Team Member')}</span>
                        </div>
                        <span class="post-time">${formatTime(post.created_at)}</span>
                    </div>
                </div>
                ${post.is_announcement ? `<div class="post-announcement-badge"><i class="fas fa-bullhorn"></i> ${escapeHtml(post.announcement_title || 'ANNOUNCEMENT')}</div>` : ''}
                <div class="post-content">${escapeHtml(post.content)}</div>
                <div class="post-actions">
                    <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-id="${post.id}" data-liked="${isLiked}">
                        <i class="fas fa-heart"></i> ${post.like_count || post.likes || 0} Likes
                    </button>
                    <button class="post-action-btn comment-btn" data-id="${post.id}">
                        <i class="fas fa-comment"></i> Comments
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners
    document.querySelectorAll('.like-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-id');
            const isLiked = btn.getAttribute('data-liked') === 'true';
            await toggleLike(postId, isLiked);
        });
    });
    
    document.querySelectorAll('.comment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const postId = btn.getAttribute('data-id');
            showToast('Comments feature coming soon!', 'info');
        });
    });
}

// Toast notification
let toastTimeout = null;

function showToast(message, type = 'success') {
    let toast = document.getElementById('postToast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'postToast';
        toast.className = 'toast';
        toast.innerHTML = '<i class="fas"></i><span id="postToastText"></span>';
        document.body.appendChild(toast);
        
        // Add styles for this specific toast
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
    const toastText = document.getElementById('postToastText');
    
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

// Initialize post creation
function initPostCreation() {
    const postBtn = document.getElementById('postBtn');
    const postInput = document.getElementById('postInput');
    
    if (postBtn) {
        postBtn.addEventListener('click', async () => {
            await addPost(postInput.value, false, null);
            postInput.value = '';
            postInput.focus();
        });
    }
    
    if (postInput) {
        postInput.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                await addPost(postInput.value, false, null);
                postInput.value = '';
            }
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    await loadPosts();
    initPostCreation();
});
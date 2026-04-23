// SHIAGARI - Idea Factory (PHP + MySQL Version)

let ideas = [];
let editId = null;

// Category configuration
const CATEGORIES = {
    sketch: { icon: 'fa-paintbrush', label: 'Sketch' },
    flowchart: { icon: 'fa-diagram-project', label: 'Flowchart' },
    color: { icon: 'fa-palette', label: 'Color Palette' },
    design: { icon: 'fa-pen-ruler', label: 'Design' },
    tech: { icon: 'fa-microchip', label: 'Tech' },
    business: { icon: 'fa-chart-line', label: 'Business' }
};

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

// Fetch ideas from database
async function loadIdeas() {
    try {
        const response = await fetch('../api/ideas.php');
        const data = await response.json();
        
        if (data.success) {
            ideas = data.ideas;
            render();
            updateCount();
        } else if (data.message === 'Not logged in') {
            window.location.href = '../index.php';
        }
    } catch (error) {
        console.error('Error loading ideas:', error);
        showToast('Error loading ideas', 'error');
    }
}

// Save idea to database
async function addIdea(title, description, category, author) {
    if (!title || !title.trim()) {
        showToast('Title required', 'error');
        return false;
    }
    
    try {
        const response = await fetch('../api/ideas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title.trim(),
                description: description?.trim() || '',
                category: category || 'design',
                author: author || 'Anonymous'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadIdeas(); // Reload from database
            showToast(`✨ "${title}" added!`, 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error creating idea', 'error');
        return false;
    }
}

// Update idea in database
async function updateIdea(id, title, description, category, author) {
    try {
        const response = await fetch('../api/ideas.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: id,
                title: title.trim(),
                description: description?.trim() || '',
                category: category,
                author: author
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadIdeas();
            showToast(`📝 "${title}" updated`, 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error updating idea', 'error');
        return false;
    }
}

// Like/unlike idea
async function toggleLike(ideaId, currentLiked) {
    try {
        const response = await fetch('../api/ideas.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                idea_id: ideaId,
                action: currentLiked ? 'unlike' : 'like'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadIdeas(); // Reload to get updated like count
            showToast(currentLiked ? 'Removed like' : 'Liked!', 'success');
        }
    } catch (error) {
        showToast('Error updating like', 'error');
    }
}

// Delete idea from database
async function deleteIdea(id) {
    const idea = ideas.find(i => i.id == id);
    if (!idea) return;
    
    if (confirm(`Delete "${idea.title}"?`)) {
        try {
            const response = await fetch(`../api/ideas.php?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                await loadIdeas();
                showToast(`🗑️ "${idea.title}" deleted`, 'info');
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error deleting idea', 'error');
        }
    }
}

// Update idea count
function updateCount() {
    const countSpan = document.getElementById('ideaCount');
    if (countSpan) countSpan.textContent = ideas.length;
}

// Escape HTML
function escape(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render ideas grid
function render() {
    const grid = document.getElementById('ideaGrid');
    if (!grid) return;
    
    if (!ideas.length) {
        grid.innerHTML = `<div class="empty-state"><i class="fas fa-lightbulb"></i><p>No ideas yet. Click + to create one!</p></div>`;
        return;
    }
    
    grid.innerHTML = ideas.map(idea => {
        const cat = CATEGORIES[idea.category];
        const isLiked = idea.user_liked == 1;
        const likeCount = idea.like_count || idea.likes || 0;
        
        return `
            <div class="idea-card" data-id="${idea.id}" data-category="${idea.category}">
                <div class="idea-image"><i class="fas ${cat.icon}"></i></div>
                <div class="idea-content">
                    <div class="idea-title">${escape(idea.title)}</div>
                    <div class="idea-desc">${escape(idea.description || 'No description')}</div>
                    <span class="tag ${idea.category}"><i class="fas ${cat.icon}"></i> ${cat.label}</span>
                    <div class="idea-footer">
                        <div class="author-info"><i class="fas fa-user-circle"></i> ${escape(idea.full_name || idea.author || 'Unknown')}</div>
                        <div class="idea-actions">
                            <span class="like-idea" data-id="${idea.id}" data-liked="${isLiked}">
                                <i class="fas fa-heart" style="color: ${isLiked ? '#ef4444' : '#6b7280'}"></i> ${likeCount}
                            </span>
                            <span class="delete-idea" data-id="${idea.id}">
                                <i class="fas fa-trash-alt"></i>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    // Attach event listeners
    document.querySelectorAll('.idea-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.like-idea') || e.target.closest('.delete-idea')) return;
            showDetail(card.dataset.id);
        });
    });
    
    document.querySelectorAll('.like-idea').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const isLiked = btn.dataset.liked === 'true';
            await toggleLike(id, isLiked);
        });
    });
    
    document.querySelectorAll('.delete-idea').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            await deleteIdea(id);
        });
    });
}

// Show detail modal
function showDetail(id) {
    const idea = ideas.find(i => i.id == id);
    if (!idea) return;
    
    const cat = CATEGORIES[idea.category];
    const detailBody = document.getElementById('detailBody');
    const detailTitle = document.getElementById('detailTitle');
    
    detailTitle.innerHTML = `<i class="fas ${cat.icon}"></i> ${escape(idea.title)}`;
    detailBody.innerHTML = `
        <div class="detail-field"><div class="detail-label">Category</div><div class="detail-value"><span class="tag ${idea.category}"><i class="fas ${cat.icon}"></i> ${cat.label}</span></div></div>
        <div class="detail-field"><div class="detail-label">Description</div><div class="detail-value">${escape(idea.description) || 'No description.'}</div></div>
        <div class="detail-field"><div class="detail-label">Author</div><div class="detail-value"><i class="fas fa-user"></i> ${escape(idea.full_name || idea.author || 'Unknown')}</div></div>
        <div class="detail-field"><div class="detail-label">Stats</div><div class="detail-value"><i class="fas fa-heart" style="color:#ef4444"></i> ${idea.like_count || idea.likes || 0} likes</div></div>
        <div class="detail-field"><div class="detail-label">Created</div><div class="detail-value">${new Date(idea.created_at).toLocaleDateString()}</div></div>
    `;
    
    document.getElementById('detailModal').style.display = 'flex';
    document.getElementById('editFromDetailBtn').onclick = () => {
        document.getElementById('detailModal').style.display = 'none';
        openModal(id);
    };
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}

// Modal functions
function openModal(id = null) {
    editId = id;
    const idea = id ? ideas.find(i => i.id == id) : null;
    
    document.getElementById('modalTitle').innerHTML = id ? '<i class="fas fa-edit"></i> Edit Idea' : '<i class="fas fa-lightbulb"></i> New Idea';
    document.getElementById('saveIdeaBtn').textContent = id ? 'Update Idea' : 'Save Idea';
    document.getElementById('ideaTitle').value = idea?.title || '';
    document.getElementById('ideaDesc').value = idea?.description || '';
    document.getElementById('ideaCategory').value = idea?.category || 'design';
    document.getElementById('ideaAuthor').value = idea?.full_name || idea?.author || 'Creative User';
    
    document.getElementById('ideaModal').style.display = 'flex';
    setTimeout(() => document.getElementById('ideaTitle').focus(), 100);
}

function closeModal() {
    document.getElementById('ideaModal').style.display = 'none';
    editId = null;
}

async function saveIdea() {
    const title = document.getElementById('ideaTitle').value.trim();
    if (!title) {
        showToast('Title required', 'error');
        return;
    }
    
    if (editId) {
        await updateIdea(
            editId,
            title,
            document.getElementById('ideaDesc').value,
            document.getElementById('ideaCategory').value,
            document.getElementById('ideaAuthor').value
        );
    } else {
        await addIdea(
            title,
            document.getElementById('ideaDesc').value,
            document.getElementById('ideaCategory').value,
            document.getElementById('ideaAuthor').value
        );
    }
    closeModal();
}

// Toast notification
let toastTimeout = null;

function showToast(message, isError = false) {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    const iconElem = toast.querySelector('i');
    
    toastText.textContent = message;
    if (isError) {
        iconElem.className = 'fas fa-exclamation-triangle';
        iconElem.style.color = '#f97316';
    } else {
        iconElem.className = 'fas fa-check-circle';
        iconElem.style.color = '#10b981';
    }
    
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

// Initialize
async function init() {
    await checkAuth();
    await loadIdeas();
    
    document.getElementById('floatingAddBtn').onclick = () => openModal();
    document.getElementById('saveIdeaBtn').onclick = saveIdea;
    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('closeDetailBtn')?.addEventListener('click', closeDetailModal);
    document.getElementById('closeDetailModalBtn')?.addEventListener('click', closeDetailModal);
    
    document.getElementById('ideaModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('ideaModal')) closeModal();
    });
    document.getElementById('detailModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('detailModal')) closeDetailModal();
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.getElementById('ideaModal').style.display === 'flex') closeModal();
            if (document.getElementById('detailModal').style.display === 'flex') closeDetailModal();
        }
    });
    
    // Roadmap placeholder
    document.getElementById('navRoadmap')?.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Roadmap planner coming soon!', 'info');
    });
}

// Start the app
init();
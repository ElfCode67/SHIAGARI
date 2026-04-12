// SHIAGARI - Idea Factory Interactive Manager

// --- Data Layer ---
let ideas = [];
let currentEditId = null;
let currentDetailId = null;

// Load from localStorage
function loadIdeasFromStorage() {
  const stored = localStorage.getItem('shiagari_ideas');
  if (stored) {
    ideas = JSON.parse(stored);
  } else {
    // Demo ideas matching original design
    ideas = [
      {
        id: 'i1',
        title: 'Neumorphic Design System',
        description: 'Create a complete UI kit with soft shadows and modern aesthetics.',
        category: 'design',
        author: 'Alex Chen',
        likes: 12,
        comments: 3,
        createdAt: new Date().toISOString()
      },
      {
        id: 'i2',
        title: 'AI Storyboard Generator',
        description: 'Generate visual storyboards from text prompts using AI models.',
        category: 'sketch',
        author: 'Jamie L.',
        likes: 8,
        comments: 2,
        createdAt: new Date().toISOString()
      },
      {
        id: 'i3',
        title: 'Data Flow Visualizer',
        description: 'Interactive flowchart tool for system architecture planning.',
        category: 'flowchart',
        author: 'Taylor W.',
        likes: 15,
        comments: 5,
        createdAt: new Date().toISOString()
      },
      {
        id: 'i4',
        title: 'Sunset Gradient Palette',
        description: 'Warm orange to purple gradients for UI backgrounds.',
        category: 'color',
        author: 'Morgan K.',
        likes: 23,
        comments: 7,
        createdAt: new Date().toISOString()
      }
    ];
    saveIdeasToStorage();
  }
  updateIdeaCount();
}

function saveIdeasToStorage() {
  localStorage.setItem('shiagari_ideas', JSON.stringify(ideas));
  updateIdeaCount();
}

function updateIdeaCount() {
  const countSpan = document.getElementById('ideaCount');
  if (countSpan) {
    countSpan.textContent = ideas.length;
  }
}

// --- Helper: Get category icon and display name ---
function getCategoryInfo(category) {
  const icons = {
    sketch: 'fa-paintbrush',
    flowchart: 'fa-diagram-project',
    color: 'fa-palette',
    design: 'fa-pen-ruler',
    tech: 'fa-microchip',
    business: 'fa-chart-line'
  };
  const labels = {
    sketch: 'Sketch',
    flowchart: 'Flowchart',
    color: 'Color Palette',
    design: 'Design',
    tech: 'Tech',
    business: 'Business'
  };
  return {
    icon: icons[category] || 'fa-lightbulb',
    label: labels[category] || category
  };
}

// --- Render Ideas Grid ---
function renderIdeas() {
  const grid = document.getElementById('ideaGrid');
  if (!grid) return;

  if (ideas.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-lightbulb"></i>
        <p>No ideas yet. Click the + button to spark creativity!</p>
      </div>
    `;
    return;
  }

  let cardsHTML = '';
  ideas.forEach(idea => {
    const categoryInfo = getCategoryInfo(idea.category);
    const descText = idea.description || 'No description provided.';
    const safeTitle = escapeHtml(idea.title);
    const safeDesc = escapeHtml(descText);
    const safeAuthor = escapeHtml(idea.author || 'Anonymous');
    
    cardsHTML += `
      <div class="idea-card" data-id="${idea.id}" data-category="${idea.category}">
        <div class="idea-image">
          <i class="fas ${categoryInfo.icon}"></i>
        </div>
        <div class="idea-content">
          <div class="idea-title">
            <span>${safeTitle}</span>
          </div>
          <div class="idea-desc">${safeDesc}</div>
          <span class="tag ${idea.category}">
            <i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}
          </span>
          <div class="idea-footer">
            <div class="author-info">
              <i class="fas fa-user-circle"></i>
              <span>${safeAuthor}</span>
            </div>
            <div class="idea-actions">
              <span class="like-idea" data-id="${idea.id}">
                <i class="fas fa-heart ${isLikedByUser(idea) ? 'liked' : ''}"></i>
                <span class="like-count">${idea.likes || 0}</span>
              </span>
              <span class="comment-idea" data-id="${idea.id}">
                <i class="fas fa-comment"></i>
                <span>${idea.comments || 0}</span>
              </span>
              <span class="delete-idea" data-id="${idea.id}">
                <i class="fas fa-trash-alt"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  grid.innerHTML = cardsHTML;
  
  // Attach event listeners
  document.querySelectorAll('.idea-card').forEach(card => {
    card.addEventListener('click', (e) => {
      // Don't trigger if clicking on action buttons
      if (e.target.closest('.like-idea') || e.target.closest('.delete-idea') || e.target.closest('.comment-idea')) {
        return;
      }
      const id = card.getAttribute('data-id');
      openDetailModal(id);
    });
  });
  
  document.querySelectorAll('.like-idea').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      toggleLike(id);
    });
  });
  
  document.querySelectorAll('.delete-idea').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteIdeaById(id);
    });
  });
  
  document.querySelectorAll('.comment-idea').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openDetailModal(id);
    });
  });
}

// Simple like tracking (localStorage based)
function getLikedIdeas() {
  const liked = localStorage.getItem('shiagari_liked_ideas');
  return liked ? JSON.parse(liked) : [];
}

function saveLikedIdeas(likedArray) {
  localStorage.setItem('shiagari_liked_ideas', JSON.stringify(likedArray));
}

function isLikedByUser(idea) {
  const liked = getLikedIdeas();
  return liked.includes(idea.id);
}

function toggleLike(ideaId) {
  const idea = ideas.find(i => i.id === ideaId);
  if (!idea) return;
  
  const liked = getLikedIdeas();
  const index = liked.indexOf(ideaId);
  
  if (index === -1) {
    liked.push(ideaId);
    idea.likes = (idea.likes || 0) + 1;
    showToast('❤️ Liked!', 'success');
  } else {
    liked.splice(index, 1);
    idea.likes = Math.max(0, (idea.likes || 0) - 1);
    showToast('💔 Unliked', 'info');
  }
  
  saveLikedIdeas(liked);
  saveIdeasToStorage();
  renderIdeas();
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

// --- CRUD Operations ---
function addIdea(title, description, category, author) {
  if (!title || title.trim() === '') {
    showToast('Title is required', 'error');
    return false;
  }
  
  const newIdea = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6),
    title: title.trim(),
    description: description?.trim() || '',
    category: category || 'design',
    author: author?.trim() || 'Creative User',
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString()
  };
  
  ideas.unshift(newIdea);
  saveIdeasToStorage();
  renderIdeas();
  showToast(`✨ "${newIdea.title}" added!`, 'success');
  return true;
}

function updateIdea(id, title, description, category, author) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return false;
  
  idea.title = title.trim();
  idea.description = description?.trim() || '';
  idea.category = category;
  idea.author = author?.trim() || 'Creative User';
  
  saveIdeasToStorage();
  renderIdeas();
  showToast(`📝 "${idea.title}" updated`, 'success');
  return true;
}

function deleteIdeaById(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;
  
  if (confirm(`Delete "${idea.title}"? This action cannot be undone.`)) {
    ideas = ideas.filter(i => i.id !== id);
    // Remove from liked storage if present
    const liked = getLikedIdeas();
    const newLiked = liked.filter(lid => lid !== id);
    saveLikedIdeas(newLiked);
    saveIdeasToStorage();
    renderIdeas();
    showToast(`🗑️ "${idea.title}" removed`, 'info');
    
    // Close modals if they're showing this idea
    if (currentDetailId === id) closeDetailModal();
  }
}

// --- Modal Logic ---
const modal = document.getElementById('ideaModal');
const detailModal = document.getElementById('detailModal');
let isModalOpen = false;

function openModal(editId = null) {
  currentEditId = editId;
  const modalTitle = document.getElementById('modalTitle');
  const saveBtn = document.getElementById('saveIdeaBtn');
  
  if (editId) {
    const idea = ideas.find(i => i.id === editId);
    if (idea) {
      modalTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Idea';
      saveBtn.textContent = 'Update Idea';
      document.getElementById('ideaTitle').value = idea.title;
      document.getElementById('ideaDesc').value = idea.description || '';
      document.getElementById('ideaCategory').value = idea.category;
      document.getElementById('ideaAuthor').value = idea.author || '';
    }
  } else {
    modalTitle.innerHTML = '<i class="fas fa-lightbulb"></i> New Idea';
    saveBtn.textContent = 'Save Idea';
    document.getElementById('ideaTitle').value = '';
    document.getElementById('ideaDesc').value = '';
    document.getElementById('ideaCategory').value = 'design';
    document.getElementById('ideaAuthor').value = 'Creative User';
  }
  
  modal.style.display = 'flex';
  isModalOpen = true;
  setTimeout(() => document.getElementById('ideaTitle').focus(), 100);
}

function closeModal() {
  modal.style.display = 'none';
  isModalOpen = false;
  currentEditId = null;
}

function handleSaveIdea() {
  const title = document.getElementById('ideaTitle').value.trim();
  const desc = document.getElementById('ideaDesc').value;
  const category = document.getElementById('ideaCategory').value;
  const author = document.getElementById('ideaAuthor').value.trim();
  
  if (!title) {
    showToast('Please enter an idea title', 'error');
    document.getElementById('ideaTitle').focus();
    return;
  }
  
  if (currentEditId) {
    updateIdea(currentEditId, title, desc, category, author);
  } else {
    addIdea(title, desc, category, author);
  }
  closeModal();
}

// --- Detail Modal ---
function openDetailModal(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;
  currentDetailId = id;
  
  const categoryInfo = getCategoryInfo(idea.category);
  const detailBody = document.getElementById('detailBody');
  const detailTitle = document.getElementById('detailTitle');
  
  detailTitle.innerHTML = `<i class="fas ${categoryInfo.icon}"></i> ${escapeHtml(idea.title)}`;
  
  detailBody.innerHTML = `
    <div class="detail-field">
      <div class="detail-label">Category</div>
      <div class="detail-value">
        <span class="tag ${idea.category}" style="margin:0">
          <i class="fas ${categoryInfo.icon}"></i> ${categoryInfo.label}
        </span>
      </div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Description</div>
      <div class="detail-value">${escapeHtml(idea.description) || 'No description provided.'}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Author</div>
      <div class="detail-value"><i class="fas fa-user"></i> ${escapeHtml(idea.author)}</div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Stats</div>
      <div class="detail-value">
        <span style="margin-right: 16px;"><i class="fas fa-heart" style="color:#ef4444"></i> ${idea.likes || 0} likes</span>
        <span><i class="fas fa-comment"></i> ${idea.comments || 0} comments</span>
      </div>
    </div>
    <div class="detail-field">
      <div class="detail-label">Created</div>
      <div class="detail-value">${new Date(idea.createdAt).toLocaleDateString()}</div>
    </div>
  `;
  
  detailModal.style.display = 'flex';
}

function closeDetailModal() {
  detailModal.style.display = 'none';
  currentDetailId = null;
}

function editFromDetail() {
  if (currentDetailId) {
    closeDetailModal();
    openModal(currentDetailId);
  }
}

// --- Toast ---
let toastTimeout = null;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  const iconElem = toast.querySelector('i');
  
  toastText.textContent = message;
  if (type === 'success') {
    iconElem.className = 'fas fa-check-circle';
    iconElem.style.color = '#10b981';
  } else if (type === 'error') {
    iconElem.className = 'fas fa-exclamation-triangle';
    iconElem.style.color = '#f97316';
  } else {
    iconElem.className = 'fas fa-info-circle';
    iconElem.style.color = '#3b82f6';
  }
  
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
  loadIdeasFromStorage();
  renderIdeas();
  
  // Modal event bindings
  const floatingBtn = document.getElementById('floatingAddBtn');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const saveBtn = document.getElementById('saveIdeaBtn');
  const closeDetail = document.getElementById('closeDetailBtn');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');
  const editFromDetailBtn = document.getElementById('editFromDetailBtn');
  
  if (floatingBtn) floatingBtn.addEventListener('click', () => openModal());
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (saveBtn) saveBtn.addEventListener('click', handleSaveIdea);
  if (closeDetail) closeDetail.addEventListener('click', closeDetailModal);
  if (closeDetailModalBtn) closeDetailModalBtn.addEventListener('click', closeDetailModal);
  if (editFromDetailBtn) editFromDetailBtn.addEventListener('click', editFromDetail);
  
  // Close modals on outside click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) closeDetailModal();
  });
  
  // Keyboard shortcut: Ctrl/Cmd + N
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openModal();
    }
    if (e.key === 'Escape') {
      if (isModalOpen) closeModal();
      if (detailModal.style.display === 'flex') closeDetailModal();
    }
  });
});
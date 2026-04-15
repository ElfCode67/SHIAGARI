// SHIAGARI - Idea Factory
// Clean, maintainable, KISS/DRY/YAGNI compliant

// ========== DATA ==========
let ideas = [];
let editId = null;

// Category configuration - single source of truth
const CATEGORIES = {
  sketch: { icon: 'fa-paintbrush', label: 'Sketch' },
  flowchart: { icon: 'fa-diagram-project', label: 'Flowchart' },
  color: { icon: 'fa-palette', label: 'Color Palette' },
  design: { icon: 'fa-pen-ruler', label: 'Design' },
  tech: { icon: 'fa-microchip', label: 'Tech' },
  business: { icon: 'fa-chart-line', label: 'Business' }
};

// DOM Elements
const elements = {
  grid: document.getElementById('ideaGrid'),
  count: document.getElementById('ideaCount'),
  modal: document.getElementById('ideaModal'),
  detailModal: document.getElementById('detailModal'),
  modalTitle: document.getElementById('modalTitle'),
  saveBtn: document.getElementById('saveIdeaBtn'),
  toast: document.getElementById('toastMsg'),
  toastText: document.getElementById('toastText')
};

// ========== STORAGE ==========
function saveToStorage() {
  localStorage.setItem('shiagari_ideas', JSON.stringify(ideas));
  elements.count.textContent = ideas.length;
}

function loadFromStorage() {
  const stored = localStorage.getItem('shiagari_ideas');
  if (stored) {
    ideas = JSON.parse(stored);
  } else {
    // Demo data
    ideas = [
      { id: 'i1', title: 'Neumorphic Design System', description: 'Complete UI kit with soft shadows and modern aesthetics.', category: 'design', author: 'Alex Chen', likes: 12, createdAt: Date.now() },
      { id: 'i2', title: 'AI Storyboard Generator', description: 'Generate visual storyboards from text prompts using AI.', category: 'sketch', author: 'Jamie L.', likes: 8, createdAt: Date.now() },
      { id: 'i3', title: 'Data Flow Visualizer', description: 'Interactive flowchart tool for system architecture.', category: 'flowchart', author: 'Taylor W.', likes: 15, createdAt: Date.now() },
      { id: 'i4', title: 'Sunset Gradient Palette', description: 'Warm orange to purple gradients for UI backgrounds.', category: 'color', author: 'Morgan K.', likes: 23, createdAt: Date.now() }
    ];
    saveToStorage();
  }
  elements.count.textContent = ideas.length;
}

// ========== UI HELPERS ==========
function escape(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, (m) => m === '&' ? '&amp;' : m === '<' ? '&lt;' : '&gt;');
}

function showToast(message, isError = false) {
  const icon = elements.toast.querySelector('i');
  icon.className = isError ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
  icon.style.color = isError ? '#f97316' : '#10b981';
  elements.toastText.textContent = message;
  elements.toast.classList.add('show');
  setTimeout(() => elements.toast.classList.remove('show'), 2500);
}

// ========== RENDER ==========
function render() {
  if (!ideas.length) {
    elements.grid.innerHTML = `<div class="empty-state"><i class="fas fa-lightbulb"></i><p>No ideas yet. Click + to create one!</p></div>`;
    return;
  }

  elements.grid.innerHTML = ideas.map(idea => {
    const cat = CATEGORIES[idea.category];
    return `
      <div class="idea-card" data-id="${idea.id}" data-category="${idea.category}">
        <div class="idea-image"><i class="fas ${cat.icon}"></i></div>
        <div class="idea-content">
          <div class="idea-title">${escape(idea.title)}</div>
          <div class="idea-desc">${escape(idea.description || 'No description')}</div>
          <span class="tag ${idea.category}"><i class="fas ${cat.icon}"></i> ${cat.label}</span>
          <div class="idea-footer">
            <div class="author-info"><i class="fas fa-user-circle"></i> ${escape(idea.author)}</div>
            <div class="idea-actions">
              <span class="like-idea" data-id="${idea.id}">
                <i class="fas fa-heart"></i> ${idea.likes}
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
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const idea = ideas.find(i => i.id === id);
      if (idea) {
        idea.likes++;
        saveToStorage();
        render();
        showToast(`❤️ Liked "${idea.title}"`);
      }
    });
  });

  document.querySelectorAll('.delete-idea').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const idea = ideas.find(i => i.id === id);
      if (idea && confirm(`Delete "${idea.title}"?`)) {
        ideas = ideas.filter(i => i.id !== id);
        saveToStorage();
        render();
        showToast(`🗑️ "${idea.title}" deleted`);
      }
    });
  });
}

// ========== DETAIL MODAL ==========
function showDetail(id) {
  const idea = ideas.find(i => i.id === id);
  if (!idea) return;

  const cat = CATEGORIES[idea.category];
  const detailBody = document.getElementById('detailBody');
  const detailTitle = document.getElementById('detailTitle');

  detailTitle.innerHTML = `<i class="fas ${cat.icon}"></i> ${escape(idea.title)}`;
  detailBody.innerHTML = `
    <div class="detail-field"><div class="detail-label">Category</div><div class="detail-value"><span class="tag ${idea.category}"><i class="fas ${cat.icon}"></i> ${cat.label}</span></div></div>
    <div class="detail-field"><div class="detail-label">Description</div><div class="detail-value">${escape(idea.description) || 'No description.'}</div></div>
    <div class="detail-field"><div class="detail-label">Author</div><div class="detail-value"><i class="fas fa-user"></i> ${escape(idea.author)}</div></div>
    <div class="detail-field"><div class="detail-label">Stats</div><div class="detail-value"><span style="margin-right:16px"><i class="fas fa-heart" style="color:#ef4444"></i> ${idea.likes} likes</span></div></div>
    <div class="detail-field"><div class="detail-label">Created</div><div class="detail-value">${new Date(idea.createdAt).toLocaleDateString()}</div></div>
  `;
  
  elements.detailModal.style.display = 'flex';
  document.getElementById('editFromDetailBtn').onclick = () => {
    elements.detailModal.style.display = 'none';
    openModal(id);
  };
}

function closeDetailModal() {
  elements.detailModal.style.display = 'none';
}

// ========== ADD/EDIT MODAL ==========
function openModal(id = null) {
  editId = id;
  const isEdit = !!id;
  const idea = isEdit ? ideas.find(i => i.id === id) : null;

  elements.modalTitle.innerHTML = isEdit ? '<i class="fas fa-edit"></i> Edit Idea' : '<i class="fas fa-lightbulb"></i> New Idea';
  elements.saveBtn.textContent = isEdit ? 'Update Idea' : 'Save Idea';

  document.getElementById('ideaTitle').value = idea?.title || '';
  document.getElementById('ideaDesc').value = idea?.description || '';
  document.getElementById('ideaCategory').value = idea?.category || 'design';
  document.getElementById('ideaAuthor').value = idea?.author || 'Creative User';

  elements.modal.style.display = 'flex';
  setTimeout(() => document.getElementById('ideaTitle').focus(), 100);
}

function closeModal() {
  elements.modal.style.display = 'none';
  editId = null;
}

function saveIdea() {
  const title = document.getElementById('ideaTitle').value.trim();
  if (!title) {
    showToast('Title is required', true);
    return;
  }

  const ideaData = {
    title,
    description: document.getElementById('ideaDesc').value.trim(),
    category: document.getElementById('ideaCategory').value,
    author: document.getElementById('ideaAuthor').value.trim() || 'Anonymous'
  };

  if (editId) {
    const index = ideas.findIndex(i => i.id === editId);
    if (index !== -1) {
      ideas[index] = { ...ideas[index], ...ideaData };
      showToast(`📝 "${title}" updated`);
    }
  } else {
    ideas.unshift({
      id: Date.now().toString(),
      ...ideaData,
      likes: 0,
      createdAt: Date.now()
    });
    showToast(`✨ "${title}" added!`);
  }

  saveToStorage();
  render();
  closeModal();
}

// ========== INITIALIZATION ==========
function init() {
  loadFromStorage();
  render();

  // Modal close handlers
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const closeDetailBtn = document.getElementById('closeDetailBtn');
  const closeDetailModalBtn = document.getElementById('closeDetailModalBtn');

  document.getElementById('floatingAddBtn').onclick = () => openModal();
  document.getElementById('saveIdeaBtn').onclick = saveIdea;
  closeModalBtn?.addEventListener('click', closeModal);
  cancelModalBtn?.addEventListener('click', closeModal);
  closeDetailBtn?.addEventListener('click', closeDetailModal);
  closeDetailModalBtn?.addEventListener('click', closeDetailModal);

  // Close modals on outside click
  elements.modal.addEventListener('click', (e) => { if (e.target === elements.modal) closeModal(); });
  elements.detailModal.addEventListener('click', (e) => { if (e.target === elements.detailModal) closeDetailModal(); });

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (elements.modal.style.display === 'flex') closeModal();
      if (elements.detailModal.style.display === 'flex') closeDetailModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openModal();
    }
  });
}

// Start the app
init();
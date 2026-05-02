// SHIAGARI - Idea Factory (Frontend Only)

let ideas = [];
let editId = null;

// Category labels
const categoryLabels = {
  sketch: 'Sketch', flowchart: 'Flowchart', color: 'Color',
  design: 'Design', tech: 'Tech', business: 'Business'
};

// ========== DATA (Backend: replace with API) ==========

function loadData() {
  // TODO: Replace with fetch('/api/ideas')
  const stored = localStorage.getItem('ideas');
  ideas = stored ? JSON.parse(stored) : [
    { id: 1, title: 'Neumorphic Design', description: 'Soft shadows UI kit', category: 'design', author: 'Alex', likes: 12, createdAt: Date.now() },
    { id: 2, title: 'AI Storyboard', description: 'Generate storyboards from text', category: 'sketch', author: 'Jamie', likes: 8, createdAt: Date.now() },
    { id: 3, title: 'Data Flow Tool', description: 'Interactive flowcharts', category: 'flowchart', author: 'Taylor', likes: 15, createdAt: Date.now() }
  ];
  render();
  updateCount();
}

function saveData() {
  // TODO: Replace with fetch('/api/ideas', { method: 'POST' })
  localStorage.setItem('ideas', JSON.stringify(ideas));
  updateCount();
}

function updateCount() {
  document.getElementById('ideaCount').innerText = ideas.length;
}

// ========== RENDER ==========

function render() {
  const container = document.getElementById('ideasContainer');
  
  if (!ideas.length) {
    container.innerHTML = '<div class="empty-state">No ideas. Click + to add.</div>';
    return;
  }
  
  container.innerHTML = ideas.map(idea => `
    <div class="idea-card" data-id="${idea.id}" data-category="${idea.category}">
      <div class="idea-image"><i class="fas ${getIcon(idea.category)}"></i></div>
      <div class="idea-content">
        <div class="idea-title">${escapeHtml(idea.title)}</div>
        <div class="idea-desc">${escapeHtml(idea.description || 'No description')}</div>
        <span class="tag ${idea.category}">${categoryLabels[idea.category]}</span>
        <div class="idea-footer">
          <span><i class="fas fa-user"></i> ${escapeHtml(idea.author)}</span>
          <div class="idea-actions">
            <span class="like-idea" data-id="${idea.id}"><i class="fas fa-heart"></i> ${idea.likes}</span>
            <span class="delete-idea" data-id="${idea.id}"><i class="fas fa-trash-alt"></i></span>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Event handlers
  document.querySelectorAll('.idea-card').forEach(card => {
    card.onclick = (e) => {
      if (!e.target.closest('.like-idea') && !e.target.closest('.delete-idea')) {
        showDetail(card.dataset.id);
      }
    };
  });
  
  document.querySelectorAll('.like-idea').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const idea = ideas.find(i => i.id == id);
      if (idea) {
        idea.likes++;
        saveData();
        render();
        showToast(`Liked "${idea.title}"`);
      }
    };
  });
  
  document.querySelectorAll('.delete-idea').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const idea = ideas.find(i => i.id == id);
      if (idea && confirm(`Delete "${idea.title}"?`)) {
        ideas = ideas.filter(i => i.id != id);
        saveData();
        render();
        showToast('Idea deleted');
      }
    };
  });
}

function getIcon(category) {
  const icons = { sketch: 'fa-paintbrush', flowchart: 'fa-diagram-project', color: 'fa-palette', design: 'fa-pen-ruler', tech: 'fa-microchip', business: 'fa-chart-line' };
  return icons[category] || 'fa-lightbulb';
}

// ========== DETAIL MODAL ==========

function showDetail(id) {
  const idea = ideas.find(i => i.id == id);
  if (!idea) return;
  
  document.getElementById('detailTitle').innerHTML = `<i class="fas ${getIcon(idea.category)}"></i> ${escapeHtml(idea.title)}`;
  document.getElementById('detailBody').innerHTML = `
    <div class="detail-field"><div class="detail-label">Category</div><div class="detail-value">${categoryLabels[idea.category]}</div></div>
    <div class="detail-field"><div class="detail-label">Description</div><div class="detail-value">${escapeHtml(idea.description || 'No description')}</div></div>
    <div class="detail-field"><div class="detail-label">Author</div><div class="detail-value">${escapeHtml(idea.author)}</div></div>
    <div class="detail-field"><div class="detail-label">Likes</div><div class="detail-value">❤️ ${idea.likes}</div></div>
    <div class="detail-field"><div class="detail-label">Created</div><div class="detail-value">${new Date(idea.createdAt).toLocaleDateString()}</div></div>
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

// ========== ADD/EDIT MODAL ==========

function openModal(id = null) {
  editId = id;
  const idea = id ? ideas.find(i => i.id == id) : null;
  
  document.getElementById('modalTitle').innerText = id ? 'Edit Idea' : 'New Idea';
  document.getElementById('saveIdeaBtn').innerText = id ? 'Update' : 'Save';
  document.getElementById('ideaTitle').value = idea?.title || '';
  document.getElementById('ideaDesc').value = idea?.description || '';
  document.getElementById('ideaCategory').value = idea?.category || 'design';
  document.getElementById('ideaAuthor').value = idea?.author || 'Creative User';
  
  document.getElementById('ideaModal').style.display = 'flex';
  document.getElementById('ideaTitle').focus();
}

function closeModal() {
  document.getElementById('ideaModal').style.display = 'none';
  editId = null;
}

function saveIdea() {
  const title = document.getElementById('ideaTitle').value.trim();
  if (!title) return showToast('Title required', true);
  
  const ideaData = {
    title: title,
    description: document.getElementById('ideaDesc').value,
    category: document.getElementById('ideaCategory').value,
    author: document.getElementById('ideaAuthor').value || 'Anonymous'
  };
  
  if (editId) {
    const index = ideas.findIndex(i => i.id == editId);
    ideas[index] = { ...ideas[index], ...ideaData };
    showToast('Idea updated');
  } else {
    ideas.unshift({
      id: Date.now(),
      ...ideaData,
      likes: 0,
      createdAt: Date.now()
    });
    showToast('Idea added');
  }
  
  saveData();
  render();
  closeModal();
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
  loadData();
  
  document.getElementById('addIdeaBtn').onclick = () => openModal();
  document.getElementById('saveIdeaBtn').onclick = saveIdea;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('cancelModalBtn').onclick = closeModal;
  document.getElementById('closeDetailBtn').onclick = closeDetailModal;
  document.getElementById('closeDetailModalBtn').onclick = closeDetailModal;
  
  // Close modals on outside click
  document.getElementById('ideaModal').onclick = (e) => {
    if (e.target === document.getElementById('ideaModal')) closeModal();
  };
  document.getElementById('detailModal').onclick = (e) => {
    if (e.target === document.getElementById('detailModal')) closeDetailModal();
  };
});
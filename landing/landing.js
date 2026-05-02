// SHIAGARI - Projects (Frontend Only)

let projects = [];

// ========== DATA (Backend team: replace with API calls) ==========

function loadData() {
  // TODO: Replace with API call
  // fetch('/api/projects').then(res => res.json()).then(data => projects = data)
  
  const stored = localStorage.getItem('projects');
  projects = stored ? JSON.parse(stored) : [
    { id: 1, name: 'Nexus OS', description: 'Dashboard system', status: 'active' },
    { id: 2, name: 'Lumina AI', description: 'AI assistant', status: 'active' },
    { id: 3, name: 'Stellar UI', description: 'Component library', status: 'planning' }
  ];
  render();
}

function saveData() {
  // TODO: Replace with API call
  // fetch('/api/projects', { method: 'POST', body: JSON.stringify(projects) })
  
  localStorage.setItem('projects', JSON.stringify(projects));
  updateCount();
}

// ========== UI RENDER ==========

function render() {
  const container = document.getElementById('projectsContainer');
  if (!projects.length) {
    container.innerHTML = '<div class="empty-state">No projects. Click + to add.</div>';
    return;
  }
  
  container.innerHTML = projects.map(p => `
    <div class="project-card" data-status="${p.status}">
      <div class="card-title">${escapeHtml(p.name)}</div>
      <div class="card-desc">${escapeHtml(p.description)}</div>
      <div class="card-footer">
        <span>${p.status}</span>
        <button class="delete-btn" data-id="${p.id}">🗑️</button>
      </div>
    </div>
  `).join('');
  
  // Add delete handlers
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.onclick = () => deleteProject(btn.dataset.id);
  });
  
  updateCount();
}

function updateCount() {
  document.getElementById('projectCount').innerText = projects.length;
}

// ========== CRUD ==========

function addProject() {
  const name = document.getElementById('projectName').value.trim();
  if (!name) return showToast('Name required', true);
  
  projects.unshift({
    id: Date.now(),
    name: name,
    description: document.getElementById('projectDesc').value,
    status: document.getElementById('projectStatus').value
  });
  
  saveData();
  render();
  closeModal();
  showToast('Project added');
}

function deleteProject(id) {
  if (confirm('Delete this project?')) {
    projects = projects.filter(p => p.id != id);
    saveData();
    render();
    showToast('Project deleted');
  }
}

// ========== MODAL ==========

function openModal() {
  document.getElementById('projectModal').style.display = 'flex';
  document.getElementById('projectName').focus();
}

function closeModal() {
  document.getElementById('projectModal').style.display = 'none';
}

// ========== TOAST ==========

function showToast(msg, isError = false) {
  const toast = document.getElementById('toastMsg');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

// ========== HELPERS ==========

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

// ========== INIT ==========

document.addEventListener('DOMContentLoaded', () => {
  loadData();
  
  // Add button
  document.querySelector('.add-btn')?.addEventListener('click', openModal);
  
  // Modal buttons
  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('saveProjectBtn')?.addEventListener('click', addProject);
  
  // Close modal on outside click
  document.getElementById('projectModal')?.addEventListener('click', (e) => {
    if (e.target === document.getElementById('projectModal')) closeModal();
  });
});
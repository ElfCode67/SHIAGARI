// SHIAGARI - Projects Interactive Manager

// --- Data Layer ---
let projects = [];

// Load projects from localStorage or initialize with demo data
function loadProjectsFromStorage() {
  const stored = localStorage.getItem('shiagari_projects');
  if (stored) {
    projects = JSON.parse(stored);
  } else {
    // Demo projects that match original style (filled cards)
    projects = [
      {
        id: 'p1',
        name: 'Nexus OS',
        description: 'Next-gen dashboard interface with real-time analytics',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'p2',
        name: 'Lumina AI',
        description: 'Intelligent code assistant & automation engine',
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        id: 'p3',
        name: 'Stellar UI',
        description: 'Component library for immersive dashboards',
        status: 'planning',
        createdAt: new Date().toISOString()
      },
      {
        id: 'p4',
        name: 'Quantum DB',
        description: 'High-performance data pipeline and storage',
        status: 'hold',
        createdAt: new Date().toISOString()
      }
    ];
    saveProjectsToStorage();
  }
  updateProjectCount();
}

function saveProjectsToStorage() {
  localStorage.setItem('shiagari_projects', JSON.stringify(projects));
  updateProjectCount();
}

function updateProjectCount() {
  const countSpan = document.getElementById('projectCount');
  if (countSpan) {
    countSpan.textContent = projects.length;
  }
}

// --- Helper: Get status icon and label ---
function getStatusIconAndLabel(status) {
  switch (status) {
    case 'active':
      return { icon: 'fa-play-circle', label: 'Active', class: 'active' };
    case 'planning':
      return { icon: 'fa-draw-polygon', label: 'Planning', class: 'planning' };
    case 'hold':
      return { icon: 'fa-pause-circle', label: 'On Hold', class: 'hold' };
    default:
      return { icon: 'fa-circle', label: 'Active', class: 'active' };
  }
}

// --- Render Projects Grid ---
function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-folder-open"></i>
        <p>No projects yet. Click + to create your first project!</p>
      </div>
      <div class="add-btn" id="openModalBtn">+</div>
    `;
    const addEmptyBtn = document.getElementById('openModalBtn');
    if (addEmptyBtn) addEmptyBtn.addEventListener('click', openModal);
    return;
  }

  let cardsHTML = '';
  projects.forEach(project => {
    const statusInfo = getStatusIconAndLabel(project.status);
    const descText = project.description || 'No description provided.';
    // Escape to avoid injection
    const safeName = escapeHtml(project.name);
    const safeDesc = escapeHtml(descText);
    
    cardsHTML += `
      <div class="project-card" data-id="${project.id}" data-status="${project.status}">
        <div class="card-header">
          <div class="card-title">
            <i class="fas fa-cube"></i>
            <span>${safeName}</span>
          </div>
        </div>
        <div class="card-desc">${safeDesc}</div>
        <div class="card-footer">
          <span class="status-badge ${statusInfo.class}">
            <i class="fas ${statusInfo.icon}"></i> ${statusInfo.label}
          </span>
          <button class="delete-card" data-id="${project.id}" title="Delete project">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `;
  });
  
  // Add the "+" button at the end
  cardsHTML += `<div class="add-btn" id="openModalBtn">+</div>`;
  grid.innerHTML = cardsHTML;
  
  // Attach delete event listeners to each delete button
  document.querySelectorAll('.delete-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteProjectById(id);
    });
  });
  
  // Attach modal opener
  const addBtn = document.getElementById('openModalBtn');
  if (addBtn) addBtn.addEventListener('click', openModal);
}

// Simple escape to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  }).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, function(c) {
    return c;
  });
}

// --- CRUD Operations ---
function addProject(name, description, status) {
  if (!name || name.trim() === '') {
    showToast('Project name is required', 'error');
    return false;
  }
  const newProject = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    description: description?.trim() || '',
    status: status || 'active',
    createdAt: new Date().toISOString()
  };
  projects.unshift(newProject); // add to beginning
  saveProjectsToStorage();
  renderProjects();
  showToast(`"${newProject.name}" created successfully`, 'success');
  return true;
}

function deleteProjectById(id) {
  const projectToDelete = projects.find(p => p.id === id);
  if (!projectToDelete) return;
  
  // Confirm before deletion (polite UX)
  if (confirm(`Delete "${projectToDelete.name}"? This action cannot be undone.`)) {
    projects = projects.filter(p => p.id !== id);
    saveProjectsToStorage();
    renderProjects();
    showToast(`"${projectToDelete.name}" removed`, 'info');
  }
}

// --- Toast Notification ---
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
  }, 2800);
}

// --- Modal Logic ---
const modal = document.getElementById('projectModal');
let isModalOpen = false;

function openModal() {
  if (!modal) return;
  // Reset form fields
  document.getElementById('projectName').value = '';
  document.getElementById('projectDesc').value = '';
  document.getElementById('projectStatus').value = 'active';
  modal.style.display = 'flex';
  isModalOpen = true;
  // Focus on name field
  setTimeout(() => document.getElementById('projectName').focus(), 100);
}

function closeModal() {
  if (modal) {
    modal.style.display = 'none';
    isModalOpen = false;
  }
}

function handleCreateProject() {
  const name = document.getElementById('projectName').value.trim();
  const desc = document.getElementById('projectDesc').value;
  const status = document.getElementById('projectStatus').value;
  
  if (!name) {
    showToast('Please enter a project name', 'error');
    document.getElementById('projectName').focus();
    return;
  }
  
  const success = addProject(name, desc, status);
  if (success) {
    closeModal();
  }
}

// --- Event Listeners & Init ---
document.addEventListener('DOMContentLoaded', () => {
  loadProjectsFromStorage();
  renderProjects();
  
  // Modal event bindings
  const modalElem = document.getElementById('projectModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const cancelBtn = document.getElementById('cancelModalBtn');
  const saveBtn = document.getElementById('saveProjectBtn');
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
  if (saveBtn) saveBtn.addEventListener('click', handleCreateProject);
  
  // Close modal when clicking outside content
  if (modalElem) {
    modalElem.addEventListener('click', (e) => {
      if (e.target === modalElem) closeModal();
    });
  }
  
  // Keyboard shortcuts: ESC closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }
    // optional: ctrl/cmd + N to open modal
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openModal();
    }
  });
  
  // Small UX: tooltip for add button will be handled naturally, but also store ref
});
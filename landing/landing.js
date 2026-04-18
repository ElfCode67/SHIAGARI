// SHIAGARI - Projects Manager

let projects = [];

function loadProjects() {
  const stored = localStorage.getItem('shiagari_projects');
  if (stored) {
    projects = JSON.parse(stored);
  } else {
    projects = [
      { id: 'p1', name: 'Nexus OS', description: 'Next-gen dashboard with real-time analytics', status: 'active', createdAt: new Date().toISOString() },
      { id: 'p2', name: 'Lumina AI', description: 'Intelligent code assistant engine', status: 'active', createdAt: new Date().toISOString() },
      { id: 'p3', name: 'Stellar UI', description: 'Component library for dashboards', status: 'planning', createdAt: new Date().toISOString() },
      { id: 'p4', name: 'Quantum DB', description: 'High-performance data pipeline', status: 'hold', createdAt: new Date().toISOString() }
    ];
    saveProjects();
  }
  updateCount();
}

function saveProjects() {
  localStorage.setItem('shiagari_projects', JSON.stringify(projects));
  updateCount();
}

function updateCount() {
  const countSpan = document.getElementById('projectCount');
  if (countSpan) countSpan.textContent = projects.length;
}

function getStatusInfo(status) {
  const map = {
    active: { icon: 'fa-play-circle', label: 'Active', class: 'active' },
    planning: { icon: 'fa-draw-polygon', label: 'Planning', class: 'planning' },
    hold: { icon: 'fa-pause-circle', label: 'On Hold', class: 'hold' }
  };
  return map[status] || map.active;
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

function renderProjects() {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  if (projects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><i class="fas fa-folder-open"></i><p>No projects yet. Click + to create!</p></div><div class="add-btn" id="openModalBtn">+</div>`;
    const btn = document.getElementById('openModalBtn');
    if (btn) btn.addEventListener('click', openModal);
    return;
  }

  let html = '';
  projects.forEach(proj => {
    const status = getStatusInfo(proj.status);
    html += `
      <div class="project-card" data-id="${proj.id}" data-status="${proj.status}">
        <div><div class="card-title"><i class="fas fa-cube"></i> ${escapeHtml(proj.name)}</div>
        <div class="card-desc">${escapeHtml(proj.description || 'No description')}</div></div>
        <div class="card-footer">
          <span class="status-badge ${status.class}"><i class="fas ${status.icon}"></i> ${status.label}</span>
          <button class="delete-card" data-id="${proj.id}"><i class="fas fa-trash-alt"></i></button>
        </div>
      </div>
    `;
  });
  html += `<div class="add-btn" id="openModalBtn">+</div>`;
  grid.innerHTML = html;

  document.querySelectorAll('.delete-card').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteProject(id);
    });
  });
  document.getElementById('openModalBtn')?.addEventListener('click', openModal);
}

function addProject(name, description, status) {
  if (!name || !name.trim()) {
    showToast('Project name required', 'error');
    return false;
  }
  const newProject = {
    id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6),
    name: name.trim(),
    description: description?.trim() || '',
    status: status || 'active',
    createdAt: new Date().toISOString()
  };
  projects.unshift(newProject);
  saveProjects();
  renderProjects();
  showToast(`"${newProject.name}" created`, 'success');
  return true;
}

function deleteProject(id) {
  const project = projects.find(p => p.id === id);
  if (project && confirm(`Delete "${project.name}"?`)) {
    projects = projects.filter(p => p.id !== id);
    saveProjects();
    renderProjects();
    showToast(`"${project.name}" removed`, 'info');
  }
}

let toastTimeout;
function showToast(message, type = 'success') {
  const toast = document.getElementById('toastMsg');
  const toastText = document.getElementById('toastText');
  const icon = toast.querySelector('i');
  if (type === 'error') {
    icon.className = 'fas fa-exclamation-triangle';
    icon.style.color = '#f97316';
  } else {
    icon.className = 'fas fa-check-circle';
    icon.style.color = '#10b981';
  }
  toastText.textContent = message;
  toast.classList.add('show');
  if (toastTimeout) clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove('show'), 2500);
}

const modal = document.getElementById('projectModal');
let isModalOpen = false;

function openModal() {
  if (!modal) return;
  document.getElementById('projectName').value = '';
  document.getElementById('projectDesc').value = '';
  document.getElementById('projectStatus').value = 'active';
  modal.style.display = 'flex';
  isModalOpen = true;
  setTimeout(() => document.getElementById('projectName').focus(), 100);
}

function closeModal() {
  if (modal) {
    modal.style.display = 'none';
    isModalOpen = false;
  }
}

function handleCreate() {
  const name = document.getElementById('projectName').value.trim();
  const desc = document.getElementById('projectDesc').value;
  const status = document.getElementById('projectStatus').value;
  if (!name) {
    showToast('Enter project name', 'error');
    return;
  }
  if (addProject(name, desc, status)) closeModal();
}

document.addEventListener('DOMContentLoaded', () => {
  loadProjects();
  renderProjects();

  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('saveProjectBtn')?.addEventListener('click', handleCreate);
  if (modal) {
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isModalOpen) closeModal();
  });

  // Roadmap placeholder
  document.getElementById('navRoadmap')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Roadmap planner coming soon!', 'info');
  });
});

// ==================== MEMBER LIST & ACCOUNT FUNCTIONALITY ====================

// Team members data (placeholder for future database)
const teamMembers = [
  { name: 'Vince Villar', role: 'Lead Developer', status: 'online', avatar: 'VV', color: '3b82f6' },
  { name: 'Ayelet De Castro', role: 'UI/UX Designer', status: 'online', avatar: 'AD', color: '10b981' },
  { name: 'Sean Arkin Balmes', role: 'Project Manager', status: 'away', avatar: 'SB', color: 'f59e0b' },
  { name: 'Maria Santos', role: 'QA Engineer', status: 'offline', avatar: 'MS', color: '8b5cf6' },
  { name: 'James Wilson', role: 'DevOps', status: 'online', avatar: 'JW', color: 'ef4444' }
];

// Current user data (placeholder for future authentication)
let currentUser = {
  name: 'Current User',
  status: 'online',
  avatar: 'ME',
  color: '3b82f6'
};

// Load member status from localStorage (placeholder)
function loadMemberStatus() {
  const stored = localStorage.getItem('shiagari_member_status');
  if (stored) {
    const statusMap = JSON.parse(stored);
    teamMembers.forEach(member => {
      if (statusMap[member.name]) {
        member.status = statusMap[member.name];
      }
    });
  }
  updateMemberListUI();
}

// Save member status (placeholder)
function saveMemberStatus() {
  const statusMap = {};
  teamMembers.forEach(member => {
    statusMap[member.name] = member.status;
  });
  localStorage.setItem('shiagari_member_status', JSON.stringify(statusMap));
}

// Update member list UI
function updateMemberListUI() {
  const membersList = document.getElementById('membersList');
  if (!membersList) return;
  
  membersList.innerHTML = teamMembers.map(member => `
    <div class="member" data-user="${member.name}" data-status="${member.status}">
      <img src="https://ui-avatars.com/api/?background=${member.color}&color=fff&name=${member.avatar}" alt="${member.name}">
      <div class="member-info">
        <span class="member-name">${escapeHtml(member.name)}</span>
        <span class="member-role">${escapeHtml(member.role)}</span>
      </div>
      <span class="status ${member.status}"></span>
    </div>
  `).join('');
  
  // Update member count
  const memberCount = document.getElementById('memberCount');
  if (memberCount) memberCount.textContent = teamMembers.length;
  
  // Attach click handlers for members (placeholder - future DM feature)
  document.querySelectorAll('.member').forEach(member => {
    member.addEventListener('click', () => {
      const userName = member.getAttribute('data-user');
      showToast(`@${userName} - Direct message coming soon!`, 'info');
    });
  });
}

// Update account info (placeholder for future auth)
function updateAccountUI() {
  const accountAvatar = document.querySelector('.account-avatar');
  const accountName = document.querySelector('.account-name');
  const accountStatus = document.querySelector('.account-status');
  
  if (accountAvatar) {
    accountAvatar.src = `https://ui-avatars.com/api/?background=${currentUser.color}&color=fff&name=${currentUser.avatar}&bold=true`;
  }
  if (accountName) accountName.textContent = currentUser.name;
  if (accountStatus) {
    accountStatus.textContent = currentUser.status.charAt(0).toUpperCase() + currentUser.status.slice(1);
    accountStatus.style.color = currentUser.status === 'online' ? '#10b981' : currentUser.status === 'away' ? '#f59e0b' : '#6b7280';
  }
}

// Settings button (placeholder for future user settings)
function initAccountButtons() {
  const settingsBtn = document.getElementById('settingsBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (settingsBtn) {
    settingsBtn.addEventListener('click', () => {
      showToast('User settings coming soon! (Future: PHP authentication)', 'info');
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showToast('Logout functionality coming soon with PHP backend!', 'info');
    });
  }
}

// Escape HTML helper (if not already defined)
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    return m;
  });
}

// Initialize member list and account
function initSidebarFeatures() {
  loadMemberStatus();
  updateAccountUI();
  initAccountButtons();
}

// Call this after DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSidebarFeatures);
} else {
  initSidebarFeatures();
}
// SHIAGARI - Projects Manager (PHP + MySQL Version)

let projects = [];

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

// Show loading spinner
function showLoading() {
    const grid = document.getElementById('projectsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-text">Loading projects...</p>
            </div>
        `;
    }
}

// Fetch projects from database
async function loadProjects() {
    showLoading();
    
    try {
        const response = await fetch('../api/projects.php');
        const data = await response.json();
        
        if (data.success) {
            projects = data.projects || [];
            renderProjects();
            updateCount();
        } else if (data.message === 'Not logged in') {
            window.location.href = '../index.php';
        } else {
            showErrorState();
        }
    } catch (error) {
        console.error('Error loading projects:', error);
        showErrorState();
        showToast('Error loading projects', 'error');
    }
}

// Show error state
function showErrorState() {
    const grid = document.getElementById('projectsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-container">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load projects</p>
                <button class="retry-btn" onclick="location.reload()">Retry</button>
            </div>
        `;
    }
}

// Save project to database
async function addProject(name, description, status) {
    if (!name || !name.trim()) {
        showToast('Project name required', 'error');
        return false;
    }
    
    // Show loading on save button
    const saveBtn = document.getElementById('saveProjectBtn');
    const originalText = saveBtn.innerHTML;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    saveBtn.disabled = true;
    
    try {
        const response = await fetch('../api/projects.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: name.trim(),
                description: description?.trim() || '',
                status: status || 'active'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadProjects();
            showToast(`"${name}" created`, 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error creating project', 'error');
        return false;
    } finally {
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Delete project from database
async function deleteProject(id) {
    const project = projects.find(p => p.id == id);
    if (!project) return;
    
    if (confirm(`Delete "${project.name}"?`)) {
        try {
            const response = await fetch(`../api/projects.php?id=${id}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                await loadProjects();
                showToast(`"${project.name}" removed`, 'info');
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error deleting project', 'error');
        }
    }
}

// Update project count in UI
function updateCount() {
    const countSpan = document.getElementById('projectCount');
    if (countSpan) countSpan.textContent = projects.length;
}

// Get status icon and label
function getStatusInfo(status) {
    const map = {
        active: { icon: 'fa-play-circle', label: 'Active', class: 'active' },
        planning: { icon: 'fa-draw-polygon', label: 'Planning', class: 'planning' },
        hold: { icon: 'fa-pause-circle', label: 'On Hold', class: 'hold' }
    };
    return map[status] || map.active;
}

// Escape HTML to prevent XSS
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Render projects grid
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
                <div>
                    <div class="card-title"><i class="fas fa-cube"></i> ${escapeHtml(proj.name)}</div>
                    <div class="card-desc">${escapeHtml(proj.description || 'No description')}</div>
                </div>
                <div class="card-footer">
                    <span class="status-badge ${status.class}"><i class="fas ${status.icon}"></i> ${status.label}</span>
                    <button class="delete-card" data-id="${proj.id}"><i class="fas fa-trash-alt"></i></button>
                </div>
            </div>
        `;
    });
    html += `<div class="add-btn" id="openModalBtn">+</div>`;
    grid.innerHTML = html;

    // Attach delete event listeners
    document.querySelectorAll('.delete-card').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = btn.getAttribute('data-id');
            deleteProject(id);
        });
    });
    
    // Attach modal opener
    document.getElementById('openModalBtn')?.addEventListener('click', openModal);
}

// Toast notification
let toastTimeout = null;

function showToast(message, type = 'success') {
    const toast = document.getElementById('toastMsg');
    const toastText = document.getElementById('toastText');
    const iconElem = toast.querySelector('i');
    
    toastText.textContent = message;
    if (type === 'error') {
        iconElem.className = 'fas fa-exclamation-triangle';
        iconElem.style.color = '#f97316';
    } else if (type === 'info') {
        iconElem.className = 'fas fa-info-circle';
        iconElem.style.color = '#3b82f6';
    } else {
        iconElem.className = 'fas fa-check-circle';
        iconElem.style.color = '#10b981';
    }
    
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// Modal logic
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

async function handleCreate() {
    const name = document.getElementById('projectName').value.trim();
    const desc = document.getElementById('projectDesc').value;
    const status = document.getElementById('projectStatus').value;
    
    if (!name) {
        showToast('Enter project name', 'error');
        return;
    }
    
    if (await addProject(name, desc, status)) {
        closeModal();
    }
}

// Add loading spinner CSS
function addLoadingStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .loading-container {
            text-align: center;
            padding: 60px 20px;
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid #1e293b;
            border-top-color: #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            color: #6b7280;
            font-size: 14px;
        }
        .error-container {
            text-align: center;
            padding: 60px 20px;
            color: #ef4444;
        }
        .error-container i {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .retry-btn {
            margin-top: 16px;
            padding: 8px 24px;
            background: #3b82f6;
            border: none;
            border-radius: 20px;
            color: white;
            cursor: pointer;
        }
        .retry-btn:hover {
            background: #2563eb;
        }
    `;
    document.head.appendChild(style);
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    addLoadingStyles();
    await checkAuth();
    await loadProjects();

    document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('cancelModalBtn')?.addEventListener('click', closeModal);
    document.getElementById('saveProjectBtn')?.addEventListener('click', handleCreate);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
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
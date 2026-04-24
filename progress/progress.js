// SHIAGARI - Progress Tracker (PHP + MySQL Version)

let currentProjectId = 'project1';
let tasks = [];

// Project names mapping
const projectNames = {
    project1: 'Dashboard Redesign',
    project2: 'Mobile App Launch',
    project3: 'API Integration'
};

const STATUS_ORDER = ['notstarted', 'inprogress', 'finished'];
const STATUS_LABELS = {
    notstarted: '📋 NOT STARTED',
    inprogress: '🔄 IN PROGRESS',
    finished: '✅ FINISHED'
};

const CATEGORY_CONFIG = {
    uiux: { name: 'UI/UX', color: '#ff2d75', class: 'uiux' },
    frontend: { name: 'Frontend', color: '#3b82f6', class: 'frontend' },
    backend: { name: 'Backend', color: '#ff3b30', class: 'backend' }
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

// Fetch tasks from database
async function loadTasks() {
    try {
        const response = await fetch(`../api/tasks.php?project_id=${currentProjectId}`);
        const data = await response.json();
        
        if (data.success) {
            tasks = data.tasks;
            renderCurrentProject();
            updateStats();
            updateChart();
        } else if (data.message === 'Not logged in') {
            window.location.href = '../index.php';
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showToast('Error loading tasks', 'error');
    }
}

// Add task to database
async function addTask(name, category, status) {
    if (!name || !name.trim()) {
        showToast('Task name is required', 'error');
        return false;
    }
    
    try {
        const response = await fetch('../api/tasks.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                project_id: currentProjectId,
                name: name.trim(),
                category: category,
                status: status,
                progress: status === 'finished' ? 100 : 0
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadTasks();
            showToast(`Task "${name}" added`, 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error adding task', 'error');
        return false;
    }
}

// Update task status (drag & drop)
async function updateTaskStatus(taskId, newStatus) {
    try {
        const response = await fetch('../api/tasks.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: taskId,
                status: newStatus,
                progress: newStatus === 'finished' ? 100 : undefined
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadTasks();
            showToast(`Task moved to ${STATUS_LABELS[newStatus]}`, 'success');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error updating task', 'error');
        return false;
    }
}

// Update task progress
async function updateTaskProgress(taskId, newProgress) {
    try {
        const response = await fetch('../api/tasks.php', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: taskId,
                progress: newProgress
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            await loadTasks();
            showToast(`Progress updated to ${newProgress}%`, 'info');
            return true;
        } else {
            showToast(data.message, 'error');
            return false;
        }
    } catch (error) {
        showToast('Error updating progress', 'error');
        return false;
    }
}

// Delete task from database
async function deleteTask(taskId) {
    const task = tasks.find(t => t.id == taskId);
    if (!task) return;
    
    if (confirm(`Delete "${task.name}"?`)) {
        try {
            const response = await fetch(`../api/tasks.php?id=${taskId}`, {
                method: 'DELETE'
            });
            const data = await response.json();
            
            if (data.success) {
                await loadTasks();
                showToast(`Task deleted`, 'info');
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Error deleting task', 'error');
        }
    }
}

// Helper functions
function getTasksByStatus(status) {
    return tasks.filter(task => task.status === status);
}

function findTaskById(taskId) {
    return tasks.find(t => t.id == taskId);
}

// Statistics
function calculateOverallProgress() {
    if (tasks.length === 0) return 0;
    const totalProgress = tasks.reduce((sum, task) => sum + (task.progress || 0), 0);
    return Math.round(totalProgress / tasks.length);
}

function calculateCategoryProgress() {
    const categories = { uiux: { total: 0, done: 0 }, frontend: { total: 0, done: 0 }, backend: { total: 0, done: 0 } };
    
    tasks.forEach(task => {
        if (categories[task.category]) {
            categories[task.category].total += 100;
            categories[task.category].done += task.progress || 0;
        }
    });
    
    const result = {};
    for (let cat in categories) {
        const total = categories[cat].total;
        result[cat] = total > 0 ? Math.round((categories[cat].done / total) * 100) : 0;
    }
    return result;
}

function updateStats() {
    const overallProgress = calculateOverallProgress();
    const statsSpan = document.getElementById('overallProgress');
    if (statsSpan) statsSpan.textContent = overallProgress;
}

function updateChart() {
    const categoryProgress = calculateCategoryProgress();
    const uiux = categoryProgress.uiux || 0;
    const frontend = categoryProgress.frontend || 0;
    const backend = categoryProgress.backend || 0;
    
    const total = uiux + frontend + backend;
    if (total === 0) {
        const chartCircle = document.getElementById('chartCircle');
        if (chartCircle) chartCircle.style.background = '#2d3f5f';
        return;
    }
    
    let uiuxEnd = (uiux / total) * 100;
    let frontendEnd = uiuxEnd + (frontend / total) * 100;
    
    const gradient = `conic-gradient(
        #ff2d75 0% ${uiuxEnd}%,
        #3b82f6 ${uiuxEnd}% ${frontendEnd}%,
        #ff3b30 ${frontendEnd}% 100%
    )`;
    
    const chartCircle = document.getElementById('chartCircle');
    if (chartCircle) chartCircle.style.background = gradient;
    
    const legendUIUX = document.getElementById('legendUIUX');
    const legendFrontend = document.getElementById('legendFrontend');
    const legendBackend = document.getElementById('legendBackend');
    
    if (legendUIUX) legendUIUX.textContent = `${uiux}%`;
    if (legendFrontend) legendFrontend.textContent = `${frontend}%`;
    if (legendBackend) legendBackend.textContent = `${backend}%`;
}

// Drag and drop
let draggedTaskId = null;

function attachDragAndDrop() {
    const tasks = document.querySelectorAll('.task[draggable="true"]');
    const columns = document.querySelectorAll('.column');
    
    tasks.forEach(task => {
        task.setAttribute('draggable', 'true');
        task.addEventListener('dragstart', handleDragStart);
        task.addEventListener('dragend', handleDragEnd);
    });
    
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('dragleave', handleDragLeave);
        column.addEventListener('drop', handleDrop);
    });
}

function handleDragStart(e) {
    draggedTaskId = this.getAttribute('data-task-id');
    this.style.opacity = '0.5';
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
    this.style.opacity = '';
    draggedTaskId = null;
    document.querySelectorAll('.column').forEach(col => {
        col.style.borderColor = '';
    });
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    this.style.borderColor = '#3b82f6';
}

function handleDragLeave(e) {
    this.style.borderColor = '';
}

async function handleDrop(e) {
    e.preventDefault();
    this.style.borderColor = '';
    const targetColumn = this.closest('.column');
    if (!targetColumn || !draggedTaskId) return;
    
    const newStatus = targetColumn.getAttribute('data-status');
    if (newStatus) {
        await updateTaskStatus(draggedTaskId, newStatus);
    }
}

// Render functions
function renderCurrentProject() {
    renderColumns();
    updateStats();
    updateChart();
}

function renderColumns() {
    const container = document.getElementById('trackerContainer');
    if (!container) return;
    
    let columnsHtml = '';
    
    STATUS_ORDER.forEach(status => {
        const tasksInStatus = getTasksByStatus(status);
        const statusLabel = STATUS_LABELS[status];
        const icon = status === 'notstarted' ? 'fa-clock' : (status === 'inprogress' ? 'fa-spinner fa-pulse' : 'fa-check-circle');
        
        columnsHtml += `
            <div class="column" data-status="${status}">
                <div class="column-header">
                    <h3><i class="fas ${icon}"></i> ${statusLabel}</h3>
                    <span class="task-count">${tasksInStatus.length}</span>
                </div>
                <div class="tasks-container" data-status="${status}">
        `;
        
        if (tasksInStatus.length === 0) {
            columnsHtml += `
                <div class="empty-column">
                    <i class="fas fa-inbox"></i>
                    <p>No tasks</p>
                </div>
            `;
        } else {
            tasksInStatus.forEach(task => {
                const category = CATEGORY_CONFIG[task.category] || CATEGORY_CONFIG.frontend;
                columnsHtml += `
                    <div class="task" data-task-id="${task.id}" draggable="true">
                        <div class="task-header">
                            <span class="task-name">${escapeHtml(task.name)}</span>
                            <span class="task-category category-${category.class}">${category.name}</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-label">
                                <span>Progress</span>
                                <span>${task.progress || 0}%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill ${(task.progress || 0) === 100 ? 'full' : ''}" style="width: ${task.progress || 0}%"></div>
                            </div>
                        </div>
                        <div class="task-actions">
                            <button class="task-action-btn increment-progress" data-id="${task.id}">
                                <i class="fas fa-plus-circle"></i> +10%
                            </button>
                            <button class="task-action-btn decrement-progress" data-id="${task.id}">
                                <i class="fas fa-minus-circle"></i> -10%
                            </button>
                            <button class="task-action-btn delete-task" data-id="${task.id}">
                                <i class="fas fa-trash-alt"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
            });
        }
        
        columnsHtml += `
                </div>
                <button class="add-task-btn" data-status="${status}">
                    <i class="fas fa-plus"></i> Add Task
                </button>
            </div>
        `;
    });
    
    columnsHtml += `
        <div class="chart-section">
            <div class="chart-title">
                <i class="fas fa-chart-pie"></i> Category Distribution
            </div>
            <div class="chart-circle" id="chartCircle"></div>
            <div class="legend">
                <div class="legend-item">
                    <div class="legend-left">
                        <div class="legend-color uiux"></div>
                        <span>UI/UX</span>
                    </div>
                    <span class="legend-value" id="legendUIUX">0%</span>
                </div>
                <div class="legend-item">
                    <div class="legend-left">
                        <div class="legend-color frontend"></div>
                        <span>Frontend</span>
                    </div>
                    <span class="legend-value" id="legendFrontend">0%</span>
                </div>
                <div class="legend-item">
                    <div class="legend-left">
                        <div class="legend-color backend"></div>
                        <span>Backend</span>
                    </div>
                    <span class="legend-value" id="legendBackend">0%</span>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = columnsHtml;
    attachTaskEventListeners();
    attachDragAndDrop();
}

function attachTaskEventListeners() {
    document.querySelectorAll('.increment-progress').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-id');
            const task = findTaskById(taskId);
            if (task) {
                const newProgress = Math.min(100, (task.progress || 0) + 10);
                await updateTaskProgress(taskId, newProgress);
            }
        });
    });
    
    document.querySelectorAll('.decrement-progress').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-id');
            const task = findTaskById(taskId);
            if (task) {
                const newProgress = Math.max(0, (task.progress || 0) - 10);
                await updateTaskProgress(taskId, newProgress);
            }
        });
    });
    
    document.querySelectorAll('.delete-task').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const taskId = btn.getAttribute('data-id');
            await deleteTask(taskId);
        });
    });
    
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const status = btn.getAttribute('data-status');
            openAddTaskModal(status);
        });
    });
}

// Modal functions
let currentModalStatus = null;

function openAddTaskModal(status) {
    currentModalStatus = status;
    const modal = document.getElementById('taskModal');
    const modalTitle = modal.querySelector('h3');
    modalTitle.innerHTML = `<i class="fas fa-plus-circle"></i> Add Task to ${STATUS_LABELS[status]}`;
    document.getElementById('taskName').value = '';
    document.getElementById('taskCategory').value = 'frontend';
    document.getElementById('taskColumn').value = status;
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('taskName').focus(), 100);
}

function closeModal() {
    document.getElementById('taskModal').style.display = 'none';
    currentModalStatus = null;
}

async function handleSaveTask() {
    const taskName = document.getElementById('taskName').value.trim();
    const category = document.getElementById('taskCategory').value;
    const status = document.getElementById('taskColumn').value;
    
    if (!taskName) {
        showToast('Please enter a task name', 'error');
        return;
    }
    
    await addTask(taskName, category, status);
    closeModal();
}

// Project selector
function initProjectSelector() {
    const select = document.getElementById('projectSelect');
    if (!select) return;
    
    select.addEventListener('change', async (e) => {
        currentProjectId = e.target.value;
        await loadTasks();
    });
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

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
    initProjectSelector();
    await loadTasks();
    
    const closeBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelModalBtn');
    const saveBtn = document.getElementById('saveTaskBtn');
    const modal = document.getElementById('taskModal');
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    if (saveBtn) saveBtn.addEventListener('click', handleSaveTask);
    
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'flex') {
            closeModal();
        }
    });
    
    // Roadmap placeholder
    const navRoadmap = document.getElementById('navRoadmap');
    if (navRoadmap) {
        navRoadmap.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Roadmap planner coming soon!', 'info');
        });
    }
});
// SHIAGARI - Progress Tracker (Frontend Only)

let currentProject = 'project1';
let tasks = [];

// Project names
const projectNames = {
  project1: 'Dashboard Redesign',
  project2: 'Mobile App Launch',
  project3: 'API Integration'
};

// Status order for columns
const statuses = [
  { id: 'notstarted', label: '📋 NOT STARTED', icon: 'fa-clock' },
  { id: 'inprogress', label: '🔄 IN PROGRESS', icon: 'fa-spinner' },
  { id: 'finished', label: '✅ FINISHED', icon: 'fa-check-circle' }
];

// Category labels
const categoryLabels = {
  uiux: { name: 'UI/UX', class: 'uiux' },
  frontend: { name: 'Frontend', class: 'frontend' },
  backend: { name: 'Backend', class: 'backend' }
};

// ========== DATA (Backend: replace with API) ==========

function loadTasks() {
  // TODO: Replace with fetch(`/api/tasks?project=${currentProject}`)
  const stored = localStorage.getItem(`tasks_${currentProject}`);
  
  if (stored) {
    tasks = JSON.parse(stored);
  } else {
    // Demo data
    tasks = [
      { id: 1, name: 'Wireframing', category: 'uiux', status: 'finished', progress: 100 },
      { id: 2, name: 'High-fidelity Mockups', category: 'uiux', status: 'finished', progress: 100 },
      { id: 3, name: 'Component Library', category: 'frontend', status: 'inprogress', progress: 65 },
      { id: 4, name: 'API Integration', category: 'backend', status: 'inprogress', progress: 40 },
      { id: 5, name: 'User Testing', category: 'uiux', status: 'notstarted', progress: 0 },
      { id: 6, name: 'Deployment Setup', category: 'backend', status: 'notstarted', progress: 0 }
    ];
    saveTasks();
  }
  
  renderKanban();
  updateOverallProgress();
}

function saveTasks() {
  // TODO: Replace with fetch(`/api/tasks/${currentProject}`, { method: 'POST' })
  localStorage.setItem(`tasks_${currentProject}`, JSON.stringify(tasks));
  updateOverallProgress();
}

function updateOverallProgress() {
  if (tasks.length === 0) {
    document.getElementById('overallProgress').innerText = '0';
    return;
  }
  const total = tasks.reduce((sum, t) => sum + t.progress, 0);
  const avg = Math.round(total / tasks.length);
  document.getElementById('overallProgress').innerText = avg;
}

// ========== RENDER KANBAN ==========

function renderKanban() {
  const container = document.getElementById('kanbanContainer');
  if (!container) return;
  
  let html = '';
  
  statuses.forEach(status => {
    const statusTasks = tasks.filter(t => t.status === status.id);
    
    html += `
      <div class="column" data-status="${status.id}">
        <div class="column-header">
          <h3><i class="fas ${status.icon}"></i> ${status.label}</h3>
          <span class="task-count">${statusTasks.length}</span>
        </div>
        <div class="tasks-container" data-status="${status.id}">
    `;
    
    if (statusTasks.length === 0) {
      html += `<div class="empty-column">No tasks</div>`;
    } else {
      statusTasks.forEach(task => {
        const category = categoryLabels[task.category] || categoryLabels.frontend;
        html += `
          <div class="task-card" draggable="true" data-task-id="${task.id}">
            <div class="task-header">
              <span class="task-name">${escapeHtml(task.name)}</span>
              <span class="task-category category-${category.class}">${category.name}</span>
            </div>
            <div class="progress-container">
              <div class="progress-label">
                <span>Progress</span>
                <span>${task.progress}%</span>
              </div>
              <div class="progress-bar">
                <div class="progress-fill ${task.progress === 100 ? 'full' : ''}" style="width: ${task.progress}%"></div>
              </div>
            </div>
            <div class="task-actions">
              <button class="task-action-btn increment" data-id="${task.id}">+10%</button>
              <button class="task-action-btn decrement" data-id="${task.id}">-10%</button>
              <button class="task-action-btn delete-task" data-id="${task.id}">Delete</button>
            </div>
          </div>
        `;
      });
    }
    
    html += `
        </div>
        <button class="add-task-btn" data-status="${status.id}">+ Add Task</button>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Attach event handlers
  attachTaskActions();
  attachDragAndDrop();
  attachAddTaskButtons();
}

function attachTaskActions() {
  // Increment progress
  document.querySelectorAll('.increment').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (task && task.progress < 100) {
        task.progress = Math.min(100, task.progress + 10);
        if (task.progress === 100) task.status = 'finished';
        else if (task.progress > 0 && task.status === 'notstarted') task.status = 'inprogress';
        saveTasks();
        renderKanban();
        showToast('Progress increased');
      }
    };
  });
  
  // Decrement progress
  document.querySelectorAll('.decrement').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (task && task.progress > 0) {
        task.progress = Math.max(0, task.progress - 10);
        if (task.progress === 0) task.status = 'notstarted';
        else if (task.progress < 100 && task.status === 'finished') task.status = 'inprogress';
        saveTasks();
        renderKanban();
        showToast('Progress decreased');
      }
    };
  });
  
  // Delete task
  document.querySelectorAll('.delete-task').forEach(btn => {
    btn.onclick = () => {
      const id = parseInt(btn.dataset.id);
      const task = tasks.find(t => t.id === id);
      if (task && confirm(`Delete "${task.name}"?`)) {
        tasks = tasks.filter(t => t.id !== id);
        saveTasks();
        renderKanban();
        showToast('Task deleted');
      }
    };
  });
}

function attachAddTaskButtons() {
  document.querySelectorAll('.add-task-btn').forEach(btn => {
    btn.onclick = () => {
      const status = btn.dataset.status;
      openAddTaskModal(status);
    };
  });
}

// ========== DRAG & DROP ==========

let draggedTaskId = null;

function attachDragAndDrop() {
  const tasks = document.querySelectorAll('.task-card[draggable="true"]');
  const columns = document.querySelectorAll('.column');
  
  tasks.forEach(task => {
    task.ondragstart = (e) => {
      draggedTaskId = parseInt(task.dataset.taskId);
      task.style.opacity = '0.5';
      e.dataTransfer.effectAllowed = 'move';
    };
    task.ondragend = () => {
      task.style.opacity = '';
      draggedTaskId = null;
    };
  });
  
  columns.forEach(column => {
    column.ondragover = (e) => {
      e.preventDefault();
      column.style.borderColor = '#3b82f6';
    };
    column.ondragleave = () => {
      column.style.borderColor = '';
    };
    column.ondrop = (e) => {
      e.preventDefault();
      column.style.borderColor = '';
      const newStatus = column.dataset.status;
      if (draggedTaskId && newStatus) {
        const task = tasks.find(t => t.id === draggedTaskId);
        if (task && task.status !== newStatus) {
          task.status = newStatus;
          if (newStatus === 'finished') task.progress = 100;
          else if (newStatus === 'notstarted') task.progress = 0;
          saveTasks();
          renderKanban();
          showToast(`Task moved to ${statuses.find(s => s.id === newStatus)?.label}`);
        }
      }
    };
  });
}

// ========== ADD TASK MODAL ==========

let currentModalStatus = null;

function openAddTaskModal(status) {
  currentModalStatus = status;
  document.getElementById('taskModal').style.display = 'flex';
  document.getElementById('taskName').value = '';
  document.getElementById('taskCategory').value = 'frontend';
  document.getElementById('taskName').focus();
}

function closeModal() {
  document.getElementById('taskModal').style.display = 'none';
  currentModalStatus = null;
}

function addTask() {
  const name = document.getElementById('taskName').value.trim();
  const category = document.getElementById('taskCategory').value;
  
  if (!name) {
    showToast('Task name required', true);
    return;
  }
  
  const newTask = {
    id: Date.now(),
    name: name,
    category: category,
    status: currentModalStatus,
    progress: currentModalStatus === 'finished' ? 100 : 0
  };
  
  tasks.push(newTask);
  saveTasks();
  renderKanban();
  closeModal();
  showToast(`Task "${name}" added`);
}

// ========== PROJECT SELECTOR ==========

function initProjectSelector() {
  const select = document.getElementById('projectSelect');
  if (!select) return;
  
  select.onchange = () => {
    currentProject = select.value;
    loadTasks();
  };
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
  initProjectSelector();
  loadTasks();
  
  // Modal buttons
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('cancelModalBtn').onclick = closeModal;
  document.getElementById('saveTaskBtn').onclick = addTask;
  
  // Close modal on outside click
  document.getElementById('taskModal').onclick = (e) => {
    if (e.target === document.getElementById('taskModal')) closeModal();
  };
});
// SHIAGARI - Roadmap (KISS, DRY, YAGNI compliant)

// ==================== DATA MODEL ====================
let epics = [];

// Load from localStorage or initialize with demo data
function loadEpics() {
  const stored = localStorage.getItem('shiagari_roadmap_epics');
  if (stored) {
    epics = JSON.parse(stored);
  } else {
    // Demo epics matching original design
    epics = [
      {
        id: 'e1',
        name: 'UI/UX Design System',
        color: 'pink',
        startQuarter: 0, // Q1
        duration: 2,     // 2 quarters (Q1-Q2)
        description: 'Complete design system with components, typography, and color palettes'
      },
      {
        id: 'e2',
        name: 'Frontend Core',
        color: 'blue',
        startQuarter: 1, // Q2
        duration: 3,     // Q2-Q4
        description: 'Build reusable components and state management'
      },
      {
        id: 'e3',
        name: 'API Gateway',
        color: 'red',
        startQuarter: 2, // Q3
        duration: 2,     // Q3-Q4
        description: 'RESTful API development and authentication'
      },
      {
        id: 'e4',
        name: 'Database Optimization',
        color: 'purple',
        startQuarter: 0, // Q1
        duration: 4,     // Full year
        description: 'Query optimization and data migration'
      }
    ];
    saveEpics();
  }
  updateTimelineStats();
}

function saveEpics() {
  localStorage.setItem('shiagari_roadmap_epics', JSON.stringify(epics));
  updateTimelineStats();
}

function updateTimelineStats() {
  const countSpan = document.getElementById('timelineSpan');
  if (countSpan) {
    countSpan.textContent = `${epics.length} epic${epics.length !== 1 ? 's' : ''}`;
  }
}

// ==================== HELPER FUNCTIONS ====================
function generateId() {
  return Date.now().toString() + '-' + Math.random().toString(36).substr(2, 6);
}

function getColorClass(color) {
  const colors = {
    pink: 'pink',
    blue: 'blue',
    red: 'red',
    green: 'green',
    purple: 'purple',
    orange: 'orange'
  };
  return colors[color] || 'blue';
}

function getQuarterName(quarterIndex) {
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  return quarters[quarterIndex] || 'Q1';
}

// Calculate bar position and width based on quarters (each quarter = 25% of timeline)
function getBarStyle(startQuarter, duration) {
  const startPercent = (startQuarter / 4) * 100;
  const widthPercent = (duration / 4) * 100;
  return {
    left: `${startPercent}%`,
    width: `${widthPercent}%`
  };
}

// ==================== CRUD OPERATIONS ====================
function addEpic(name, color, startQuarter, duration, description) {
  if (!name || name.trim() === '') {
    showToast('Epic name is required', 'error');
    return false;
  }
  
  const newEpic = {
    id: generateId(),
    name: name.trim(),
    color: color,
    startQuarter: parseInt(startQuarter),
    duration: parseInt(duration),
    description: description?.trim() || ''
  };
  
  epics.push(newEpic);
  saveEpics();
  renderTimeline();
  showToast(`✨ "${newEpic.name}" added to roadmap`, 'success');
  return true;
}

function updateEpic(id, name, color, startQuarter, duration, description) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return false;
  
  epic.name = name.trim();
  epic.color = color;
  epic.startQuarter = parseInt(startQuarter);
  epic.duration = parseInt(duration);
  epic.description = description?.trim() || '';
  
  saveEpics();
  renderTimeline();
  showToast(`📝 "${epic.name}" updated`, 'success');
  return true;
}

function deleteEpic(id) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return;
  
  if (confirm(`Delete "${epic.name}" from roadmap?`)) {
    epics = epics.filter(e => e.id !== id);
    saveEpics();
    renderTimeline();
    showToast(`🗑️ "${epic.name}" removed`, 'info');
  }
}

// ==================== RENDER TIMELINE ====================
function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;
  
  if (epics.length === 0) {
    container.innerHTML = `
      <div class="empty-timeline">
        <i class="fas fa-road"></i>
        <p>No epics yet. Click "Add Epic" to start planning your roadmap!</p>
      </div>
    `;
    return;
  }
  
  let html = '';
  epics.forEach(epic => {
    const barStyle = getBarStyle(epic.startQuarter, epic.duration);
    const colorClass = getColorClass(epic.color);
    const startQuarterName = getQuarterName(epic.startQuarter);
    const endQuarterIndex = epic.startQuarter + epic.duration - 1;
    const endQuarterName = getQuarterName(Math.min(endQuarterIndex, 3));
    const barLabel = `${epic.name} (${startQuarterName}-${endQuarterName})`;
    
    html += `
      <div class="timeline-row" data-epic-id="${epic.id}">
        <div class="epic-info">
          <div class="epic-label" title="${escapeHtml(epic.description || 'No description')}">
            ${escapeHtml(epic.name)}
          </div>
          <div class="epic-actions">
            <button class="epic-edit" data-id="${epic.id}" title="Edit">
              <i class="fas fa-edit"></i>
            </button>
            <button class="epic-delete" data-id="${epic.id}" title="Delete">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="bar-container">
          <div class="bar ${colorClass}" style="left: ${barStyle.left}; width: ${barStyle.width};">
            ${escapeHtml(barLabel)}
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Attach event listeners
  document.querySelectorAll('.epic-edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      openEditModal(id);
    });
  });
  
  document.querySelectorAll('.epic-delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.getAttribute('data-id');
      deleteEpic(id);
    });
  });
  
  // Make bars clickable to show details
  document.querySelectorAll('.bar').forEach(bar => {
    bar.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = bar.closest('.timeline-row');
      if (row) {
        const epicId = row.getAttribute('data-epic-id');
        showEpicDetails(epicId);
      }
    });
  });
}

// ==================== MODAL HANDLING ====================
let currentEditId = null;
let currentViewEpic = null;

function openAddModal() {
  currentEditId = null;
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-rocket"></i> Add Epic';
  document.getElementById('saveEpicBtn').textContent = 'Save Epic';
  
  // Reset form
  document.getElementById('epicName').value = '';
  document.getElementById('epicColor').value = 'blue';
  document.getElementById('durationSlider').value = '2';
  document.getElementById('durationValue').textContent = '2 quarters';
  document.getElementById('startQuarter').value = '1'; // Q2 default
  document.getElementById('epicDesc').value = '';
  
  document.getElementById('epicModal').style.display = 'flex';
  setTimeout(() => document.getElementById('epicName').focus(), 100);
}

function openEditModal(id) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return;
  
  currentEditId = id;
  document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit"></i> Edit Epic';
  document.getElementById('saveEpicBtn').textContent = 'Update Epic';
  
  document.getElementById('epicName').value = epic.name;
  document.getElementById('epicColor').value = epic.color;
  document.getElementById('durationSlider').value = epic.duration;
  document.getElementById('durationValue').textContent = `${epic.duration} quarter${epic.duration !== 1 ? 's' : ''}`;
  document.getElementById('startQuarter').value = epic.startQuarter;
  document.getElementById('epicDesc').value = epic.description || '';
  
  document.getElementById('epicModal').style.display = 'flex';
  setTimeout(() => document.getElementById('epicName').focus(), 100);
}

function closeModal() {
  document.getElementById('epicModal').style.display = 'none';
  currentEditId = null;
}

function handleSaveEpic() {
  const name = document.getElementById('epicName').value.trim();
  const color = document.getElementById('epicColor').value;
  const startQuarter = document.getElementById('startQuarter').value;
  const duration = document.getElementById('durationSlider').value;
  const description = document.getElementById('epicDesc').value;
  
  if (!name) {
    showToast('Please enter an epic name', 'error');
    document.getElementById('epicName').focus();
    return;
  }
  
  if (currentEditId) {
    updateEpic(currentEditId, name, color, startQuarter, duration, description);
  } else {
    addEpic(name, color, startQuarter, duration, description);
  }
  closeModal();
}

// ==================== TASKS MODAL ====================
function openTasksModal() {
  const modalBody = document.getElementById('tasksModalBody');
  
  if (epics.length === 0) {
    modalBody.innerHTML = `
      <div class="empty-timeline" style="padding: 40px;">
        <i class="fas fa-inbox"></i>
        <p>No epics created yet.</p>
      </div>
    `;
  } else {
    let tasksHtml = '<div class="tasks-list">';
    epics.forEach(epic => {
      const colorClass = getColorClass(epic.color);
      tasksHtml += `
        <div class="task-item">
          <div class="task-name">${escapeHtml(epic.name)}</div>
          <div class="task-epic">
            <i class="fas fa-calendar"></i>
            <span>${getQuarterName(epic.startQuarter)} - ${getQuarterName(Math.min(epic.startQuarter + epic.duration - 1, 3))}</span>
            <span style="margin-left: 8px;"><i class="fas fa-tag"></i> ${epic.color}</span>
          </div>
          ${epic.description ? `<div style="font-size: 12px; color: #8ba0bc; margin-top: 6px;">${escapeHtml(epic.description)}</div>` : ''}
        </div>
      `;
    });
    tasksHtml += '</div>';
    modalBody.innerHTML = tasksHtml;
  }
  
  document.getElementById('tasksModal').style.display = 'flex';
}

function closeTasksModal() {
  document.getElementById('tasksModal').style.display = 'none';
}

function showEpicDetails(epicId) {
  const epic = epics.find(e => e.id === epicId);
  if (!epic) return;
  
  const modalBody = document.getElementById('tasksModalBody');
  const colorClass = getColorClass(epic.color);
  const endQuarter = Math.min(epic.startQuarter + epic.duration - 1, 3);
  
  modalBody.innerHTML = `
    <div class="task-item" style="border-left-color: var(--${epic.color})">
      <div class="task-name" style="font-size: 18px; margin-bottom: 12px;">${escapeHtml(epic.name)}</div>
      <div class="task-epic" style="margin-bottom: 8px;">
        <i class="fas fa-calendar"></i>
        <span>${getQuarterName(epic.startQuarter)} - ${getQuarterName(endQuarter)}</span>
      </div>
      <div class="task-epic" style="margin-bottom: 12px;">
        <i class="fas fa-palette"></i>
        <span>${epic.color.charAt(0).toUpperCase() + epic.color.slice(1)}</span>
      </div>
      ${epic.description ? `<div style="font-size: 14px; color: #cbd5e1; padding-top: 12px; border-top: 1px solid #1e2a3e;">${escapeHtml(epic.description)}</div>` : '<div style="font-size: 13px; color: #6b7280; padding-top: 12px;">No description provided.</div>'}
    </div>
  `;
  
  document.getElementById('tasksModal').style.display = 'flex';
}

// ==================== TOAST NOTIFICATION ====================
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

// ==================== SLIDER HANDLER ====================
function initSlider() {
  const slider = document.getElementById('durationSlider');
  const valueSpan = document.getElementById('durationValue');
  
  if (slider && valueSpan) {
    slider.addEventListener('input', (e) => {
      const val = e.target.value;
      valueSpan.textContent = `${val} quarter${val != 1 ? 's' : ''}`;
    });
  }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
  loadEpics();
  renderTimeline();
  initSlider();
  
  // Button event listeners
  const addBtn = document.getElementById('addEpicBtn');
  const viewTasksBtn = document.getElementById('viewTasksBtn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const saveBtn = document.getElementById('saveEpicBtn');
  const closeTasksBtn = document.getElementById('closeTasksModalBtn');
  const closeTasksFooter = document.getElementById('closeTasksFooterBtn');
  
  if (addBtn) addBtn.addEventListener('click', openAddModal);
  if (viewTasksBtn) viewTasksBtn.addEventListener('click', openTasksModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);
  if (saveBtn) saveBtn.addEventListener('click', handleSaveEpic);
  if (closeTasksBtn) closeTasksBtn.addEventListener('click', closeTasksModal);
  if (closeTasksFooter) closeTasksFooter.addEventListener('click', closeTasksModal);
  
  // Close modals on outside click
  const epicModal = document.getElementById('epicModal');
  const tasksModal = document.getElementById('tasksModal');
  
  if (epicModal) {
    epicModal.addEventListener('click', (e) => {
      if (e.target === epicModal) closeModal();
    });
  }
  
  if (tasksModal) {
    tasksModal.addEventListener('click', (e) => {
      if (e.target === tasksModal) closeTasksModal();
    });
  }
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (epicModal.style.display === 'flex') closeModal();
      if (tasksModal.style.display === 'flex') closeTasksModal();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openAddModal();
    }
  });
});
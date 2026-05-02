// SHIAGARI - Roadmap (Frontend Only)

let epics = [];
let editId = null;

// Color mapping
const colorClasses = {
  pink: 'bar-pink', blue: 'bar-blue', red: 'bar-red',
  green: 'bar-green', purple: 'bar-purple', orange: 'bar-orange'
};

// Quarter names
const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];

// ========== DATA (Backend: replace with API) ==========

function loadEpics() {
  // TODO: Replace with fetch('/api/epics')
  const stored = localStorage.getItem('roadmap_epics');
  
  if (stored) {
    epics = JSON.parse(stored);
  } else {
    // Demo data
    epics = [
      { id: 1, name: 'UI/UX Design System', color: 'pink', startQuarter: 0, duration: 2, description: 'Complete design system with components' },
      { id: 2, name: 'Frontend Core', color: 'blue', startQuarter: 1, duration: 3, description: 'Build reusable components and state management' },
      { id: 3, name: 'API Gateway', color: 'red', startQuarter: 2, duration: 2, description: 'RESTful API development' },
      { id: 4, name: 'Database Optimization', color: 'purple', startQuarter: 0, duration: 4, description: 'Query optimization and migration' }
    ];
    saveEpics();
  }
  
  renderTimeline();
  updateCount();
}

function saveEpics() {
  // TODO: Replace with fetch('/api/epics', { method: 'POST' })
  localStorage.setItem('roadmap_epics', JSON.stringify(epics));
  updateCount();
}

function updateCount() {
  const countSpan = document.getElementById('timelineSpan');
  if (countSpan) countSpan.innerText = `${epics.length} epic${epics.length !== 1 ? 's' : ''}`;
}

// ========== RENDER TIMELINE ==========

function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;
  
  if (epics.length === 0) {
    container.innerHTML = '<div class="empty-timeline"><i class="fas fa-road"></i><p>No epics yet. Click "Add Epic" to start planning!</p></div>';
    return;
  }
  
  let html = '';
  
  epics.forEach(epic => {
    const startPercent = (epic.startQuarter / 4) * 100;
    const widthPercent = (epic.duration / 4) * 100;
    const colorClass = colorClasses[epic.color] || 'bar-blue';
    const endQuarter = Math.min(epic.startQuarter + epic.duration - 1, 3);
    const barLabel = `${epic.name} (${quarterNames[epic.startQuarter]}-${quarterNames[endQuarter]})`;
    
    html += `
      <div class="timeline-row" data-id="${epic.id}">
        <div class="epic-info">
          <div class="epic-name" title="${escapeHtml(epic.description || 'No description')}">${escapeHtml(epic.name)}</div>
          <div class="epic-actions">
            <button class="epic-edit" data-id="${epic.id}"><i class="fas fa-edit"></i></button>
            <button class="epic-delete" data-id="${epic.id}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
        <div class="bar-container">
          <div class="epic-bar ${colorClass}" style="left: ${startPercent}%; width: ${widthPercent}%;">
            ${escapeHtml(barLabel)}
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Attach event handlers
  document.querySelectorAll('.epic-edit').forEach(btn => {
    btn.onclick = () => openEditModal(parseInt(btn.dataset.id));
  });
  
  document.querySelectorAll('.epic-delete').forEach(btn => {
    btn.onclick = () => deleteEpic(parseInt(btn.dataset.id));
  });
  
  document.querySelectorAll('.epic-name, .epic-bar').forEach(el => {
    el.onclick = () => {
      const row = el.closest('.timeline-row');
      if (row) showEpicDetail(parseInt(row.dataset.id));
    };
  });
}

// ========== CRUD ==========

function addEpic(name, color, startQuarter, duration, description) {
  if (!name.trim()) {
    showToast('Epic name required', true);
    return false;
  }
  
  const newEpic = {
    id: Date.now(),
    name: name.trim(),
    color: color,
    startQuarter: parseInt(startQuarter),
    duration: parseInt(duration),
    description: description || ''
  };
  
  epics.push(newEpic);
  saveEpics();
  renderTimeline();
  showToast(`Epic "${name}" added`);
  return true;
}

function updateEpic(id, name, color, startQuarter, duration, description) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return false;
  
  epic.name = name.trim();
  epic.color = color;
  epic.startQuarter = parseInt(startQuarter);
  epic.duration = parseInt(duration);
  epic.description = description || '';
  
  saveEpics();
  renderTimeline();
  showToast(`Epic "${name}" updated`);
  return true;
}

function deleteEpic(id) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return;
  
  if (confirm(`Delete "${epic.name}"?`)) {
    epics = epics.filter(e => e.id !== id);
    saveEpics();
    renderTimeline();
    showToast('Epic deleted');
  }
}

// ========== MODALS ==========

function openAddModal() {
  editId = null;
  document.getElementById('modalTitle').innerText = 'Add Epic';
  document.getElementById('saveEpicBtn').innerText = 'Save';
  
  document.getElementById('epicName').value = '';
  document.getElementById('epicColor').value = 'blue';
  document.getElementById('durationSlider').value = '2';
  document.getElementById('durationValue').innerText = '2 quarters';
  document.getElementById('startQuarter').value = '1';
  document.getElementById('epicDesc').value = '';
  
  document.getElementById('epicModal').style.display = 'flex';
  document.getElementById('epicName').focus();
}

function openEditModal(id) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return;
  
  editId = id;
  document.getElementById('modalTitle').innerText = 'Edit Epic';
  document.getElementById('saveEpicBtn').innerText = 'Update';
  
  document.getElementById('epicName').value = epic.name;
  document.getElementById('epicColor').value = epic.color;
  document.getElementById('durationSlider').value = epic.duration;
  document.getElementById('durationValue').innerText = `${epic.duration} quarter${epic.duration !== 1 ? 's' : ''}`;
  document.getElementById('startQuarter').value = epic.startQuarter;
  document.getElementById('epicDesc').value = epic.description || '';
  
  document.getElementById('epicModal').style.display = 'flex';
  document.getElementById('epicName').focus();
}

function closeModal() {
  document.getElementById('epicModal').style.display = 'none';
  editId = null;
}

function saveEpic() {
  const name = document.getElementById('epicName').value;
  const color = document.getElementById('epicColor').value;
  const startQuarter = document.getElementById('startQuarter').value;
  const duration = document.getElementById('durationSlider').value;
  const description = document.getElementById('epicDesc').value;
  
  if (!name.trim()) {
    showToast('Epic name required', true);
    return;
  }
  
  if (editId) {
    updateEpic(editId, name, color, startQuarter, duration, description);
  } else {
    addEpic(name, color, startQuarter, duration, description);
  }
  
  closeModal();
}

// ========== VIEW ALL MODAL ==========

function showEpicDetail(id) {
  const epic = epics.find(e => e.id === id);
  if (!epic) return;
  
  const endQuarter = Math.min(epic.startQuarter + epic.duration - 1, 3);
  const body = document.getElementById('viewModalBody');
  
  body.innerHTML = `
    <div class="epic-item">
      <div class="epic-item-name">${escapeHtml(epic.name)}</div>
      <div class="epic-item-dates">${quarterNames[epic.startQuarter]} - ${quarterNames[endQuarter]} | ${epic.color}</div>
      <div class="epic-item-desc">${escapeHtml(epic.description || 'No description')}</div>
    </div>
  `;
  
  document.getElementById('viewModal').style.display = 'flex';
}

function openViewAllModal() {
  const body = document.getElementById('viewModalBody');
  
  if (epics.length === 0) {
    body.innerHTML = '<div class="empty-timeline">No epics yet.</div>';
  } else {
    body.innerHTML = epics.map(epic => {
      const endQuarter = Math.min(epic.startQuarter + epic.duration - 1, 3);
      return `
        <div class="epic-item">
          <div class="epic-item-name">${escapeHtml(epic.name)}</div>
          <div class="epic-item-dates">${quarterNames[epic.startQuarter]} - ${quarterNames[endQuarter]} | ${epic.color}</div>
          <div class="epic-item-desc">${escapeHtml(epic.description || 'No description')}</div>
        </div>
      `;
    }).join('');
  }
  
  document.getElementById('viewModal').style.display = 'flex';
}

function closeViewModal() {
  document.getElementById('viewModal').style.display = 'none';
}

// ========== SLIDER ==========

function initSlider() {
  const slider = document.getElementById('durationSlider');
  const valueSpan = document.getElementById('durationValue');
  
  slider.oninput = () => {
    const val = slider.value;
    valueSpan.innerText = `${val} quarter${val != 1 ? 's' : ''}`;
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
  loadEpics();
  initSlider();
  
  // Buttons
  document.getElementById('addEpicBtn').onclick = openAddModal;
  document.getElementById('viewAllBtn').onclick = openViewAllModal;
  document.getElementById('saveEpicBtn').onclick = saveEpic;
  document.getElementById('closeModalBtn').onclick = closeModal;
  document.getElementById('cancelModalBtn').onclick = closeModal;
  document.getElementById('closeViewModalBtn').onclick = closeViewModal;
  document.getElementById('closeViewFooterBtn').onclick = closeViewModal;
  
  // Close modals on outside click
  document.getElementById('epicModal').onclick = (e) => {
    if (e.target === document.getElementById('epicModal')) closeModal();
  };
  document.getElementById('viewModal').onclick = (e) => {
    if (e.target === document.getElementById('viewModal')) closeViewModal();
  };
});
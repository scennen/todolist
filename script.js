function updateDateTime() {
  const currentDate = document.getElementById('current-date');
  const currentTime = document.getElementById('current-time');

  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');

  currentDate.textContent = `${day}.${month}.${year}`;
  currentTime.textContent = `${hour}:${minute}`;
}

setInterval(updateDateTime, 60000);
updateDateTime();

document.addEventListener('DOMContentLoaded', () => {
  const folderHeaders = document.querySelectorAll('.folder-header');

  folderHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentFolder = header.parentElement;
      parentFolder.classList.toggle('open');
    });
  });
});


let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
let editId = null;

const tbody = document.getElementById('tasks-body');
const addBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const titleInput = document.getElementById('task-title');
const descriptionInput = document.getElementById('task-description');
const prioInput = document.getElementById('task-priority');
const dateInput = document.getElementById('task-date');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');

function render() {
  const q = searchInput.value.trim().toLowerCase();
  tbody.innerHTML = '';
  tasks
    .filter(t => t.title.toLowerCase().includes(q))
    .forEach(t => {
      const tr = document.createElement('tr');
      const tdCheckbox = document.createElement('td');
      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = t.done;
      cb.addEventListener('change', () => {
        t.done = cb.checked;
        if (cb.checked) {
          tr.classList.add('completed');
        } else {
          tr.classList.remove('completed');
        }
        tasks = tasks.sort((a, b) => a.done - b.done);
        save();
        render();
      });
      tdCheckbox.append(cb);

      const tdTitle = document.createElement('td');
      tdTitle.textContent = t.title;
      tdTitle.style.textDecoration = t.done ? 'line-through' : '';

      const tdPrio = document.createElement('td');
      const dot = document.createElement('span');
      dot.className = `priority-dot ${t.priority}`;
      tdPrio.append(dot);

      const tdDate = document.createElement('td');
      tdDate.textContent = t.dueDate;

      const tdAct = document.createElement('td');
      const edit = document.createElement('button');
      edit.innerHTML = `<img src="img/icon/edit.svg" alt="Edit">`;
      edit.className = 'action-btn';
      edit.addEventListener('click', () => openModal(t.id));

      const del = document.createElement('button');
      del.innerHTML = `<img src="img/icon/bin.svg" alt="Delete">`;
      del.className = 'action-btn';
      del.addEventListener('click', () => {
        tasks = tasks.filter(x => x.id !== t.id);
        save();
        render();
      });

      tdAct.append(edit, del);
      [tdCheckbox, tdTitle, tdPrio, tdDate, tdAct].forEach(x => tr.append(x));

      const tdDescription = document.createElement('td');
      tdDescription.style.display = t.showDescription ? 'table-cell' : 'none';
      tdDescription.colSpan = 5;
      tdDescription.innerHTML = `<div class="description-toggle">🔽</div><p>${t.description}</p>`;
      tr.append(tdDescription);

      tbody.append(tr);
      if (t.done) {
        tr.classList.add('completed'); 
      }
    });
}

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

addBtn.addEventListener('click', () => openModal());
cancelBtn.addEventListener('click', closeModal);

taskForm.addEventListener('submit', e => {
  e.preventDefault();
  const data = {
    id: editId || Date.now(),
    title: titleInput.value,
    description: descriptionInput.value,
    priority: prioInput.value,
    dueDate: dateInput.value,
    done: editId ? tasks.find(t => t.id === editId).done : false
  };

  if (editId) {
    tasks = tasks.map(t => t.id === editId ? data : t);
  } else {
    tasks.push(data);
  }

  save();
  render();
  closeModal();
});

function openModal(id = null) {
  editId = id;
  if (id) {
    const t = tasks.find(x => x.id === id);
    modalTitle.textContent = 'Редактировать задачу';
    titleInput.value = t.title;
    descriptionInput.value = t.description;
    prioInput.value = t.priority;
    dateInput.value = t.dueDate;
  } else {
    modalTitle.textContent = 'Добавить задачу';
    taskForm.reset();
  }
  taskModal.style.display = 'flex';
}

function closeModal() {
  taskModal.style.display = 'none';
}

searchInput.addEventListener('input', render);

let sortField = null, sortAsc = true;

function sortBy(field) {
  if (sortField === field) sortAsc = !sortAsc;
  else { sortField = field; sortAsc = true; }
  tasks.sort((a, b) => {
    if (a[field] < b[field]) return sortAsc ? -1 : 1;
    if (a[field] > b[field]) return sortAsc ? 1 : -1;
    return 0;
  });
  render();
}

document.querySelectorAll('.tasks-table th[data-sort]').forEach(th => {
  th.addEventListener('click', () => sortBy(th.dataset.sort));
});

render();

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const themeToggle = document.getElementById('themeToggle');
    const modal = document.getElementById('modal');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const taskContainers = document.querySelectorAll('.tasks-container');

    // --- STATE ---
    let draggedItem = null; let ghost = null;

    // --- THEME SWITCHER LOGIC ---
    const applyTheme = (theme) => {
        if (theme === 'cosmic') {
            document.body.classList.add('cosmic-mode');
            themeToggle.checked = true;
        } else {
            document.body.classList.remove('cosmic-mode');
            themeToggle.checked = false;
        }
    };
    const toggleTheme = () => {
        const currentTheme = document.body.classList.contains('cosmic-mode') ? 'light' : 'cosmic';
        localStorage.setItem('theme', currentTheme);
        applyTheme(currentTheme);
    };
    themeToggle.addEventListener('change', toggleTheme);

    // --- CORE & RENDER FUNCTIONS ---
    const renderBoard = () => { /* ... (código sem alterações) ... */ };
    const createTaskElement = (task) => { /* ... (código sem alterações) ... */ };
    const updateCountersAndEmptyStates = () => { /* ... (código sem alterações) ... */ };
    // --- EVENT HANDLERS ---
    const addDragListeners = (element) => { /* ... (código sem alterações) ... */ };
    const addEditListeners = (element) => { /* ... (código sem alterações) ... */ };
    taskContainers.forEach(container => { /* ... (código sem alterações) ... */ });
    const getDragAfterElement = (container, y) => { /* ... (código sem alterações) ... */ };
    // --- ACTIONS ---
    const addTask = () => { /* ... (código sem alterações) ... */ };
    const deleteTask = (taskId) => { /* ... (código sem alterações) ... */ };
    const updateTask = (taskId, newText) => { /* ... (código sem alterações) ... */ };
    // --- LOCAL STORAGE & STATE MANAGEMENT ---
    const saveState = (state = null) => { /* ... (código sem alterações) ... */ };
    const loadState = () => { /* ... (código sem alterações) ... */ };
    const saveAndRerender = (state) => { /* ... (código sem alterações) ... */ };
    // --- MODAL ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => { modal.classList.remove('show'); taskInput.value = ''; };

    // --- INITIALIZATION ---
    addTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => (e.target === modal) && closeModal());
    saveTaskBtn.addEventListener('click', addTask);
    
    // Initialize Theme (Default to light/foco if no preference)
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
    
    // Initialize Board
    renderBoard();

    // Funções que não precisam ser reescritas (apenas para o código ser completo)
    renderBoard = () => { const state = loadState(); Object.keys(state).forEach(columnId => { const container = document.querySelector(`[data-column-id="${columnId}"]`); [...container.children].forEach(child => { if (!child.classList.contains('empty-state')) container.removeChild(child); }); state[columnId].forEach(task => { const taskElement = createTaskElement(task); container.appendChild(taskElement); }); }); updateCountersAndEmptyStates(); };
    createTaskElement = (task) => { const element = document.createElement('div'); element.classList.add('task-card'); element.draggable = true; element.dataset.id = task.id; element.innerHTML = `<p>${task.text}</p>`; const deleteButton = document.createElement('button'); deleteButton.classList.add('delete-btn'); deleteButton.innerHTML = '&times;'; deleteButton.addEventListener('click', () => deleteTask(task.id)); element.appendChild(deleteButton); addDragListeners(element); addEditListeners(element); return element; };
    updateCountersAndEmptyStates = () => { document.querySelectorAll('.kanban-column').forEach(column => { const container = column.querySelector('.tasks-container'); const taskCount = container.querySelectorAll('.task-card').length; column.querySelector('.task-counter').textContent = taskCount; const emptyState = column.querySelector('.empty-state'); if(emptyState) emptyState.classList.toggle('show', taskCount === 0); }); };
    addDragListeners = (element) => { element.addEventListener('dragstart', e => { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); }); element.addEventListener('dragend', () => { if (draggedItem) draggedItem.classList.remove('dragging'); draggedItem = null; document.querySelectorAll('.ghost').forEach(g => g.remove()); ghost = null; saveState(); }); };
    addEditListeners = (element) => { element.addEventListener('dblclick', () => { if (element.querySelector('textarea')) return; const p = element.querySelector('p'); p.style.display = 'none'; const currentText = p.textContent; const editInput = document.createElement('textarea'); editInput.value = currentText; element.appendChild(editInput); editInput.focus(); editInput.style.height = 'auto'; editInput.style.height = editInput.scrollHeight + 'px'; const saveChanges = () => { const newText = editInput.value.trim(); p.textContent = newText || currentText; p.style.display = 'block'; if(element.contains(editInput)) element.removeChild(editInput); updateTask(element.dataset.id, newText); }; editInput.addEventListener('blur', saveChanges); editInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveChanges(); } else if (e.key === 'Escape') { p.style.display = 'block'; if(element.contains(editInput)) element.removeChild(editInput); } }); }); };
    taskContainers.forEach(container => { container.addEventListener('dragover', e => { e.preventDefault(); const afterElement = getDragAfterElement(container, e.clientY); if (!ghost) { ghost = document.createElement('div'); ghost.classList.add('ghost'); } if (afterElement == null) container.appendChild(ghost); else container.insertBefore(ghost, afterElement); }); container.addEventListener('drop', e => { e.preventDefault(); if (draggedItem) e.currentTarget.insertBefore(draggedItem, ghost); }); });
    getDragAfterElement = (container, y) => { const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')]; return draggableElements.reduce((closest, child) => { const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2; if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }; else return closest; }, { offset: Number.NEGATIVE_INFINITY }).element; };
    addTask = () => { const text = taskInput.value.trim(); if (!text) return; let state = loadState(); const newTask = { id: `task-${Date.now()}`, text: text }; state.todo.unshift(newTask); saveAndRerender(state); closeModal(); };
    deleteTask = (taskId) => { let state = loadState(); for (const columnId in state) state[columnId] = state[columnId].filter(task => task.id !== taskId); saveAndRerender(state); };
    updateTask = (taskId, newText) => { let state = loadState(); for (const columnId in state) { const task = state[columnId].find(task => task.id === taskId); if (task) { task.text = newText; break; } } saveState(state); };
    saveState = (state = null) => { if (!state) { state = { todo: [], doing: [], done: [] }; taskContainers.forEach(container => { const columnId = container.dataset.columnId; container.querySelectorAll('.task-card').forEach(card => { state[columnId].push({ id: card.dataset.id, text: card.querySelector('p').textContent }); }); }); } localStorage.setItem('kanbanState', JSON.stringify(state)); };
    loadState = () => { const savedState = localStorage.getItem('kanbanState'); const defaultState = { todo: [ { id: `task-1`, text: "Analisar as novas tendências de design para o projeto." } ], doing: [ { id: `task-4`, text: "Implementar o novo layout com tipografia expressiva e fundo animado." } ], done: [ { id: `task-5`, text: "Revisar o artigo de inspiração e definir a direção de arte." } ] }; const state = savedState ? JSON.parse(savedState) : defaultState; if (!savedState) saveState(state); return state; };
    saveAndRerender = (state) => { saveState(state); renderBoard(); };
});

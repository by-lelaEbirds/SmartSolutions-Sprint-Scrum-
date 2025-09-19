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
    let draggedItem = null, ghost = null;

    // --- THEME SWITCHER LOGIC ---
    const applyTheme = (theme) => {
        document.body.classList.toggle('cosmic-mode', theme === 'cosmic');
    };
    const toggleTheme = () => {
        const newTheme = document.body.classList.contains('cosmic-mode') ? 'light' : 'cosmic';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };
    themeToggle.addEventListener('click', toggleTheme);

    // --- CORE & RENDER FUNCTIONS ---
    const renderBoard = () => {
        const state = loadState();
        Object.keys(state).forEach(columnId => {
            const container = document.querySelector(`[data-column-id="${columnId}"]`);
            if (!container) return;
            [...container.children].forEach(child => { if (!child.classList.contains('empty-state')) container.removeChild(child); });
            state[columnId].forEach((task, index) => {
                const taskElement = createTaskElement(task);
                taskElement.style.setProperty('--delay', `${index * 70}ms`);
                container.appendChild(taskElement);
            });
        });
        updateCountersAndEmptyStates();
    };

    const createTaskElement = (task) => {
        const element = document.createElement('div');
        element.classList.add('task-card');
        element.draggable = true;
        element.dataset.id = task.id;
        
        const p = document.createElement('p');
        p.textContent = task.text;
        element.appendChild(p);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.innerHTML = '&times;';
        element.appendChild(deleteBtn);

        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        addDragListeners(element);
        addEditListeners(element);
        return element;
    };

    const updateCountersAndEmptyStates = () => { document.querySelectorAll('.kanban-column').forEach(column => { const container = column.querySelector('.tasks-container'); const taskCount = container.querySelectorAll('.task-card').length; column.querySelector('.task-counter').textContent = taskCount; const emptyState = column.querySelector('.empty-state'); if(emptyState) emptyState.classList.toggle('show', taskCount === 0); }); };

    // --- EVENT HANDLERS ---
    const addDragListeners = (element) => {
        element.addEventListener('dragstart', e => { draggedItem = e.target; setTimeout(() => e.target.classList.add('dragging'), 0); });
        element.addEventListener('dragend', () => {
            if (draggedItem) draggedItem.classList.remove('dragging');
            draggedItem = null;
            document.querySelectorAll('.ghost').forEach(g => g.remove());
            ghost = null;
            updateCountersAndEmptyStates(); 
            saveState();
        });
    };
    const addEditListeners = (element) => { element.addEventListener('dblclick', () => { if (element.querySelector('textarea')) return; const p = element.querySelector('p'); p.style.display = 'none'; const currentText = p.textContent; const editInput = document.createElement('textarea'); editInput.value = currentText; element.appendChild(editInput); editInput.focus(); editInput.style.height = 'auto'; editInput.style.height = editInput.scrollHeight + 'px'; const saveChanges = () => { const newText = editInput.value.trim(); p.textContent = newText || currentText; p.style.display = 'block'; if(element.contains(editInput)) element.removeChild(editInput); updateTask(element.dataset.id, newText); }; editInput.addEventListener('blur', saveChanges); editInput.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveChanges(); } else if (e.key === 'Escape') { p.style.display = 'block'; if(element.contains(editInput)) element.removeChild(editInput); } }); }); };
    taskContainers.forEach(container => { container.addEventListener('dragover', e => { e.preventDefault(); const afterElement = getDragAfterElement(container, e.clientY); if (!ghost) { ghost = document.createElement('div'); ghost.classList.add('ghost'); } if (afterElement == null) container.appendChild(ghost); else container.insertBefore(ghost, afterElement); }); container.addEventListener('drop', e => { e.preventDefault(); if (draggedItem) e.currentTarget.insertBefore(draggedItem, ghost); }); });
    const getDragAfterElement = (container, y) => { const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')]; return draggableElements.reduce((closest, child) => { const box = child.getBoundingClientRect(); const offset = y - box.top - box.height / 2; if (offset < 0 && offset > closest.offset) return { offset: offset, element: child }; else return closest; }, { offset: Number.NEGATIVE_INFINITY }).element; };

    // --- ACTIONS ---
    const addTask = () => { const text = taskInput.value.trim(); if (!text) return; let state = loadState(); const newTask = { id: `task-${Date.now()}`, text: text }; state.todo.unshift(newTask); saveAndRerender(state); closeModal(); };
    const deleteTask = (taskId) => { let state = loadState(); for (const columnId in state) state[columnId] = state[columnId].filter(task => task.id !== taskId); saveAndRerender(state); };
    const updateTask = (taskId, newText) => { let state = loadState(); for (const columnId in state) { const task = state[columnId].find(task => task.id === taskId); if (task) { task.text = newText; break; } } saveState(state); };

    // --- LOCAL STORAGE & STATE MANAGEMENT ---
    const saveState = (state = null) => { if (!state) { state = { todo: [], doing: [], done: [] }; taskContainers.forEach(container => { const columnId = container.dataset.columnId; if (!state[columnId]) state[columnId] = []; container.querySelectorAll('.task-card').forEach(card => { state[columnId].push({ id: card.dataset.id, text: card.querySelector('p').textContent }); }); }); } localStorage.setItem('kanbanStateConecta', JSON.stringify(state)); };
    const loadState = () => {
        const savedState = localStorage.getItem('kanbanStateConecta');
        // --- TAREFAS DO PROJETO CONECTA+ ---
        const defaultState = {
            todo: [
                { id: `task-conecta-1`, text: "Implementar badges de conquistas no perfil do prestador" },
                { id: `task-conecta-2`, text: "Criar dashboard do prestador para ver novos pedidos" },
                { id: `task-conecta-3`, text: "Ajustar responsividade da plataforma para tablets" },
                { id: `task-conecta-4`, text: "Testar fluxo de avaliação em múltiplos navegadores (QA)" },
                { id: `task-conecta-5`, text: "[V2.0] Desenvolver algoritmo de 'match' inteligente" },
                { id: `task-conecta-6`, text: "[BACKLOG] Integração com Login Social (Google)" }
            ],
            doing: [
                { id: `task-conecta-7`, text: "Finalizar fluxo de 'Novo Pedido' com upload de imagens" },
                { id: `task-conecta-8`, text: "Desenvolver sistema de avaliação com nota e comentário" },
                { id: `task-conecta-9`, text: "Implementar tema claro/escuro (Dark Mode)" }
            ],
            done: [
                { id: `task-conecta-10`, text: "Criar sistema de Login e Autenticação (front-end)" },
                { id: `task-conecta-11`, text: "Desenvolver página de perfil do prestador (estática)" },
                { id: `task-conecta-12`, text: "Criar dashboard do cliente para visualização de pedidos" },
                { id: `task-conecta-13`, text: "Desenvolver página 'Encontrar Prestadores'" },
                { id: `task-conecta-14`, text: "Estruturar o projeto (HTML base, CSS, JS)" }
            ]
        };
        const state = savedState ? JSON.parse(savedState) : defaultState;
        if (!savedState) saveState(state);
        return state; 
    };
    const saveAndRerender = (state) => { saveState(state); renderBoard(); };

    // --- MODAL ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => { modal.classList.remove('show'); taskInput.value = ''; };

    // --- INITIALIZATION ---
    addTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => (e.target === modal) && closeModal());
    saveTaskBtn.addEventListener('click', addTask);
    
    const savedTheme = localStorage.getItem('theme') || 'cosmic';
    applyTheme(savedTheme);
    
    renderBoard();
});

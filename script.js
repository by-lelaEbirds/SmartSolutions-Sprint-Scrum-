document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const modal = document.getElementById('modal');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const taskContainers = document.querySelectorAll('.tasks-container');

    // --- STATE ---
    let draggedItem = null;
    let ghost = null;

    // --- CORE FUNCTIONS ---

    const renderBoard = () => {
        const state = loadState();
        Object.keys(state).forEach(columnId => {
            const container = document.querySelector(`[data-column-id="${columnId}"]`);
            container.innerHTML = ''; // Clear column before rendering
            state[columnId].forEach((task, index) => {
                const taskElement = createTaskElement(task);
                taskElement.style.setProperty('--delay', `${index * 50}ms`);
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
        element.innerHTML = `<p>${task.text}</p>`;

        // Add delete button
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-btn');
        deleteButton.innerHTML = '&times;';
        deleteButton.addEventListener('click', () => deleteTask(task.id));
        element.appendChild(deleteButton);

        // Add event listeners
        addDragListeners(element);
        addEditListeners(element);

        return element;
    };

    const updateCountersAndEmptyStates = () => {
        document.querySelectorAll('.kanban-column').forEach(column => {
            const container = column.querySelector('.tasks-container');
            const taskCount = container.querySelectorAll('.task-card').length;
            column.querySelector('.task-counter').textContent = taskCount;
            const emptyState = container.querySelector('.empty-state');
            if(emptyState) {
                emptyState.classList.toggle('show', taskCount === 0);
            }
        });
    };

    // --- EVENT HANDLERS ---

    const addDragListeners = (element) => {
        element.addEventListener('dragstart', e => {
            draggedItem = e.target;
            setTimeout(() => e.target.classList.add('dragging'), 0);
        });
        element.addEventListener('dragend', () => {
            draggedItem.classList.remove('dragging');
            draggedItem = null;
            document.querySelectorAll('.ghost').forEach(g => g.remove());
            saveState();
        });
    };

    const addEditListeners = (element) => {
        element.addEventListener('dblclick', () => {
            element.querySelector('p').style.display = 'none';
            const currentText = element.querySelector('p').textContent;
            
            const editInput = document.createElement('textarea');
            editInput.value = currentText;
            element.appendChild(editInput);
            editInput.focus();

            const saveChanges = () => {
                const newText = editInput.value.trim();
                element.querySelector('p').textContent = newText;
                element.querySelector('p').style.display = 'block';
                element.removeChild(editInput);
                updateTask(element.dataset.id, newText);
            };

            editInput.addEventListener('blur', saveChanges);
            editInput.addEventListener('keydown', e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    saveChanges();
                }
            });
        });
    };

    taskContainers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault();
            const afterElement = getDragAfterElement(container, e.clientY);
            if (!ghost) {
                ghost = document.createElement('div');
                ghost.classList.add('ghost');
            }
            if (afterElement == null) {
                container.appendChild(ghost);
            } else {
                container.insertBefore(ghost, afterElement);
            }
        });
        container.addEventListener('drop', e => {
            e.preventDefault();
            if (draggedItem) {
                const dropzone = e.target.closest('.tasks-container');
                dropzone.insertBefore(draggedItem, ghost);
            }
        });
    });

    const getDragAfterElement = (container, y) => {
        const draggableElements = [...container.querySelectorAll('.task-card:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    };

    // --- ACTIONS ---

    const addTask = () => {
        const text = taskInput.value.trim();
        if (!text) return;
        
        const state = loadState();
        const newTask = { id: `task-${Date.now()}`, text: text };
        state.todo.push(newTask);

        saveAndRerender(state);
        closeModal();
    };

    const deleteTask = (taskId) => {
        let state = loadState();
        for (const columnId in state) {
            state[columnId] = state[columnId].filter(task => task.id !== taskId);
        }
        saveAndRerender(state);
    };

    const updateTask = (taskId, newText) => {
        let state = loadState();
        for (const columnId in state) {
            const task = state[columnId].find(task => task.id === taskId);
            if (task) {
                task.text = newText;
                break;
            }
        }
        saveAndRerender(state);
    };

    // --- LOCAL STORAGE & STATE MANAGEMENT ---

    const saveState = () => {
        const state = { todo: [], doing: [], done: [] };
        taskContainers.forEach(container => {
            const columnId = container.dataset.columnId;
            container.querySelectorAll('.task-card').forEach(card => {
                state[columnId].push({
                    id: card.dataset.id,
                    text: card.querySelector('p').textContent
                });
            });
        });
        localStorage.setItem('kanbanState', JSON.stringify(state));
    };

    const loadState = () => {
        const savedState = localStorage.getItem('kanbanState');
        const defaultState = { todo: [], doing: [], done: [] };
        return savedState ? JSON.parse(savedState) : defaultState;
    };
    
    const saveAndRerender = (state) => {
        localStorage.setItem('kanbanState', JSON.stringify(state));
        renderBoard();
    }

    // --- MODAL ---
    const openModal = () => modal.classList.add('show');
    const closeModal = () => {
        modal.classList.remove('show');
        taskInput.value = '';
    };

    // --- INITIALIZATION ---
    addTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => (e.target === modal) && closeModal());
    saveTaskBtn.addEventListener('click', addTask);
    
    renderBoard();
});

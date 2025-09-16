document.addEventListener('DOMContentLoaded', () => {
    const taskCards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.kanban-column');
    const modal = document.getElementById('modal');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const closeModalBtn = document.querySelector('.close-modal');
    const saveTaskBtn = document.getElementById('saveTaskBtn');
    const taskInput = document.getElementById('taskInput');
    const todoContainer = document.querySelector('#todo .tasks-container');

    let draggedItem = null;

    // Função para adicionar listeners de drag & drop a um card
    const addDragListeners = (element) => {
        element.addEventListener('dragstart', (e) => {
            draggedItem = e.target;
            setTimeout(() => {
                e.target.classList.add('dragging');
            }, 0);
        });

        element.addEventListener('dragend', (e) => {
            setTimeout(() => {
                e.target.classList.remove('dragging');
                draggedItem = null;
            }, 0);
        });
    };

    // Adiciona listeners aos cards iniciais
    taskCards.forEach(addDragListeners);

    // Adiciona listeners às colunas
    columns.forEach(column => {
        column.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        column.addEventListener('drop', (e) => {
            e.preventDefault();
            const tasksContainer = e.target.closest('.kanban-column').querySelector('.tasks-container');
            if (draggedItem && tasksContainer) {
                tasksContainer.appendChild(draggedItem);
            }
        });
    });

    // Funções do Modal
    const openModal = () => modal.classList.add('show');
    const closeModal = () => {
        modal.classList.remove('show');
        taskInput.value = ''; // Limpa o input ao fechar
    };

    addTaskBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    saveTaskBtn.addEventListener('click', () => {
        const taskText = taskInput.value.trim();
        if (taskText) {
            const newTask = document.createElement('div');
            newTask.classList.add('task-card');
            newTask.draggable = true;
            newTask.id = `task-${Date.now()}`;
            newTask.innerHTML = `
                <p>${taskText}</p>
                <button class="delete-btn" onclick="deleteTask(this.parentElement)">×</button>
            `;
            
            todoContainer.appendChild(newTask);
            addDragListeners(newTask); // Adiciona listeners ao novo card
            closeModal();
        }
    });
});

// Função para deletar tarefa (declarada globalmente para ser acessível pelo onclick)
function deleteTask(taskElement) {
    taskElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    taskElement.style.opacity = '0';
    taskElement.style.transform = 'scale(0.8)';
    setTimeout(() => {
        taskElement.remove();
    }, 300);
}

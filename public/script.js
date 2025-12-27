// API base URL
const API_URL = '/api/todos';

// DOM elements
const taskInput = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const messageDiv = document.getElementById('message');

// Show message
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    setTimeout(() => {
        messageDiv.className = 'message';
    }, 3000);
}

// Fetch all todos from the server
async function fetchTodos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch todos');
        const todos = await response.json();
        displayTodos(todos);
    } catch (error) {
        console.error('Error fetching todos:', error);
        showMessage('Failed to load todos', 'error');
    }
}

// Display todos in the list
function displayTodos(todos) {
    todoList.innerHTML = '';

    if (todos.length === 0) {
        todoList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
        return;
    }

    todos.forEach(todo => {
        const li = document.createElement('li');
        const isDone = todo.status === 'done';
        li.className = `todo-item ${isDone ? 'completed' : ''} priority-${todo.priority}`;
        li.dataset.id = todo.id;

        li.innerHTML = `
            <input
                type="checkbox"
                class="todo-checkbox"
                ${isDone ? 'checked' : ''}
                onchange="toggleTodo(${todo.id}, this.checked)"
            >
            <div class="todo-content">
                <span class="todo-text">${escapeHtml(todo.task)}</span>
                <div class="todo-meta">
                    <span class="priority-badge priority-${todo.priority}">${todo.priority}</span>
                    <span class="status-badge status-${todo.status}">${todo.status}</span>
                </div>
            </div>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id}, '${escapeHtml(todo.task)}', '${todo.priority}')">Edit</button>
                <button class="delete-btn" onclick="deleteTodo(${todo.id})">Delete</button>
            </div>
        `;

        todoList.appendChild(li);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add a new todo
async function addTodo() {
    const task = taskInput.value.trim();
    const priority = prioritySelect.value;

    if (!task) {
        showMessage('Please enter a task', 'error');
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task, priority }),
        });

        if (!response.ok) throw new Error('Failed to add todo');

        const newTodo = await response.json();
        taskInput.value = '';
        prioritySelect.value = 'medium';
        showMessage('Task added successfully!', 'success');
        fetchTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage('Failed to add task', 'error');
    }
}

// Toggle todo completion status
async function toggleTodo(id, isChecked) {
    try {
        const status = isChecked ? 'done' : 'pending';
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status }),
        });

        if (!response.ok) throw new Error('Failed to update todo');

        fetchTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        showMessage('Failed to update task', 'error');
        fetchTodos(); // Refresh to show correct state
    }
}

// Edit a todo
function editTodo(id, currentTask, currentPriority) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    const todoContent = todoItem.querySelector('.todo-content');
    const todoActions = todoItem.querySelector('.todo-actions');

    const editContainer = document.createElement('div');
    editContainer.className = 'edit-container';

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentTask;

    const prioritySelect = document.createElement('select');
    prioritySelect.className = 'edit-priority-select';
    prioritySelect.innerHTML = `
        <option value="low" ${currentPriority === 'low' ? 'selected' : ''}>Low</option>
        <option value="medium" ${currentPriority === 'medium' ? 'selected' : ''}>Medium</option>
        <option value="high" ${currentPriority === 'high' ? 'selected' : ''}>High</option>
        <option value="urgent" ${currentPriority === 'urgent' ? 'selected' : ''}>Urgent</option>
    `;

    editContainer.appendChild(input);
    editContainer.appendChild(prioritySelect);

    const saveBtn = document.createElement('button');
    saveBtn.className = 'edit-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => saveTodo(id, input.value, prioritySelect.value);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'delete-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => fetchTodos();

    todoContent.replaceWith(editContainer);
    todoActions.innerHTML = '';
    todoActions.appendChild(saveBtn);
    todoActions.appendChild(cancelBtn);

    input.focus();
}

// Save edited todo
async function saveTodo(id, newTask, newPriority) {
    if (!newTask.trim()) {
        showMessage('Task cannot be empty', 'error');
        fetchTodos();
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task: newTask.trim(), priority: newPriority }),
        });

        if (!response.ok) throw new Error('Failed to update todo');

        showMessage('Task updated successfully!', 'success');
        fetchTodos();
    } catch (error) {
        console.error('Error updating todo:', error);
        showMessage('Failed to update task', 'error');
        fetchTodos();
    }
}

// Delete a todo
async function deleteTodo(id) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
        });
        
        if (!response.ok) throw new Error('Failed to delete todo');
        
        showMessage('Task deleted successfully!', 'success');
        fetchTodos();
    } catch (error) {
        console.error('Error deleting todo:', error);
        showMessage('Failed to delete task', 'error');
    }
}

// Event listeners
addBtn.addEventListener('click', addTodo);

taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTodo();
    }
});

// Load todos when page loads
fetchTodos();


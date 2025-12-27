// API base URL
const API_URL = '/api/todos';

// DOM elements
const taskInput = document.getElementById('taskInput');
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
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;
        
        li.innerHTML = `
            <input 
                type="checkbox" 
                class="todo-checkbox" 
                ${todo.completed ? 'checked' : ''}
                onchange="toggleTodo(${todo.id}, this.checked)"
            >
            <span class="todo-text">${escapeHtml(todo.task)}</span>
            <div class="todo-actions">
                <button class="edit-btn" onclick="editTodo(${todo.id}, '${escapeHtml(todo.task)}')">Edit</button>
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
            body: JSON.stringify({ task }),
        });
        
        if (!response.ok) throw new Error('Failed to add todo');
        
        const newTodo = await response.json();
        taskInput.value = '';
        showMessage('Task added successfully!', 'success');
        fetchTodos();
    } catch (error) {
        console.error('Error adding todo:', error);
        showMessage('Failed to add task', 'error');
    }
}

// Toggle todo completion status
async function toggleTodo(id, completed) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed }),
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
function editTodo(id, currentTask) {
    const todoItem = document.querySelector(`.todo-item[data-id="${id}"]`);
    const todoText = todoItem.querySelector('.todo-text');
    const todoActions = todoItem.querySelector('.todo-actions');
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'edit-input';
    input.value = currentTask;
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'edit-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => saveTodo(id, input.value);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'delete-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => fetchTodos();
    
    todoText.replaceWith(input);
    todoActions.innerHTML = '';
    todoActions.appendChild(saveBtn);
    todoActions.appendChild(cancelBtn);
    
    input.focus();
}

// Save edited todo
async function saveTodo(id, newTask) {
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
            body: JSON.stringify({ task: newTask.trim() }),
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


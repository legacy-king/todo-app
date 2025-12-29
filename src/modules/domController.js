import { format, isPast, isToday } from 'date-fns';

// Enhanced DOM Controller with all features
const domController = (() => {
  // Cache DOM elements
  let projectListElement;
  let todoListElement;
  let todoDetailsModal;
  let newTodoModal;
  let editTodoModal;
  let draggedElement = null;
  let draggedTodoId = null;

  const init = () => {
    projectListElement = document.getElementById('project-list');
    todoListElement = document.getElementById('todo-list');
    todoDetailsModal = document.getElementById('todo-details-modal');
    newTodoModal = document.getElementById('new-todo-modal');
    editTodoModal = document.getElementById('edit-todo-modal');
  };

  // Render all projects in sidebar
  const renderProjects = (projects, activeIndex, onProjectClick, onDeleteProject) => {
    if (!projectListElement) return;
    
    projectListElement.innerHTML = '';
    
    projects.forEach((project, index) => {
      const projectDiv = document.createElement('div');
      projectDiv.classList.add('project-item');
      
      if (index === activeIndex) {
        projectDiv.classList.add('active');
      }
      
      const projectName = document.createElement('span');
      projectName.textContent = project.name;
      projectName.classList.add('project-name');
      
      projectDiv.appendChild(projectName);
      
      // Add delete button (except for first project)
      if (projects.length > 1) {
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('project-delete-btn');
        deleteBtn.innerHTML = '×';
        deleteBtn.title = 'Delete project';
        deleteBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (confirm(`Delete project "${project.name}"?`)) {
            onDeleteProject(index);
          }
        });
        projectDiv.appendChild(deleteBtn);
      }
      
      projectDiv.addEventListener('click', () => {
        onProjectClick(index);
      });
      
      projectListElement.appendChild(projectDiv);
    });
  };

  // Render all todos for active project
  const renderTodos = (todos, onTodoClick, onDeleteClick, onToggleComplete, onReorder) => {
    if (!todoListElement) return;
    
    todoListElement.innerHTML = '';
    
    if (todos.length === 0) {
      todoListElement.innerHTML = '<p class="empty-message">No todos yet. Create one!</p>';
      return;
    }
    
    todos.forEach((todo, index) => {
      const todoCard = document.createElement('div');
      todoCard.classList.add('todo-card', `priority-${todo.priority}`);
      todoCard.setAttribute('draggable', 'true');
      todoCard.dataset.todoId = todo.id;
      todoCard.dataset.index = index;
      
      if (todo.isComplete) {
        todoCard.classList.add('completed');
      }
      
      if (todo.isOverdue()) {
        todoCard.classList.add('overdue');
      }
      
      // Drag and drop events
      todoCard.addEventListener('dragstart', (e) => {
        draggedElement = todoCard;
        draggedTodoId = todo.id;
        todoCard.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });
      
      todoCard.addEventListener('dragend', () => {
        todoCard.classList.remove('dragging');
        draggedElement = null;
        draggedTodoId = null;
      });
      
      todoCard.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        if (draggedElement && draggedElement !== todoCard) {
          const rect = todoCard.getBoundingClientRect();
          const midpoint = rect.top + rect.height / 2;
          
          if (e.clientY < midpoint) {
            todoCard.parentNode.insertBefore(draggedElement, todoCard);
          } else {
            todoCard.parentNode.insertBefore(draggedElement, todoCard.nextSibling);
          }
        }
      });
      
      todoCard.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedTodoId && onReorder) {
          const allCards = Array.from(todoListElement.querySelectorAll('.todo-card'));
          const newIndex = allCards.indexOf(draggedElement);
          const oldIndex = parseInt(draggedElement.dataset.index);
          
          if (newIndex !== oldIndex && newIndex !== -1) {
            onReorder(oldIndex, newIndex);
          }
        }
      });
      
      // Checkbox for completion
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = todo.isComplete;
      checkbox.classList.add('todo-checkbox');
      checkbox.addEventListener('click', (e) => {
        e.stopPropagation();
        onToggleComplete(todo.id);
      });
      
      // Todo info container
      const todoInfo = document.createElement('div');
      todoInfo.classList.add('todo-info');
      
      const title = document.createElement('h3');
      title.textContent = todo.title;
      
      const metaInfo = document.createElement('div');
      metaInfo.classList.add('todo-meta');
      
      const dueDate = document.createElement('span');
      dueDate.classList.add('due-date');
      const dueDateObj = new Date(todo.dueDate);
      
      if (isToday(dueDateObj)) {
        dueDate.textContent = '📅 Today';
        dueDate.classList.add('due-today');
      } else if (todo.isOverdue()) {
        dueDate.textContent = `⚠️ ${format(dueDateObj, 'MMM dd, yyyy')}`;
      } else {
        dueDate.textContent = `📅 ${format(dueDateObj, 'MMM dd, yyyy')}`;
      }
      
      metaInfo.appendChild(dueDate);
      
      // Tags
      if (todo.tags && todo.tags.length > 0) {
        const tagsContainer = document.createElement('div');
        tagsContainer.classList.add('tags-container');
        
        todo.tags.forEach(tag => {
          const tagSpan = document.createElement('span');
          tagSpan.classList.add('tag');
          tagSpan.textContent = tag;
          tagsContainer.appendChild(tagSpan);
        });
        
        metaInfo.appendChild(tagsContainer);
      }
      
      todoInfo.appendChild(title);
      todoInfo.appendChild(metaInfo);
      
      // Action buttons container
      const actionsContainer = document.createElement('div');
      actionsContainer.classList.add('todo-actions');
      
      // Edit button
      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-btn');
      editBtn.innerHTML = '✏️';
      editBtn.title = 'Edit';
      editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        onTodoClick(todo.id);
      });
      
      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('delete-btn');
      deleteBtn.innerHTML = '🗑️';
      deleteBtn.title = 'Delete';
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Delete this todo?')) {
          onDeleteClick(todo.id);
        }
      });
      
      actionsContainer.appendChild(editBtn);
      actionsContainer.appendChild(deleteBtn);
      
      // Assemble card
      todoCard.appendChild(checkbox);
      todoCard.appendChild(todoInfo);
      todoCard.appendChild(actionsContainer);
      
      todoListElement.appendChild(todoCard);
    });
  };

  // Show new todo form
  const showNewTodoForm = () => {
    if (newTodoModal) {
      newTodoModal.classList.add('active');
      // Set today as default date
      const todayInput = document.getElementById('todo-due-date');
      if (todayInput) {
        todayInput.valueAsDate = new Date();
      }
    }
  };

  const hideNewTodoForm = () => {
    if (newTodoModal) {
      newTodoModal.classList.remove('active');
      // Clear form fields manually
      const inputs = newTodoModal.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        if (input.type === 'checkbox') {
          input.checked = false;
        } else if (input.tagName === 'SELECT') {
          input.selectedIndex = 0;
        } else {
          input.value = '';
        }
      });
    }
  };

  // Get form data from new todo form
  const getNewTodoFormData = () => {
    const tagsInput = document.getElementById('todo-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    return {
      title: document.getElementById('todo-title').value.trim(),
      description: document.getElementById('todo-description').value.trim(),
      dueDate: document.getElementById('todo-due-date').value,
      priority: document.getElementById('todo-priority').value,
      notes: document.getElementById('todo-notes').value.trim(),
      tags: tags
    };
  };

  // Show edit todo form
  const showEditTodoForm = (todo) => {
    if (!editTodoModal) return;
    
    document.getElementById('edit-todo-id').value = todo.id;
    document.getElementById('edit-todo-title').value = todo.title;
    document.getElementById('edit-todo-description').value = todo.description;
    document.getElementById('edit-todo-due-date').value = todo.dueDate;
    document.getElementById('edit-todo-priority').value = todo.priority;
    document.getElementById('edit-todo-notes').value = todo.notes || '';
    document.getElementById('edit-todo-tags').value = todo.tags.join(', ');
    
    editTodoModal.classList.add('active');
  };

  const hideEditTodoForm = () => {
    if (editTodoModal) {
      editTodoModal.classList.remove('active');
    }
  };

  const getEditTodoFormData = () => {
    const tagsInput = document.getElementById('edit-todo-tags').value;
    const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    return {
      id: document.getElementById('edit-todo-id').value,
      title: document.getElementById('edit-todo-title').value.trim(),
      description: document.getElementById('edit-todo-description').value.trim(),
      dueDate: document.getElementById('edit-todo-due-date').value,
      priority: document.getElementById('edit-todo-priority').value,
      notes: document.getElementById('edit-todo-notes').value.trim(),
      tags: tags
    };
  };

  // Show new project prompt
  const showNewProjectForm = () => {
    const projectName = prompt('Enter project name:');
    return projectName ? projectName.trim() : null;
  };

  // Search and filters
  const getSearchQuery = () => {
    const searchInput = document.getElementById('search-input');
    return searchInput ? searchInput.value : '';
  };

  const getFilterPriority = () => {
    const filterSelect = document.getElementById('filter-priority');
    return filterSelect ? filterSelect.value : 'all';
  };

  const updateFilterDisplay = (searchQuery, filterPriority, activeTags) => {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('filter-priority');
    
    if (searchInput) searchInput.value = searchQuery;
    if (filterSelect) filterSelect.value = filterPriority;
  };

  // Render available tags for filtering
  const renderTagFilters = (allTags, selectedTags, onTagClick) => {
    const tagFiltersContainer = document.getElementById('tag-filters');
    if (!tagFiltersContainer || !allTags) return;
    
    tagFiltersContainer.innerHTML = '';
    
    if (allTags.length === 0) {
      tagFiltersContainer.innerHTML = '<p class="no-tags">No tags yet</p>';
      return;
    }
    
    allTags.forEach(tag => {
      const tagBtn = document.createElement('button');
      tagBtn.classList.add('tag-filter-btn');
      tagBtn.textContent = tag;
      
      if (selectedTags.includes(tag)) {
        tagBtn.classList.add('active');
      }
      
      tagBtn.addEventListener('click', () => {
        onTagClick(tag);
      });
      
      tagFiltersContainer.appendChild(tagBtn);
    });
  };

  // Theme toggle
  const initThemeToggle = (currentTheme, onToggle) => {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Set initial icon
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
      const newTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
      document.body.classList.toggle('dark-mode');
      updateThemeIcon(newTheme);
      onToggle(newTheme);
    });
  };

  const updateThemeIcon = (theme) => {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeToggle.title = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  };

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    updateThemeIcon(theme);
  };

  // Export/Import
  const triggerExport = (jsonData) => {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todos-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const triggerImport = (onImport) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          onImport(event.target.result);
        };
        reader.readAsText(file);
      }
    });
    
    input.click();
  };

  return {
    init,
    renderProjects,
    renderTodos,
    showNewTodoForm,
    hideNewTodoForm,
    getNewTodoFormData,
    showEditTodoForm,
    hideEditTodoForm,
    getEditTodoFormData,
    showNewProjectForm,
    getSearchQuery,
    getFilterPriority,
    updateFilterDisplay,
    renderTagFilters,
    initThemeToggle,
    applyTheme,
    triggerExport,
    triggerImport
  };
})();

export default domController;
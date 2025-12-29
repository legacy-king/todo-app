import './styles/styles.css';
import todoManager from './modules/todoManager.js';
import domController from './modules/domController.js';
import storageManager from './modules/storageManager.js';

// Main Application Controller - connects everything
const appController = (() => {
  
  const init = () => {
    // Load theme first
    const savedTheme = storageManager.loadTheme();
    domController.applyTheme(savedTheme);
    
    // Load data from localStorage
    const savedData = storageManager.load();
    
    if (savedData) {
      todoManager.importData(savedData);
    } else {
      todoManager.init(); // Create default project
    }
    
    // Initialize DOM
    domController.init();
    
    // Setup theme toggle
    domController.initThemeToggle(savedTheme, handleThemeToggle);
    
    // Setup event listeners
    setupEventListeners();
    
    // Initial render
    render();
  };

  const setupEventListeners = () => {
    // Add new todo button
    const addTodoBtn = document.getElementById('add-todo-btn');
    if (addTodoBtn) {
      addTodoBtn.addEventListener('click', () => {
        domController.showNewTodoForm();
      });
    }
    
    // Save new todo
    const saveTodoBtn = document.getElementById('save-todo-btn');
    if (saveTodoBtn) {
      saveTodoBtn.addEventListener('click', handleSaveNewTodo);
    }
    
    // Cancel new todo
    const cancelTodoBtn = document.getElementById('cancel-todo-btn');
    if (cancelTodoBtn) {
      cancelTodoBtn.addEventListener('click', () => {
        domController.hideNewTodoForm();
      });
    }
    
    // Save edited todo
    const saveEditBtn = document.getElementById('save-edit-btn');
    if (saveEditBtn) {
      saveEditBtn.addEventListener('click', handleSaveEditTodo);
    }
    
    // Cancel edit todo
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', () => {
        domController.hideEditTodoForm();
      });
    }
    
    // Add new project button
    const addProjectBtn = document.getElementById('add-project-btn');
    if (addProjectBtn) {
      addProjectBtn.addEventListener('click', handleAddProject);
    }
    
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', handleSearch);
    }
    
    // Priority filter
    const filterPriority = document.getElementById('filter-priority');
    if (filterPriority) {
      filterPriority.addEventListener('change', handlePriorityFilter);
    }
    
    // Clear filters button
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', handleClearFilters);
    }
    
    // Export button
    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', handleExport);
    }
    
    // Import button
    const importBtn = document.getElementById('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', handleImport);
    }
    
    // Close modals when clicking outside
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  };

  // Todo handlers
  const handleSaveNewTodo = () => {
    const formData = domController.getNewTodoFormData();
    
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in title and due date!');
      return;
    }
    
    todoManager.addTodoToActiveProject(
      formData.title,
      formData.description,
      formData.dueDate,
      formData.priority,
      formData.notes,
      formData.tags
    );
    
    domController.hideNewTodoForm();
    saveAndRender();
  };

  const handleSaveEditTodo = () => {
    const formData = domController.getEditTodoFormData();
    
    if (!formData.title || !formData.dueDate) {
      alert('Please fill in title and due date!');
      return;
    }
    
    todoManager.updateTodoInActiveProject(formData.id, {
      title: formData.title,
      description: formData.description,
      dueDate: formData.dueDate,
      priority: formData.priority,
      notes: formData.notes,
      tags: formData.tags
    });
    
    domController.hideEditTodoForm();
    saveAndRender();
  };

  const handleTodoClick = (todoId) => {
    const todo = todoManager.getTodoFromActiveProject(todoId);
    if (todo) {
      domController.showEditTodoForm(todo);
    }
  };

  const handleDeleteTodo = (todoId) => {
    todoManager.removeTodoFromActiveProject(todoId);
    saveAndRender();
  };

  const handleToggleComplete = (todoId) => {
    todoManager.toggleTodoComplete(todoId);
    saveAndRender();
  };

  const handleReorderTodos = (fromIndex, toIndex) => {
    todoManager.reorderTodosInActiveProject(fromIndex, toIndex);
    saveAndRender();
  };

  // Project handlers
  const handleAddProject = () => {
    const projectName = domController.showNewProjectForm();
    
    if (projectName) {
      todoManager.addProject(projectName);
      saveAndRender();
    }
  };

  const handleProjectClick = (projectIndex) => {
    todoManager.setActiveProject(projectIndex);
    saveAndRender();
  };

  const handleDeleteProject = (projectIndex) => {
    todoManager.removeProject(projectIndex);
    saveAndRender();
  };

  // Search and filter handlers
  const handleSearch = (e) => {
    todoManager.setSearchQuery(e.target.value);
    renderTodos();
  };

  const handlePriorityFilter = (e) => {
    todoManager.setFilterPriority(e.target.value);
    renderTodos();
  };

  const handleTagFilterClick = (tag) => {
    const currentTags = todoManager.getFilterTags();
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    todoManager.setFilterTags(newTags);
    renderTodos();
    renderTagFilters();
  };

  const handleClearFilters = () => {
    todoManager.clearFilters();
    domController.updateFilterDisplay('', 'all', []);
    saveAndRender();
  };

  // Theme handler
  const handleThemeToggle = (theme) => {
    storageManager.saveTheme(theme);
  };

  // Export/Import handlers
  const handleExport = () => {
    const jsonData = todoManager.exportToJSON();
    domController.triggerExport(jsonData);
  };

  const handleImport = () => {
    domController.triggerImport((jsonString) => {
      const success = todoManager.importFromJSON(jsonString);
      if (success) {
        alert('Todos imported successfully!');
        saveAndRender();
      } else {
        alert('Error importing file. Please check the file format.');
      }
    });
  };

  // Save and render
  const saveAndRender = () => {
    // Save to localStorage
    const data = todoManager.exportData();
    storageManager.save(data);
    
    // Re-render everything
    render();
  };

  const render = () => {
    renderProjects();
    renderTodos();
    renderTagFilters();
    updateProjectTitle();
  };

  const renderProjects = () => {
    const projects = todoManager.getAllProjects();
    const activeIndex = todoManager.getActiveProjectIndex();
    
    domController.renderProjects(
      projects,
      activeIndex,
      handleProjectClick,
      handleDeleteProject
    );
  };

  const renderTodos = () => {
    const filteredTodos = todoManager.getFilteredTodos();
    
    domController.renderTodos(
      filteredTodos,
      handleTodoClick,
      handleDeleteTodo,
      handleToggleComplete,
      handleReorderTodos
    );
  };

  const renderTagFilters = () => {
    const allTags = todoManager.getAllTagsInActiveProject();
    const selectedTags = todoManager.getFilterTags();
    
    domController.renderTagFilters(
      allTags,
      selectedTags,
      handleTagFilterClick
    );
  };

  const updateProjectTitle = () => {
    const activeProject = todoManager.getActiveProject();
    const titleElement = document.getElementById('project-title');
    if (titleElement && activeProject) {
      titleElement.textContent = activeProject.name;
    }
  };

  return {
    init
  };
})();

// Start the app!
appController.init();
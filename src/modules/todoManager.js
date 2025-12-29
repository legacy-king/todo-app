import { createProject } from './project.js';
import { createTodo } from './todo.js';

// Enhanced Application logic with filtering, searching, and more
const todoManager = (() => {
  let projects = [];
  let activeProjectIndex = 0;
  let searchQuery = '';
  let filterPriority = 'all';
  let filterTags = [];

  // Initialize with default project
  const init = () => {
    if (projects.length === 0) {
      const defaultProject = createProject('My Tasks');
      projects.push(defaultProject);
    }
  };

  // Project management
  const addProject = (projectName) => {
    const newProject = createProject(projectName);
    projects.push(newProject);
    return projects.length - 1;
  };

  const removeProject = (index) => {
    if (projects.length > 1) {
      projects.splice(index, 1);
      if (activeProjectIndex >= projects.length) {
        activeProjectIndex = projects.length - 1;
      }
    }
  };

  const getProject = (index) => {
    return projects[index];
  };

  const getAllProjects = () => {
    return projects;
  };

  const setActiveProject = (index) => {
    activeProjectIndex = index;
    // Reset filters when switching projects
    searchQuery = '';
    filterPriority = 'all';
    filterTags = [];
  };

  const getActiveProject = () => {
    return projects[activeProjectIndex];
  };

  const getActiveProjectIndex = () => {
    return activeProjectIndex;
  };

  // Todo management
  const addTodoToActiveProject = (title, description, dueDate, priority, notes, tags) => {
    const todo = createTodo(title, description, dueDate, priority, notes, tags);
    projects[activeProjectIndex].addTodo(todo);
    return todo;
  };

  const removeTodoFromActiveProject = (todoId) => {
    projects[activeProjectIndex].removeTodo(todoId);
  };

  const getTodoFromActiveProject = (todoId) => {
    return projects[activeProjectIndex].getTodoById(todoId);
  };

  const updateTodoInActiveProject = (todoId, data) => {
    const todo = projects[activeProjectIndex].getTodoById(todoId);
    if (todo) {
      todo.update(data);
    }
  };

  const toggleTodoComplete = (todoId) => {
    const todo = projects[activeProjectIndex].getTodoById(todoId);
    if (todo) {
      todo.toggleComplete();
    }
  };

  // Reordering
  const reorderTodosInActiveProject = (fromIndex, toIndex) => {
    projects[activeProjectIndex].reorderTodos(fromIndex, toIndex);
  };

  // Move todo between projects
  const moveTodoToProject = (todoId, targetProjectIndex) => {
    const todo = projects[activeProjectIndex].removeTodoAndReturn(todoId);
    if (todo && projects[targetProjectIndex]) {
      projects[targetProjectIndex].addTodo(todo);
      return true;
    }
    return false;
  };

  // Search and Filter
  const setSearchQuery = (query) => {
    searchQuery = query.toLowerCase();
  };

  const getSearchQuery = () => {
    return searchQuery;
  };

  const setFilterPriority = (priority) => {
    filterPriority = priority;
  };

  const getFilterPriority = () => {
    return filterPriority;
  };

  const setFilterTags = (tags) => {
    filterTags = tags;
  };

  const getFilterTags = () => {
    return filterTags;
  };

  // THIS WAS MISSING! Get filtered todos based on search and filters
  const getFilteredTodos = () => {
    let todos = projects[activeProjectIndex].getAllTodos();

    // Apply search filter
    if (searchQuery) {
      todos = todos.filter(todo => 
        todo.title.toLowerCase().includes(searchQuery) ||
        todo.description.toLowerCase().includes(searchQuery)
      );
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      todos = todos.filter(todo => todo.priority === filterPriority);
    }

    // Apply tag filter
    if (filterTags.length > 0) {
      todos = todos.filter(todo => 
        filterTags.some(tag => todo.tags.includes(tag))
      );
    }

    return todos;
  };

  const clearFilters = () => {
    searchQuery = '';
    filterPriority = 'all';
    filterTags = [];
  };

  // Get all tags from active project
  const getAllTagsInActiveProject = () => {
    return projects[activeProjectIndex].getAllTags();
  };

  // Export/Import
  const exportToJSON = () => {
    const data = {
      projects: projects.map(project => project.toJSON()),
      activeProjectIndex,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  };

  const importFromJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      importData(data);
      return true;
    } catch (error) {
      console.error('Error importing JSON:', error);
      return false;
    }
  };

  // For localStorage
  const exportData = () => {
    return {
      projects: projects.map(project => project.toJSON()),
      activeProjectIndex
    };
  };

  const importData = (data) => {
    projects = data.projects.map(projectData => {
      const project = createProject(projectData.name);
      project.id = projectData.id; // Preserve ID
      projectData.todos.forEach(todoData => {
        const todo = createTodo(
          todoData.title,
          todoData.description,
          todoData.dueDate,
          todoData.priority,
          todoData.notes,
          todoData.tags || []
        );
        todo.id = todoData.id; // Preserve ID
        todo.isComplete = todoData.isComplete;
        project.addTodo(todo);
      });
      return project;
    });
    activeProjectIndex = data.activeProjectIndex || 0;
  };

  return {
    init,
    addProject,
    removeProject,
    getProject,
    getAllProjects,
    setActiveProject,
    getActiveProject,
    getActiveProjectIndex,
    addTodoToActiveProject,
    removeTodoFromActiveProject,
    getTodoFromActiveProject,
    updateTodoInActiveProject,
    toggleTodoComplete,
    reorderTodosInActiveProject,
    moveTodoToProject,
    setSearchQuery,
    getSearchQuery,
    setFilterPriority,
    getFilterPriority,
    setFilterTags,
    getFilterTags,
    getFilteredTodos,  // MAKE SURE THIS IS EXPORTED!
    clearFilters,
    getAllTagsInActiveProject,
    exportToJSON,
    importFromJSON,
    exportData,
    importData
  };
})();

export default todoManager;
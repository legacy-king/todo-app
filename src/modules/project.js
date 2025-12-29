// Enhanced Project Factory with reordering and ID
export const createProject = (name) => {
  let todos = [];
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);

  return {
    id,
    name,
    
    addTodo(todo) {
      todos.push(todo);
    },
    
    removeTodo(todoId) {
      todos = todos.filter(todo => todo.id !== todoId);
    },
    
    // THIS WAS MISSING! Get todo by ID
    getTodoById(todoId) {
      return todos.find(todo => todo.id === todoId);
    },
    
    getTodoByIndex(index) {
      return todos[index];
    },
    
    // THIS WAS MISSING! Get index by ID
    getTodoIndexById(todoId) {
      return todos.findIndex(todo => todo.id === todoId);
    },
    
    getAllTodos() {
      return todos;
    },
    
    setName(newName) {
      this.name = newName;
    },
    
    // Reorder todos (for drag & drop)
    reorderTodos(fromIndex, toIndex) {
      const [movedTodo] = todos.splice(fromIndex, 1);
      todos.splice(toIndex, 0, movedTodo);
    },
    
    // Move todo to another project
    removeTodoAndReturn(todoId) {
      const todo = todos.find(t => t.id === todoId);
      if (todo) {
        todos = todos.filter(t => t.id !== todoId);
        return todo;
      }
      return null;
    },
    
    // Get all unique tags from todos
    getAllTags() {
      const tagSet = new Set();
      todos.forEach(todo => {
        if (todo.tags && Array.isArray(todo.tags)) {
          todo.tags.forEach(tag => tagSet.add(tag));
        }
      });
      return Array.from(tagSet);
    },
    
    // For localStorage
    toJSON() {
      return {
        id: this.id,
        name: this.name,
        todos: todos.map(todo => todo.toJSON())
      };
    }
  };
};
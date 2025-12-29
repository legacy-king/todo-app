// Enhanced Todo Factory with tags, ID, and overdue detection
export const createTodo = (title, description, dueDate, priority, notes = '', tags = []) => {
  let isComplete = false;
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9); // Unique ID

  return {
    id,
    title,
    description,
    dueDate,
    priority, // 'low', 'medium', 'high'
    notes,
    tags, // Array of tags
    isComplete,
    
    // Methods
    toggleComplete() {
      this.isComplete = !this.isComplete;
    },
    
    setTitle(newTitle) {
      this.title = newTitle;
    },
    
    setDescription(newDescription) {
      this.description = newDescription;
    },
    
    setDueDate(newDate) {
      this.dueDate = newDate;
    },
    
    setPriority(newPriority) {
      this.priority = newPriority;
    },
    
    setNotes(newNotes) {
      this.notes = newNotes;
    },
    
    // Tag management
    addTag(tag) {
      if (!this.tags.includes(tag)) {
        this.tags.push(tag);
      }
    },
    
    removeTag(tag) {
      this.tags = this.tags.filter(t => t !== tag);
    },
    
    setTags(newTags) {
      this.tags = newTags;
    },
    
    // Check if overdue - THIS WAS THE MISSING FUNCTION!
    isOverdue() {
      if (this.isComplete) return false; // Completed todos are never overdue
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const due = new Date(this.dueDate);
      due.setHours(0, 0, 0, 0);
      return due < today;
    },
    
    // Update all properties at once (for editing)
    update(data) {
      if (data.title !== undefined) this.title = data.title;
      if (data.description !== undefined) this.description = data.description;
      if (data.dueDate !== undefined) this.dueDate = data.dueDate;
      if (data.priority !== undefined) this.priority = data.priority;
      if (data.notes !== undefined) this.notes = data.notes;
      if (data.tags !== undefined) this.tags = data.tags;
    },
    
    // For localStorage - convert to plain object
    toJSON() {
      return {
        id: this.id,
        title: this.title,
        description: this.description,
        dueDate: this.dueDate,
        priority: this.priority,
        notes: this.notes,
        tags: this.tags,
        isComplete: this.isComplete
      };
    }
  };
};
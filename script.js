// TaskFlow - Modern To-Do List App
class TaskFlow {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.hideLoadingScreen();
        this.renderTasks();
        this.updateProgress();
    }

    // Loading Screen
    hideLoadingScreen() {
        setTimeout(() => {
            const loadingScreen = document.getElementById('loadingScreen');
            loadingScreen.classList.add('fade-out');
        }, 1000);
    }

    // Event Listeners
    setupEventListeners() {
        // Landing to App transition
        document.getElementById('startPlanningBtn').addEventListener('click', () => {
            this.transitionToApp();
        });

        // Task Form
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        // Filter Tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        // Input animations
        const inputs = document.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('focus', () => {
                input.parentElement.style.transform = 'scale(1.02)';
            });
            
            input.addEventListener('blur', () => {
                input.parentElement.style.transform = 'scale(1)';
            });
        });
    }

    // Transition from Landing to App
    transitionToApp() {
        const landingSection = document.getElementById('landingSection');
        const appSection = document.getElementById('appSection');

        landingSection.classList.add('slide-up');
        
        setTimeout(() => {
            appSection.classList.add('active');
        }, 300);
    }

    // Task Management
    addTask() {
        const titleInput = document.getElementById('taskTitle');
        const prioritySelect = document.getElementById('prioritySelect');
        const timeSelect = document.getElementById('timeSelect');

        const title = titleInput.value.trim();
        const priority = prioritySelect.value;
        const time = parseInt(timeSelect.value);

        if (!title) return;

        const task = {
            id: Date.now(),
            title,
            priority,
            time,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.renderTasks();
        this.updateProgress();

        // Reset form with animation
        this.resetForm();
        
        // Show success feedback
        this.showFeedback('Task added successfully!');
    }

    resetForm() {
        const form = document.getElementById('taskForm');
        form.reset();
        
        // Add animation to form
        form.style.transform = 'scale(0.98)';
        setTimeout(() => {
            form.style.transform = 'scale(1)';
        }, 200);
    }

    deleteTask(taskId) {
        const taskCard = document.querySelector(`[data-task-id="${taskId}"]`);
        
        if (taskCard) {
            taskCard.classList.add('removing');
            
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => task.id !== taskId);
                this.saveTasks();
                this.renderTasks();
                this.updateProgress();
                this.showFeedback('Task deleted!');
            }, 500);
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
            this.updateProgress();
            
            const message = task.completed ? 'Task completed!' : 'Task marked as pending';
            this.showFeedback(message);
        }
    }

    // Filtering
    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active tab
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderTasks();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'completed':
                return this.tasks.filter(task => task.completed);
            case 'pending':
                return this.tasks.filter(task => !task.completed);
            default:
                return this.tasks;
        }
    }

    // Rendering
    renderTasks() {
        const container = document.getElementById('tasksContainer');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.renderEmptyState(container);
        } else {
            this.renderTaskList(container, filteredTasks);
        }
    }

    renderEmptyState(container) {
        const emptyMessages = {
            all: {
                icon: '📝',
                title: 'No tasks yet',
                subtitle: 'Start by adding your first task above'
            },
            completed: {
                icon: '✅',
                title: 'No completed tasks',
                subtitle: 'Complete some tasks to see them here'
            },
            pending: {
                icon: '⏳',
                title: 'No pending tasks',
                subtitle: 'All tasks are completed!'
            }
        };

        const message = emptyMessages[this.currentFilter];
        
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">${message.icon}</div>
                <h3>${message.title}</h3>
                <p>${message.subtitle}</p>
            </div>
        `;
    }

    renderTaskList(container, tasks) {
        container.innerHTML = tasks.map(task => this.createTaskCard(task)).join('');
        
        // Add event listeners to new task cards
        setTimeout(() => {
            this.attachTaskEventListeners();
        }, 100);
    }

    createTaskCard(task) {
        const priorityClass = `priority-${task.priority}`;
        const completedClass = task.completed ? 'completed' : '';
        const completedText = task.completed ? 'Undo' : 'Complete';
        const completedBtnClass = task.completed ? '' : 'complete-btn';

        return `
            <div class="task-card ${completedClass}" data-task-id="${task.id}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <span class="task-priority ${priorityClass}">${task.priority}</span>
                </div>
                <div class="task-meta">
                    <span class="task-time">${this.formatTime(task.time)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-btn ${completedBtnClass}" onclick="taskFlow.toggleTask(${task.id})">
                        ${completedText}
                    </button>
                    <button class="task-btn delete-btn" onclick="taskFlow.deleteTask(${task.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    attachTaskEventListeners() {
        // Add hover effects and animations to task cards
        document.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }

    // Progress Tracking
    updateProgress() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const percentage = total > 0 ? (completed / total) * 100 : 0;

        document.getElementById('progressCount').textContent = `${completed}/${total}`;
        document.getElementById('progressFill').style.width = `${percentage}%`;
    }

    // Storage
    saveTasks() {
        localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
    }

    loadTasks() {
        const stored = localStorage.getItem('taskflow_tasks');
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
            } catch (e) {
                console.error('Error loading tasks:', e);
                this.tasks = [];
            }
        }
    }

    // Utility Functions
    formatTime(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        } else if (minutes === 60) {
            return '1 hour';
        } else if (minutes < 120) {
            return '1.5 hours';
        } else {
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            if (remainingMinutes === 0) {
                return `${hours} hours`;
            } else {
                return `${hours}h ${remainingMinutes}m`;
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showFeedback(message) {
        // Create feedback element
        const feedback = document.createElement('div');
        feedback.className = 'feedback-toast';
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(102, 126, 234, 0.9));
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(31, 38, 135, 0.37);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            font-weight: 500;
        `;

        // Add animation styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(feedback);

        // Remove after 3 seconds
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(feedback);
            }, 300);
        }, 3000);
    }
}

// Initialize the app
let taskFlow;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    taskFlow = new TaskFlow();
    
    // Add some initial animation to the page
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Prevent form submission on Enter key in inputs
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
    }
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + K to focus on task input
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('taskTitle').focus();
    }
    
    // Escape to blur input
    if (e.key === 'Escape') {
        document.activeElement.blur();
    }
});

// Add smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

// Performance optimization: Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Re-render tasks if needed for responsive layout
        if (taskFlow) {
            taskFlow.renderTasks();
        }
    }, 250);
});

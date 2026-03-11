import React, { useEffect, useState, useRef } from 'react';
import { Plus, Check, Trash2, Clock, Play, Pause, X, Coffee, RefreshCw, Repeat } from 'lucide-react';
import api from '../api/axios';
import useNotifications from '../hooks/useNotifications';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Task Item component
const SortableTask = ({ task, onToggle, onDelete, onPomodoro }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-background p-4 rounded-xl shadow-sm border border-border flex items-center justify-between transition ${task.completed ? 'opacity-60' : ''}`}
        >
            <div className="flex items-center space-x-3">
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="cursor-grab text-text-muted hover:text-text p-1 touch-none">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                        <circle cx="4" cy="3" r="1.5" /><circle cx="10" cy="3" r="1.5" />
                        <circle cx="4" cy="7" r="1.5" /><circle cx="10" cy="7" r="1.5" />
                        <circle cx="4" cy="11" r="1.5" /><circle cx="10" cy="11" r="1.5" />
                    </svg>
                </div>
                <button
                    onClick={() => onToggle(task.id, task.completed)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${task.completed ? 'bg-success-500 border-success-500 text-white' : 'border-text-muted text-transparent hover:border-primary-500'}`}
                >
                    <Check size={14} />
                </button>
                <div>
                    <div className="flex items-center gap-2">
                        <h4 className={`text-base font-medium ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}>{task.title}</h4>
                        {task.recurring !== 'None' && (
                            <span className="flex items-center text-xs text-primary-500 bg-primary-500/10 px-2 py-0.5 rounded-full">
                                <Repeat size={10} className="mr-1" />{task.recurring}
                            </span>
                        )}
                    </div>
                    <div className="flex space-x-2 text-xs mt-1">
                        <span className="bg-surface px-2 py-0.5 rounded text-text-muted">{task.category}</span>
                        <span className={`px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-danger-500/10 text-danger-500' : task.priority === 'Medium' ? 'bg-warning-500/10 text-warning-500' : 'bg-success-500/10 text-success-500'}`}>
                            {task.priority} Priority
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
                {!task.completed && (
                    <button onClick={() => onPomodoro(task)} className="text-text-muted hover:text-primary-500 transition p-2" title="Start Pomodoro">
                        <Clock size={17} />
                    </button>
                )}
                <button onClick={() => onDelete(task.id)} className="text-text-muted hover:text-danger-500 transition p-2">
                    <Trash2 size={17} />
                </button>
            </div>
        </div>
    );
};

const DailyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [category, setCategory] = useState('Study');
    const [priority, setPriority] = useState('Medium');
    const [recurring, setRecurring] = useState('None');
    const { sendNotification } = useNotifications();

    // DnD sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    // --- POMODORO TIMER STATE ---
    const [activeTask, setActiveTask] = useState(null);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [timerMode, setTimerMode] = useState('focus');
    const timerRef = useRef(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            clearInterval(timerRef.current);
            if (timerMode === 'focus') {
                sendNotification('Pomodoro Complete!', { body: 'Time for a 5-minute break.' });
                setTimerMode('break');
                setTimeLeft(5 * 60);
            } else {
                sendNotification('Break Over!', { body: 'Ready to focus again?' });
                setTimerMode('focus');
                setTimeLeft(25 * 60);
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isRunning, timeLeft, timerMode]);

    const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
    const toggleTimer = () => setIsRunning(!isRunning);
    const resetTimer = () => { setIsRunning(false); setTimeLeft(timerMode === 'focus' ? 25 * 60 : 5 * 60); };
    const startPomodoro = (task) => { setActiveTask(task); setTimerMode('focus'); setTimeLeft(25 * 60); setIsRunning(false); };
    const closePomodoro = () => { setIsRunning(false); setActiveTask(null); };

    useEffect(() => { fetchTasks(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            await api.post('/tasks', { title: newTask, category, priority, recurring });
            if (priority === 'High') sendNotification('High Priority Task Added', { body: `Don't forget: ${newTask}` });
            setNewTask('');
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggle = async (id, currentStatus) => {
        try {
            await api.put(`/tasks/${id}`, { completed: !currentStatus });
            fetchTasks();
        } catch (error) { console.error(error); }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) { console.error(error); }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = tasks.findIndex(t => t.id === active.id);
            const newIndex = tasks.findIndex(t => t.id === over.id);
            setTasks(arrayMove(tasks, oldIndex, newIndex));
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-text mb-6 md:mb-8">Daily Tasks</h1>

            <form onSubmit={handleAdd} className="bg-background p-4 md:p-6 rounded-2xl shadow-sm border border-border mb-6 md:mb-8">
                <div className="flex flex-col gap-3">
                    <input
                        type="text"
                        placeholder="What do you need to do?"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface text-text"
                    />
                    <div className="flex flex-wrap gap-3">
                        <select value={category} onChange={e => setCategory(e.target.value)} className="flex-1 min-w-[120px] px-4 py-2 border border-border rounded-lg bg-surface text-text outline-none">
                            <option>Study</option>
                            <option>Health</option>
                            <option>Personal</option>
                            <option>Work</option>
                            <option>Other</option>
                        </select>
                        <select value={priority} onChange={e => setPriority(e.target.value)} className="flex-1 min-w-[120px] px-4 py-2 border border-border rounded-lg bg-surface text-text outline-none">
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                        <select value={recurring} onChange={e => setRecurring(e.target.value)} className="flex-1 min-w-[120px] px-4 py-2 border border-border rounded-lg bg-surface text-text outline-none" title="Repeat">
                            <option value="None">Once</option>
                            <option value="Daily">Daily 🔁</option>
                            <option value="Weekly">Weekly 📅</option>
                        </select>
                        <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center w-full sm:w-auto">
                            <Plus size={20} className="mr-1" /> Add
                        </button>
                    </div>
                </div>
            </form>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-3">
                        {tasks.map(task => (
                            <SortableTask
                                key={task.id}
                                task={task}
                                onToggle={handleToggle}
                                onDelete={handleDelete}
                                onPomodoro={startPomodoro}
                            />
                        ))}
                        {tasks.length === 0 && (
                            <div className="text-center py-12 text-text-muted">
                                <Check className="mx-auto mb-3 opacity-50" size={48} />
                                <p>You're all caught up! Enjoy your day.</p>
                            </div>
                        )}
                    </div>
                </SortableContext>
            </DndContext>

            {/* Floating Pomodoro Widget — bottom-center on mobile, bottom-right on desktop */}
            {activeTask && (
                <div className="fixed bottom-20 left-1/2 -translate-x-1/2 lg:bottom-6 lg:left-auto lg:right-6 lg:translate-x-0 w-[90vw] max-w-xs bg-background border border-border rounded-2xl shadow-2xl overflow-hidden z-50">
                    <div className={`p-4 text-white flex justify-between items-center ${timerMode === 'focus' ? 'bg-primary-600' : 'bg-success-500'}`}>
                        <div className="flex items-center space-x-2">
                            {timerMode === 'focus' ? <Clock size={18} /> : <Coffee size={18} />}
                            <span className="font-semibold">{timerMode === 'focus' ? '🍅 Focus Time' : '☕ Break Time'}</span>
                        </div>
                        <button onClick={closePomodoro} className="text-white/70 hover:text-white"><X size={18} /></button>
                    </div>
                    <div className="p-6 flex flex-col items-center">
                        <p className="text-sm text-text-muted mb-3 text-center truncate w-full">{activeTask.title}</p>
                        <div className="text-6xl font-bold tracking-tight text-text mb-6">{formatTime(timeLeft)}</div>
                        <div className="flex space-x-4">
                            <button onClick={toggleTimer} className={`p-4 rounded-full text-white shadow-md hover:scale-105 transition-transform ${isRunning ? 'bg-warning-500' : 'bg-primary-600'}`}>
                                {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-0.5" />}
                            </button>
                            <button onClick={resetTimer} className="p-4 rounded-full bg-surface text-text hover:bg-border transition-colors shadow-sm">
                                <RefreshCw size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DailyTasks;

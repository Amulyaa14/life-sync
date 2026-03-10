import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash2, Clock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Plus, Check, Trash2, Clock } from 'lucide-react';
import api from '../api/axios';
import useNotifications from '../hooks/useNotifications';

const DailyTasks = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [category, setCategory] = useState('Study');
    const [priority, setPriority] = useState('Medium');
    const { sendNotification } = useNotifications();

    const fetchTasks = async () => {
        try {
            const { data } = await api.get('/tasks');
            setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchTasks(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        try {
            await api.post('/tasks', { title: newTask, category, priority });
            if (priority === 'High') {
                sendNotification('High Priority Task Added', { body: `Don't forget: ${newTask}` });
            }
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
        } catch (error) {
            console.error(error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await api.delete(`/tasks/${id}`);
            fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text mb-8">Daily Tasks</h1>

            <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-border mb-8">
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="What do you need to do?"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-surface text-text"
                    />
                    <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-surface text-text outline-none">
                        <option>Study</option>
                        <option>Health</option>
                        <option>Personal</option>
                        <option>Work</option>
                        <option>Other</option>
                    </select>
                    <select value={priority} onChange={e => setPriority(e.target.value)} className="px-4 py-2 border border-border rounded-lg bg-surface text-text outline-none">
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                    </select>
                    <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition flex items-center justify-center">
                        <Plus size={20} className="mr-1" /> Add
                    </button>
                </div>
            </form>

            <div className="space-y-4">
                {tasks.map(task => (
                    <div key={task._id} className={`bg-white p-4 rounded-xl shadow-sm border border-border flex items-center justify-between transition ${task.completed ? 'opacity-60' : ''}`}>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => handleToggle(task._id, task.completed)}
                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${task.completed ? 'bg-success-500 border-success-500 text-white' : 'border-text-muted text-transparent hover:border-primary-500'}`}
                            >
                                <Check size={14} />
                            </button>
                            <div>
                                <h4 className={`text-lg font-medium ${task.completed ? 'line-through text-text-muted' : 'text-text'}`}>{task.title}</h4>
                                <div className="flex space-x-3 text-xs mt-1">
                                    <span className="bg-surface px-2 py-0.5 rounded text-text-muted">{task.category}</span>
                                    <span className={`px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-danger-500/10 text-danger-500' : task.priority === 'Medium' ? 'bg-warning-500/10 text-warning-500' : 'bg-success-500/10 text-success-500'}`}>
                                        {task.priority} Priority
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => handleDelete(task._id)} className="text-text-muted hover:text-danger-500 transition p-2">
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
                {tasks.length === 0 && (
                    <div className="text-center py-12 text-text-muted">
                        <Check className="mx-auto mb-3 opacity-50" size={48} />
                        <p>You're all caught up! Enjoy your day.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DailyTasks;

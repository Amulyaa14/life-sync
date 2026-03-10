import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, Droplets, Moon, Sun } from 'lucide-react';
import api from '../api/axios';

const Dashboard = () => {
    const [health, setHealth] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [schedule, setSchedule] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [healthRes, tasksRes, scheduleRes] = await Promise.all([
                    api.get('/health'),
                    api.get('/tasks'),
                    api.get('/schedule')
                ]);
                setHealth(healthRes.data);
                setTasks(tasksRes.data);
                setSchedule(scheduleRes.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };
        fetchDashboardData();
    }, []);

    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-text">Welcome Back! ✨</h1>

            {/* Progress Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-muted">Daily Tasks</h3>
                        <CheckCircle className="text-primary-500" size={24} />
                    </div>
                    <div className="mt-4 flex items-end justify-between">
                        <div>
                            <span className="text-4xl font-bold text-text">{completedTasks}</span>
                            <span className="text-text-muted ml-2">/ {tasks.length}</span>
                        </div>
                        <span className="text-success-500 font-medium">{progress}%</span>
                    </div>
                    <div className="w-full bg-surface rounded-full h-2.5 mt-4">
                        <div className="bg-primary-500 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-muted">Current Schedule</h3>
                        <Sun className="text-warning-500" size={24} />
                    </div>
                    <div className="mt-4">
                        {schedule && schedule.blocks && schedule.blocks.length > 0 ? (
                            <div className="space-y-3">
                                {schedule.blocks.slice(0, 2).map((b, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="font-medium">{b.title}</span>
                                        <span className="text-text-muted">{b.startTime}</span>
                                    </div>
                                ))}
                                <div className="text-xs text-primary-600 font-medium cursor-pointer">View full timeline →</div>
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm mt-2">No schedule planned. Go to Planner to create one!</p>
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-border flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-muted">Health Summary</h3>
                        <Activity className="text-danger-500" size={24} />
                    </div>
                    <div className="flex justify-between mt-4">
                        <div className="text-center">
                            <Droplets className="mx-auto text-primary-500 mb-1" size={20} />
                            <span className="text-sm font-bold">{health?.waterIntake || 0}</span>
                            <p className="text-xs text-text-muted">Glasses</p>
                        </div>
                        <div className="text-center">
                            <Moon className="mx-auto text-secondary-500 mb-1" size={20} />
                            <span className="text-sm font-bold">{health?.sleepHours || 0}</span>
                            <p className="text-xs text-text-muted">Hrs Sleep</p>
                        </div>
                        <div className="text-center">
                            <Activity className="mx-auto text-success-500 mb-1" size={20} />
                            <span className="text-sm font-bold">{health?.exerciseMinutes || 0}</span>
                            <p className="text-xs text-text-muted">Min Ex.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

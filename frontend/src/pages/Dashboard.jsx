import React, { useEffect, useState } from 'react';
import { Activity, CheckCircle, Droplets, Moon, Sun, Flame, CloudSun, Wind, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/axios';

const QUOTES = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
    { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
    { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
    { text: "Small steps in the right direction can turn out to be the biggest step of your life.", author: "Naeem Callaway" },
];

const Dashboard = () => {
    const [health, setHealth] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [schedule, setSchedule] = useState(null);
    const [weather, setWeather] = useState(null);

    // Pick a quote based on day of month for daily cycling
    const quote = QUOTES[new Date().getDate() % QUOTES.length];

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

    // Fetch weather via geolocation + Open-Meteo (free, no API key needed)
    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            try {
                const { latitude: lat, longitude: lon } = coords;
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&temperature_unit=celsius`);
                const data = await res.json();
                setWeather(data.current_weather);
            } catch (e) { /* silently fail */ }
        });
    }, []);

    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100);

    // --- STREAK LOGIC ---
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        const storedStreak = parseInt(localStorage.getItem('lifesync_streak') || '0', 10);
        const lastStreakDate = localStorage.getItem('lifesync_last_streak_date');
        const today = new Date().toDateString();

        let currentStreak = storedStreak;

        // If progress is 100% and we haven't counted it today
        if (progress === 100 && tasks.length > 0 && lastStreakDate !== today) {
            // Check if it's consecutive
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);

            if (lastStreakDate === yesterday.toDateString()) {
                currentStreak += 1;
            } else if (lastStreakDate !== today) {
                // Missed a day, but got it today
                currentStreak = 1;
            }

            localStorage.setItem('lifesync_streak', currentStreak.toString());
            localStorage.setItem('lifesync_last_streak_date', today);
        } else if (lastStreakDate) {
            // Reset logic: if last streak date was older than yesterday and we don't have 100% today
            const lastDateObj = new Date(lastStreakDate);
            const diffTime = Math.abs(new Date() - lastDateObj);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 1 && progress < 100) {
                currentStreak = 0;
                localStorage.setItem('lifesync_streak', '0');
            }
        }

        setStreak(currentStreak);
    }, [progress, tasks.length]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-text">Welcome Back! ✨</h1>
                {streak > 0 && (
                    <div className="inline-flex items-center bg-warning-50 px-4 py-2 rounded-full border border-warning-200 shadow-sm" title={`${streak} Day Streak!`}>
                        <Flame className="text-warning-500 mr-2" fill="currentColor" size={24} />
                        <span className="font-bold text-warning-700 text-lg">{streak} Day Streak</span>
                    </div>
                )}
            </div>

            {/* Progress Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
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

                <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-text-muted">Current Schedule</h3>
                        <Sun className="text-warning-500" size={24} />
                    </div>
                    <div className="mt-4">
                        {schedule && schedule.blocks && schedule.blocks.length > 0 ? (
                            <div className="space-y-3">
                                {schedule.blocks.slice(0, 2).map((b, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span className="font-medium truncate pr-3">{b.title}</span>
                                        <span className="text-text-muted flex-shrink-0">{b.startTime}</span>
                                    </div>
                                ))}
                                <Link to="/planner" className="inline-block text-xs text-primary-600 font-medium hover:underline mt-1">View full timeline →</Link>
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm mt-2">No schedule planned. Go to Planner to create one!</p>
                        )}
                    </div>
                </div>

                <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border flex flex-col justify-between">
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

            {/* Smart Widgets Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Quote of the Day */}
                <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border flex items-start space-x-4">
                    <Quote className="text-secondary-500 flex-shrink-0 mt-1" size={28} />
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-2">Quote of the Day</p>
                        <p className="text-text font-medium italic leading-relaxed">"{quote.text}"</p>
                        <p className="text-text-muted text-sm mt-2">— {quote.author}</p>
                    </div>
                </div>

                {/* Weather Widget */}
                <div className="bg-background rounded-2xl p-4 sm:p-6 shadow-sm border border-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">Current Weather</p>
                    {weather ? (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-center space-x-4">
                                <CloudSun className="text-warning-500" size={48} />
                                <div>
                                    <p className="text-3xl sm:text-4xl font-bold text-text">{weather.temperature}°C</p>
                                    <p className="text-text-muted text-sm">Windspeed {weather.windspeed} km/h</p>
                                </div>
                            </div>
                            <div className="flex items-center text-text-muted">
                                <Wind size={18} className="mr-1" />
                                <span className="text-sm">{weather.windspeed} km/h</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-3 text-text-muted">
                            <CloudSun size={36} className="opacity-40" />
                            <p className="text-sm">Allow location access to see weather.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

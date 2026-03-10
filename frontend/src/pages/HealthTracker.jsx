import React, { useEffect, useState } from 'react';
import { Plus, Minus, Droplets, Moon, Activity, Smile, BookOpen, Save } from 'lucide-react';
import api from '../api/axios';

const HealthTracker = () => {
    const [health, setHealth] = useState({ waterIntake: 0, sleepHours: 0, exerciseMinutes: 0, mood: 'Okay', journalEntry: '' });
    const [journalDraft, setJournalDraft] = useState('');
    const [journalSaved, setJournalSaved] = useState(false);

    const fetchHealth = async () => {
        try {
            const { data } = await api.get('/health');
            setHealth(data);
            setJournalDraft(data.journalEntry || '');
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchHealth(); }, []);

    const updateField = async (field, value) => {
        setHealth(prev => ({ ...prev, [field]: value }));
        try {
            await api.put('/health', { [field]: value });
        } catch (error) {
            console.error(error);
        }
    };

    const adjustValue = (field, current, delta, min = 0) => {
        const newVal = Math.max(min, current + delta);
        updateField(field, newVal);
    };

    const saveJournal = async () => {
        await updateField('journalEntry', journalDraft);
        setJournalSaved(true);
        setTimeout(() => setJournalSaved(false), 2000);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-text mb-8">Health Tracker</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Water */}
                <div className="bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                    <Droplets size={48} className="text-primary-500 mb-4" />
                    <h3 className="text-xl font-medium text-text">Water Intake</h3>
                    <p className="text-text-muted text-sm mb-6">Aim for 8 glasses daily.</p>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => adjustValue('waterIntake', health.waterIntake, -1)} className="p-2 border border-border rounded-full hover:bg-surface"><Minus size={20} /></button>
                        <span className="text-4xl font-bold text-text">{health.waterIntake}</span>
                        <button onClick={() => adjustValue('waterIntake', health.waterIntake, 1)} className="p-2 border border-border rounded-full hover:bg-surface"><Plus size={20} /></button>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Glasses</p>
                </div>

                {/* Sleep */}
                <div className="bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                    <Moon size={48} className="text-secondary-500 mb-4" />
                    <h3 className="text-xl font-medium text-text">Sleep</h3>
                    <p className="text-text-muted text-sm mb-6">How many hours did you sleep?</p>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => adjustValue('sleepHours', health.sleepHours, -0.5)} className="p-2 border border-border rounded-full hover:bg-surface"><Minus size={20} /></button>
                        <span className="text-4xl font-bold text-text">{health.sleepHours}</span>
                        <button onClick={() => adjustValue('sleepHours', health.sleepHours, 0.5)} className="p-2 border border-border rounded-full hover:bg-surface"><Plus size={20} /></button>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Hours</p>
                </div>

                {/* Exercise */}
                <div className="bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                    <Activity size={48} className="text-success-500 mb-4" />
                    <h3 className="text-xl font-medium text-text">Exercise</h3>
                    <p className="text-text-muted text-sm mb-6">Log your active minutes.</p>
                    <div className="flex items-center space-x-6">
                        <button onClick={() => adjustValue('exerciseMinutes', health.exerciseMinutes, -10)} className="p-2 border border-border rounded-full hover:bg-surface"><Minus size={20} /></button>
                        <span className="text-4xl font-bold text-text">{health.exerciseMinutes}</span>
                        <button onClick={() => adjustValue('exerciseMinutes', health.exerciseMinutes, 10)} className="p-2 border border-border rounded-full hover:bg-surface"><Plus size={20} /></button>
                    </div>
                    <p className="mt-4 text-xs font-semibold text-text-muted uppercase tracking-wider">Minutes</p>
                </div>

                {/* Mood */}
                <div className="bg-background p-6 rounded-2xl shadow-sm border border-border flex flex-col items-center">
                    <Smile size={48} className="text-warning-500 mb-4" />
                    <h3 className="text-xl font-medium text-text">Mood</h3>
                    <p className="text-text-muted text-sm mb-6">How are you feeling today?</p>
                    <div className="w-full mt-2">
                        <select
                            value={health.mood}
                            onChange={e => updateField('mood', e.target.value)}
                            className="w-full px-4 py-3 border border-border rounded-xl text-lg text-center bg-surface text-text font-medium outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="Great">🤩 Great</option>
                            <option value="Good">😊 Good</option>
                            <option value="Okay">😐 Okay</option>
                            <option value="Bad">😞 Bad</option>
                            <option value="Terrible">😫 Terrible</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Daily Gratitude Journal */}
            <div className="bg-background mt-6 p-6 rounded-2xl shadow-sm border border-border">
                <div className="flex items-center mb-4">
                    <BookOpen size={24} className="text-secondary-500 mr-3" />
                    <h3 className="text-xl font-semibold text-text">Daily Gratitude Journal</h3>
                </div>
                <p className="text-text-muted text-sm mb-4">Write one thing you're grateful for today. Reflect. Grow. ✨</p>
                <textarea
                    rows={4}
                    value={journalDraft}
                    onChange={e => setJournalDraft(e.target.value)}
                    placeholder="Today I am grateful for..."
                    className="w-full px-4 py-3 bg-surface border border-border rounded-xl resize-none text-text focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
                <div className="flex justify-end mt-3">
                    <button
                        onClick={saveJournal}
                        className={`flex items-center px-5 py-2 rounded-xl font-medium transition ${journalSaved ? 'bg-success-500 text-white' : 'bg-secondary-500 hover:bg-secondary-600 text-white'}`}
                    >
                        <Save size={16} className="mr-2" />
                        {journalSaved ? 'Saved! ✓' : 'Save Entry'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HealthTracker;

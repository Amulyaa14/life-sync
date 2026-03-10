import React, { useState, useEffect } from 'react';
import { Calendar, RefreshCw, Layers } from 'lucide-react';
import api from '../api/axios';

const RoutinePlanner = () => {
    const [text, setText] = useState('');
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchSchedule = async () => {
        try {
            const { data } = await api.get('/schedule');
            if (data && data.blocks) {
                setSchedule(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => { fetchSchedule(); }, []);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        setLoading(true);
        try {
            const { data } = await api.post('/schedule', { rawText: text });
            setSchedule(data.schedule);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const getBlockColor = (type) => {
        switch (type) {
            case 'study': return 'border-primary-500 bg-primary-500/10 text-primary-500';
            case 'health': return 'border-success-500 bg-success-500/10 text-success-500';
            case 'rest': return 'border-secondary-500 bg-secondary-500/10 text-secondary-500';
            case 'work': return 'border-warning-500 bg-warning-500/10 text-warning-500';
            default: return 'border-border bg-background text-text-muted';
        }
    };

    return (
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-8">
            {/* Input Section */}
            <div className="lg:w-1/2">
                <h1 className="text-3xl font-bold text-text mb-2">Routine Planner</h1>
                <p className="text-text-muted mb-6">Describe your day naturally, and we will generate a timeline for you.</p>

                <form onSubmit={handleGenerate} className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                    <label className="block text-sm font-medium text-text mb-2">Natural Routine Input</label>
                    <textarea
                        rows="5"
                        placeholder={`Example: "Wake up at 6 AM, study Java for 2 hours, exercise 30 minutes, college from 9-4, sleep at 11 PM"`}
                        className="w-full px-4 py-3 bg-surface border border-border rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 text-text mb-4"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    <button
                        type="submit"
                        disabled={loading || !text.trim()}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {loading ? <RefreshCw className="animate-spin mr-2" size={20} /> : <Calendar className="mr-2" size={20} />}
                        Generate Schedule
                    </button>
                </form>
            </div>

            {/* Timeline Section */}
            <div className="lg:w-1/2">
                <div className="bg-surface rounded-2xl p-6 min-h-[500px]">
                    <h2 className="text-xl font-bold text-text mb-6 flex items-center">
                        <Layers className="mr-2 text-primary-500" size={24} />
                        Today's Timeline
                    </h2>

                    {!schedule || !schedule.blocks || schedule.blocks.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-text-muted mt-20">
                            <Calendar size={48} className="mb-4 opacity-50 text-primary-300" />
                            <p>No schedule generated yet.</p>
                        </div>
                    ) : (
                        <div className="relative border-l-2 border-border ml-3 space-y-6">
                            {schedule.blocks.map((block, idx) => (
                                <div key={idx} className="relative pl-6">
                                    {/* Dot */}
                                    <div className="absolute w-4 h-4 rounded-full bg-primary-500 border-4 border-surface -left-[9px] top-1"></div>

                                    <div className={`p-4 rounded-xl border-l-4 shadow-sm ${getBlockColor(block.type)}`}>
                                        <div className="flex justify-between items-start mb-1">
                                            <h4 className="font-semibold">{block.title}</h4>
                                            <span className="text-xs font-bold uppercase py-1 px-2 rounded-full bg-background/50 text-text inline-block shadow-sm">
                                                {block.startTime} - {block.endTime}
                                            </span>
                                        </div>
                                        <span className="text-xs font-medium uppercase opacity-70 mt-2 block">{block.type}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoutinePlanner;

import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Bar, Line, Radar } from 'react-chartjs-2';
import api from '../api/axios';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const response = await api.get('/analytics');
                setData(response.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="text-center mt-20 text-text-muted">Loading Analytics...</div>;
    if (!data) return <div className="text-center mt-20 text-text-muted">No data available.</div>;

    // 1. Process Productivity Bar Chart Data
    // Generate last 7 days labels
    const last7Days = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0]; // YYYY-MM-DD
    });

    const prodMap = {};
    if (data.productivity && Array.isArray(data.productivity)) {
        data.productivity.forEach(item => prodMap[item._id] = item.count);
    }
    const prodData = last7Days.map(date => prodMap[date] || 0);

    const barChartData = {
        labels: last7Days,
        datasets: [{
            label: 'Tasks Completed',
            data: prodData,
            backgroundColor: 'rgba(59, 130, 246, 0.8)', // primary-500
            borderRadius: 6
        }]
    };

    // 2. Process Study Hours Line Chart
    const studyData = last7Days.map(date => data.studyHours[date] || 0);
    const lineChartData = {
        labels: last7Days,
        datasets: [{
            label: 'Study Hours',
            data: studyData,
            borderColor: 'rgba(124, 58, 237, 1)', // secondary-600
            backgroundColor: 'rgba(124, 58, 237, 0.2)',
            tension: 0.3,
            fill: true
        }]
    };

    // 3. Process Health Statistics Radar Chart
    // Normalize data for radar visualization (example: target water=8, sleep=8, exercise=60)
    const healthTargetMulipliers = {
        water: 100 / 8,      // % of 8 glasses
        sleep: 100 / 8,      // % of 8 hours
        exercise: 100 / 60   // % of 60 mins
    };

    const h = data.health || {};
    const radarChartData = {
        labels: ['Water Intake', 'Sleep Hours', 'Exercise Mins'],
        datasets: [{
            label: '7-Day Avg Health Performance (%)',
            data: [
                Math.min(100, (h.water || 0) * healthTargetMulipliers.water),
                Math.min(100, (h.sleep || 0) * healthTargetMulipliers.sleep),
                Math.min(100, (h.exercise || 0) * healthTargetMulipliers.exercise)
            ],
            backgroundColor: 'rgba(34, 197, 94, 0.3)', // success-500
            borderColor: 'rgba(34, 197, 94, 1)',
            pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        }]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' },
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
            <h1 className="text-2xl md:text-3xl font-bold text-text">Analytics Overview</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-8">
                {/* Weekly Productivity Chart */}
                <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-sm border border-border h-72 sm:h-80">
                    <h3 className="text-lg font-medium text-text-muted mb-4">Weekly Productivity</h3>
                    <Bar data={barChartData} options={chartOptions} />
                </div>

                {/* Study Hours Chart */}
                <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-sm border border-border h-72 sm:h-80">
                    <h3 className="text-lg font-medium text-text-muted mb-4">Study Trends</h3>
                    <Line data={lineChartData} options={chartOptions} />
                </div>

                {/* Health Statistics Chart */}
                <div className="bg-background p-4 sm:p-6 rounded-2xl shadow-sm border border-border h-80 lg:col-span-2 flex flex-col items-center">
                    <h3 className="text-lg font-medium text-text-muted mb-4 self-start">Health Balance</h3>
                    <div className="h-full w-full max-w-md">
                        <Radar
                            data={radarChartData}
                            options={{
                                ...chartOptions,
                                scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

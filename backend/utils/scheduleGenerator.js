// A basic heuristic-based natural language parser for schedules.

function parseTimeBlock(text) {
    let durationMins = 60; // default 1 hour
    const hourMatch = text.match(/(\d+)\s*(hour|hr)s?/i);
    if (hourMatch) durationMins = parseInt(hourMatch[1]) * 60;

    const minMatch = text.match(/(\d+)\s*(minute|min)s?/i);
    if (minMatch) durationMins = parseInt(minMatch[1]);

    let type = 'other';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('study') || lowerText.includes('read') || lowerText.includes('college') || lowerText.includes('school')) type = 'study';
    if (lowerText.includes('exercise') || lowerText.includes('gym') || lowerText.includes('run') || lowerText.includes('health') || lowerText.includes('workout')) type = 'health';
    if (lowerText.includes('sleep') || lowerText.includes('wake') || lowerText.includes('bed') || lowerText.includes('rest')) type = 'rest';
    if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('meeting')) type = 'work';

    return { title: text.trim(), durationMins, type };
}

function formatTime(hour, minute) {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

// upgraded generateSchedule to take an array of unfinished tasks
function generateSchedule(routineText, unfinishedTasks = []) {
    const parts = routineText.split(/,|\band\b/i).filter(p => p.trim().length > 0);

    const blocks = [];
    let currentHour = 8;
    let currentMinute = 0;

    const wakeUpMatch = routineText.match(/wake(?: up)?(?: at)?\s+(\d+)\s*(am|pm)?/i);
    if (wakeUpMatch) {
        currentHour = parseInt(wakeUpMatch[1]);
        if (wakeUpMatch[2] && wakeUpMatch[2].toLowerCase() === 'pm' && currentHour < 12) {
            currentHour += 12;
        }
    }

    let consecutiveWorkMins = 0;

    // Insert any high priority unfinished tasks at the start if applicable
    const highPriorityTasks = unfinishedTasks.filter(t => t.priority === 'High');
    highPriorityTasks.forEach(task => {
        const startStr = formatTime(currentHour, currentMinute);
        const taskDuration = 30; // 30 mins for a task block

        currentHour += Math.floor((currentMinute + taskDuration) / 60);
        currentMinute = (currentMinute + taskDuration) % 60;

        blocks.push({
            title: `[Suggested Task] ${task.title}`,
            startTime: startStr,
            endTime: formatTime(currentHour, currentMinute),
            type: task.category.toLowerCase() === 'study' ? 'study' : 'other'
        });
        consecutiveWorkMins += taskDuration;
    });

    for (const part of parts) {
        const parsed = parseTimeBlock(part);

        // Auto-insert rest break if working/studying for more than 2 hours
        if ((parsed.type === 'study' || parsed.type === 'work') && consecutiveWorkMins >= 120) {
            const restDuration = 15;
            const breakStart = formatTime(currentHour, currentMinute);
            currentHour += Math.floor((currentMinute + restDuration) / 60);
            currentMinute = (currentMinute + restDuration) % 60;

            blocks.push({
                title: '☕ AI Suggested Break',
                startTime: breakStart,
                endTime: formatTime(currentHour, currentMinute),
                type: 'rest'
            });
            consecutiveWorkMins = 0; // reset
        }

        const startStr = formatTime(currentHour, currentMinute);

        currentHour += Math.floor((currentMinute + parsed.durationMins) / 60);
        currentMinute = (currentMinute + parsed.durationMins) % 60;

        blocks.push({
            title: parsed.title,
            startTime: startStr,
            endTime: formatTime(currentHour, currentMinute),
            type: parsed.type
        });

        if (parsed.type === 'study' || parsed.type === 'work') {
            consecutiveWorkMins += parsed.durationMins;
        } else {
            consecutiveWorkMins = 0;
        }
    }

    // Ensure a sleep suggestion if not explicitly stated
    if (!blocks.some(b => b.type === 'rest' && b.title.toLowerCase().includes('sleep'))) {
        const startStr = formatTime(currentHour, currentMinute);
        // arbitrary sleep 8 hrs 
        const endHour = (currentHour + 8) % 24;
        blocks.push({
            title: '🌙 AI Suggested Sleep',
            startTime: startStr,
            endTime: formatTime(endHour, currentMinute),
            type: 'rest'
        });
    }

    return blocks;
}

module.exports = { generateSchedule };

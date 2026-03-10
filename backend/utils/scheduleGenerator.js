// A basic heuristic-based natural language parser for schedules.

function parseTimeBlock(text) {
    let durationMins = 60; // default 1 hour

    // Check for explicit "X to Y" or "X till Y" or "X - Y"
    // Handles formats like "4.30 to 5", "6.30 ... till 7.45", "5 to 5.30"
    const rangeMatch = text.match(/([\d\.]+)\s*(?:to|-|till|until|or|and)?\s*([\d\.]+)?/i);
    const tillMatch = text.match(/till\s*([\d\.]+)/i);

    if (tillMatch && tillMatch[1]) {
        let endRaw = parseFloat(tillMatch[1]);
        if (endRaw < 12) endRaw += 12; // assume "till 7.45" means PM usually, though context varies
        durationMins = Math.round(endRaw * 60); // We handle absolute durations later if needed, but for now we'll just track length
        // A smarter way for 'till' is just finding the time difference from currentHour, 
        // but since parseTimeBlock doesn't know currentHour, we just return a signature
        return { title: text.trim(), durationMins: 60, type: getCategory(text), tillTime: endRaw };
    }

    if (rangeMatch && rangeMatch[1] && rangeMatch[2]) {
        let startRaw = parseFloat(rangeMatch[1]);
        let endRaw = parseFloat(rangeMatch[2]);

        // Handle common shorthand like "4.30 to 5" -> 4:30 to 5:00
        if (startRaw < 12 && endRaw < startRaw) endRaw += 12;

        // converts 4.30 to 4.5 decimal hours
        let startH = Math.floor(startRaw);
        let startM = (startRaw - startH) * 100;
        let endH = Math.floor(endRaw);
        let endM = (endRaw - endH) * 100;

        let startTotalMins = (startH * 60) + startM;
        let endTotalMins = (endH * 60) + endM;

        durationMins = endTotalMins - startTotalMins;
    } else {
        const hourMatch = text.match(/(\d+)\s*(hour|hr)s?/i);
        if (hourMatch) durationMins = parseInt(hourMatch[1]) * 60;

        const minMatch = text.match(/(\d+)\s*(minute|min)s?/i);
        if (minMatch) durationMins = parseInt(minMatch[1]);
    }

    return { title: text.trim(), durationMins: Math.max(15, durationMins), type: getCategory(text) };
}

function getCategory(text) {
    let type = 'other';
    const lowerText = text.toLowerCase();
    if (lowerText.includes('study') || lowerText.includes('read') || lowerText.includes('college') || lowerText.includes('school')) type = 'study';
    if (lowerText.includes('exercise') || lowerText.includes('gym') || lowerText.includes('run') || lowerText.includes('health') || lowerText.includes('workout') || lowerText.includes('walk')) type = 'health';
    if (lowerText.includes('sleep') || lowerText.includes('wake') || lowerText.includes('bed') || lowerText.includes('rest') || lowerText.includes('dinner') || lowerText.includes('lunch') || lowerText.includes('wash') || lowerText.includes('groom')) type = 'rest';
    if (lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('meeting') || lowerText.includes('laptop')) type = 'work';
    return type;
}

function formatTime(hour, minute) {
    let cleanH = Math.floor(hour) % 24;
    let cleanM = Math.floor(minute);
    return `${cleanH.toString().padStart(2, '0')}:${cleanM.toString().padStart(2, '0')}`;
}

// upgraded generateSchedule to take an array of unfinished tasks
function generateSchedule(routineText, unfinishedTasks = []) {
    // Split by newlines first, then commas, to handle listing formats
    const rawParts = routineText.split(/\n|,|\band\b/i);
    const parts = rawParts.filter(p => p.trim().length > 0);

    const blocks = [];
    let currentHour = 8;
    let currentMinute = 0;

    // Try to extract start time from the very first line if numbers are present like "4.30 to 5 mobile"
    const firstLineTimeMatch = parts[0] && parts[0].match(/^([\d\.]+)/);
    if (firstLineTimeMatch) {
        const rawTime = parseFloat(firstLineTimeMatch[1]);
        currentHour = Math.floor(rawTime);
        currentMinute = Math.round((rawTime - currentHour) * 100);
        if (currentMinute >= 60) currentMinute = 0; // fallback
    } else {
        const wakeUpMatch = routineText.match(/wake(?: up)?(?: at)?\s+(\d+)\s*(am|pm)?/i);
        if (wakeUpMatch) {
            currentHour = parseInt(wakeUpMatch[1]);
            if (wakeUpMatch[2] && wakeUpMatch[2].toLowerCase() === 'pm' && currentHour < 12) {
                currentHour += 12;
            }
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

        let actualDuration = parsed.durationMins;

        if (parsed.tillTime) {
            let endH = Math.floor(parsed.tillTime);
            let endM = (parsed.tillTime - endH) * 100;
            let targetTotalMins = (endH * 60) + endM;
            let currentTotalMins = (currentHour * 60) + currentMinute;
            actualDuration = targetTotalMins - currentTotalMins;
            if (actualDuration < 0) actualDuration = 60; // fallback if math goes wack
        }

        currentHour += Math.floor((currentMinute + actualDuration) / 60);
        currentMinute = (currentMinute + actualDuration) % 60;

        blocks.push({
            title: parsed.title,
            startTime: startStr,
            endTime: formatTime(currentHour, currentMinute),
            type: parsed.type
        });

        if (parsed.type === 'study' || parsed.type === 'work') {
            consecutiveWorkMins += actualDuration;
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

// Load data from localStorage
const data = JSON.parse(localStorage.getItem('activityTrackerData')) || {
	activities: [],
	logs: [],
	availableColors: [],
};

let currentActivity = null;
let activityToDelete = null;
let activityToEdit = null;
let selectedColor = null;
let draggedElement = null;
let draggedActivityId = null;

// Save data to localStorage
function saveData() {
	localStorage.setItem('activityTrackerData', JSON.stringify(data));
}

// Close modal when clicking outside
document.addEventListener('click', function (e) {
	if (e.target.classList.contains('modal')) {
		e.target.classList.remove('active');
	}
});

const colors = [
	// Existing bright colors
	'#FF6B6B', // אדום אלמוגי
	'#FF5252', // אדום בוהק
	'#FF4757', // אדום תותי
	'#FF6348', // אדום עגבנייה
	'#FF3838', // אדום עז
	'#FF006E', // ורוד פוקסיה
	'#FF1493', // ורוד עמוק
	'#FF69B4', // ורוד חם
	'#FF85C0', // ורוד מתוק
	'#C44569', // ורוד רוז
	'#A855F7', // סגול חי
	'#9333EA', // סגול עמוק
	'#8B5CF6', // סגול בוהק
	'#7C3AED', // סגול רויאל
	'#6366F1', // אינדיגו חי
	'#4F46E5', // אינדיגו עמוק
	'#3B82F6', // כחול שמיים
	'#2563EB', // כחול בוהק
	'#1D4ED8', // כחול מלכותי
	'#0EA5E9', // כחול בריכה
	'#06B6D4', // ציאן בוהק
	'#14B8A6', // טורקיז חי
	'#10B981', // ירוק אזמרגד
	'#22C55E', // ירוק בוהק
	'#16A34A', // ירוק עשב
	'#84CC16', // ליים חי
	'#A3E635', // ליים בהיר
	'#EAB308', // צהוב זהב
	'#F59E0B', // כתום עמבר
	'#FB923C', // כתום בוהק
	'#F97316', // כתום עז
	'#EF4444', // אדום עגול

	// New darker and richer colors
	'#8B4513', // חום שוקולד
	'#A0522D', // חום אוכף
	'#D2691E', // חום כהה
	'#CD853F', // חום פרו
	'#DEB887', // חום בורליווד
	'#F4A460', // חום חולי
	'#DAA520', // חום זהוב
	'#B8860B', // חום זהב כהה

	// Dark grays and blacks
	'#2F2F2F', // שחור פחם
	'#36454F', // שחור פלדה
	'#4A4A4A', // אפור כהה
	'#5D5D5D', // אפור כהה בינוני
	'#708090', // אפור אלית
	'#696969', // אפור עמום
	'#1C1C1C', // שחור כמעט
	'#191970', // כחול לילה

	// Deep jewel tones
	'#800080', // סגול עמוק
	'#4B0082', // אינדיגו עמוק
	'#8B008B', // מגנטה כהה
	'#9400D3', // סגול כהה
	'#006400', // ירוק יער
	'#228B22', // ירוק יער בהיר
	'#008B8B', // ציאן כהה
	'#B22222', // אדום לבנה
	'#DC143C', // ארגמן
	'#8B0000', // אדום כהה
	'#800000', // מרון
	'#2F4F4F', // אפור כהה אלית

	// Navy and deep blues
	'#000080', // כחול נייבי
	'#483D8B', // כחול אלית כהה
	'#2E4BC6', // כחול רויאל כהה
	'#1E3A8A', // כחול עמוק
	'#1E40AF', // כחול כהה
	'#064E3B', // ירוק אזמרגד כהה

	// Earth tones
	'#654321', // חום אדמה
	'#8B7355', // חום חאקי
	'#9C661F', // חום ערמון
	'#8FBC8F', // ירוק זית כהה
	'#556B2F', // ירוק זית
	'#6B8E23', // ירוק זית צהוב
	'#2F4F2F', // ירוק יער כהה
	'#8B7D6B', // חום חול כהה
];

// Initialize available colors if empty
if (!data.availableColors || data.availableColors.length === 0) {
	data.availableColors = [...colors];
	// Shuffle the colors randomly
	data.availableColors.sort(() => Math.random() - 0.5);
}

function getRandomColor() {
	// If all colors used, reset and shuffle the pool
	if (data.availableColors.length === 0) {
		data.availableColors = [...colors];
		data.availableColors.sort(() => Math.random() - 0.5);
	}

	// Take the first color from the shuffled array
	const selectedColor = data.availableColors.shift();

	// Save the updated available colors
	saveData();

	return selectedColor;
}

function showPage(page) {
	document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
	document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

	if (page === 'home') {
		document.getElementById('homePage').classList.add('active');
		document.querySelector('.nav-btn:nth-child(2)').classList.add('active');
		renderActivities();
	} else if (page === 'report') {
		document.getElementById('reportPage').classList.add('active');
		document.querySelector('.nav-btn:nth-child(3)').classList.add('active');
		renderReport();
	}
}

function openCreateActivityModal() {
	document.getElementById('createActivityModal').classList.add('active');
	document.getElementById('newActivityName').value = '';
	document.getElementById('newActivityHasPrice').checked = false;
}

function closeModal(modalId) {
	document.getElementById(modalId).classList.remove('active');
}

function createActivity() {
	const name = document.getElementById('newActivityName').value.trim();
	const hasPrice = document.getElementById('newActivityHasPrice').checked;

	if (!name) {
		alert('נא להזין שם פעילות');
		return;
	}

	const activity = {
		id: Date.now(),
		name: name,
		hasPrice: hasPrice,
		color: getRandomColor(),
	};

	// Add new activity at the beginning of the array
	data.activities.unshift(activity);
	saveData();
	closeModal('createActivityModal');
	renderActivities();
}

function renderActivities() {
	const grid = document.getElementById('activitiesGrid');
	grid.innerHTML = '';

	// Add all activities (newest first due to unshift)
	data.activities.forEach(activity => {
		const logs = data.logs.filter(l => l.activityId === activity.id);
		const lastLog = logs.length > 0 ? logs[logs.length - 1] : null;
		const totalSpent = logs.reduce((sum, log) => sum + (log.price || 0), 0);

		// Calculate weekly averages
		const weeklyStats = calculateWeeklyAverages(activity.id);

		const card = document.createElement('div');
		card.className = 'activity-card';
		card.style.background = activity.color;
		card.draggable = true;
		card.dataset.activityId = activity.id;

		let infoHTML = '';
		if (activity.hasPrice) {
			infoHTML += `<div class="activity-info">סה"כ: ₪${formatPrice(totalSpent)}</div>`;
		}
		if (lastLog) {
			infoHTML += `<div class="last-activity">${formatDate(lastLog.timestamp)}</div>`;
		}

		// Add weekly averages
		let weeklyStatsHTML = '';
		if (activity.hasPrice && weeklyStats.avgSpentPerWeek > 0) {
			weeklyStatsHTML += `<div class="weekly-avg-spent">₪${formatPrice(weeklyStats.avgSpentPerWeek)}/ש</div>`;
		}
		if (weeklyStats.avgLogsPerWeek > 0) {
			weeklyStatsHTML += `<div class="weekly-avg-logs">${weeklyStats.avgLogsPerWeek.toFixed(1)}/ש</div>`;
		}

		card.innerHTML = `
                             <button class="edit-btn" onclick="event.stopPropagation(); editActivity(${activity.id})">✒️</button>
                             <button class="delete-btn" onclick="event.stopPropagation(); deleteActivity(${activity.id})">×</button>
                             ${weeklyStatsHTML}
                             <div class="activity-name">${activity.name}</div>
                             ${infoHTML}
                         `;

		card.removeEventListener('dragstart', handleDragStart);
		card.removeEventListener('dragend', handleDragEnd);
		card.removeEventListener('dragover', handleDragOver);
		card.removeEventListener('drop', handleDrop);
		card.removeEventListener('dragleave', handleDragLeave);

		card.addEventListener('dragstart', handleDragStart);
		card.addEventListener('dragend', handleDragEnd);
		card.addEventListener('dragover', handleDragOver);
		card.addEventListener('drop', handleDrop);
		card.addEventListener('dragleave', handleDragLeave);

		// Prevent click from firing when dragging
		let isDragging = false;
		card.addEventListener('mousedown', () => {
			isDragging = false;
		});
		card.addEventListener('mousemove', () => {
			isDragging = true;
		});
		card.addEventListener('mouseup', e => {
			if (!isDragging && !e.target.closest('.edit-btn') && !e.target.closest('.delete-btn')) {
				openLogActivityModal(activity);
			}
		});

		grid.appendChild(card);
	});
}

function calculateWeeklyAverages(activityId) {
	const logs = data.logs.filter(l => l.activityId === activityId);

	if (logs.length === 0) {
		return { avgLogsPerWeek: 0, avgSpentPerWeek: 0 };
	}

	// Sort logs by date
	const sortedLogs = logs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

	const firstLogDate = new Date(sortedLogs[0].timestamp);
	const lastLogDate = new Date(sortedLogs[sortedLogs.length - 1].timestamp);

	// Calculate the number of weeks between first and last log
	const timeDiffMs = lastLogDate - firstLogDate;
	const daysDiff = timeDiffMs / (1000 * 60 * 60 * 24);
	const weeksDiff = Math.max(daysDiff / 7, 1); // At least 1 week to avoid division by zero

	const totalSpent = logs.reduce((sum, log) => sum + (log.price || 0), 0);
	const totalLogs = logs.length;

	return {
		avgLogsPerWeek: totalLogs / weeksDiff,
		avgSpentPerWeek: totalSpent / weeksDiff,
	};
}

let logToEdit = null;
let logToDelete = null;

function openLogActivityModal(activity) {
	currentActivity = activity;
	document.getElementById('logActivityTitle').textContent = `רישום ${activity.name}`;
	document.getElementById('activityPrice').value = '';

	const priceGroup = document.getElementById('priceGroup');
	priceGroup.style.display = activity.hasPrice ? 'block' : 'none';

	if (activity.hasPrice) {
		const priceInput = document.getElementById('activityPrice');
		priceInput.style.borderColor = '#e0e0e0';
	}

	// Show previous logs
	const logs = data.logs.filter(l => l.activityId === activity.id);
	const previousLogsDiv = document.getElementById('previousLogs');

	if (logs.length > 0) {
		previousLogsDiv.innerHTML = '<div class="previous-logs-title">רישומים קודמים:</div>';
		logs.slice(-5)
			.reverse()
			.forEach((log, i) => {
				const logItem = document.createElement('div');
				logItem.className = 'log-item';
				logItem.textContent = `${formatDate(log.timestamp)}${log.price ? ` - ₪${formatPrice(log.price)}` : ''}`;
				previousLogsDiv.appendChild(logItem);

				//set the last log's price in the text field
				if (log.price > 0 && i === 0) {
					document.getElementById('activityPrice').value = log.price ? log.price.toFixed(0) : '';
				}

				// Create button container
				const buttonContainer = document.createElement('div');
				buttonContainer.style.float = 'left';
				buttonContainer.style.display = 'flex';
				buttonContainer.style.gap = '10px';

				// Add edit log button
				const editLogButton = document.createElement('button');
				editLogButton.textContent = '✏️';
				editLogButton.style.border = 'none';
				editLogButton.style.cursor = 'pointer';
				editLogButton.style.background = 'transparent';
				editLogButton.style.fontSize = '14px';
				editLogButton.onclick = e => {
					e.stopPropagation();
					editLog(log);
				};

				// Add delete log button
				const deleteLogButton = document.createElement('button');
				deleteLogButton.textContent = '❌';
				deleteLogButton.style.border = 'none';
				deleteLogButton.style.cursor = 'pointer';
				deleteLogButton.style.background = 'transparent';
				deleteLogButton.style.fontSize = '14px';
				deleteLogButton.onclick = e => {
					e.stopPropagation();
					confirmDeleteLog(log);
				};

				buttonContainer.appendChild(editLogButton);
				buttonContainer.appendChild(deleteLogButton);
				logItem.appendChild(buttonContainer);
			});
	} else {
		previousLogsDiv.innerHTML = '<div class="previous-logs-title">אין רישומים קודמים</div>';
	}

	document.getElementById('logActivityModal').classList.add('active');
}

function confirmDeleteLog(log) {
	logToDelete = log;

	// Show confirmation in the same modal
	const previousLogsDiv = document.getElementById('previousLogs');
	const originalContent = previousLogsDiv.innerHTML;

	previousLogsDiv.innerHTML = `
        <div class="delete-log-confirmation">
            <div class="delete-log-icon">🗑️</div>
            <div class="delete-log-title">למחוק רישום?</div>
            <div class="delete-log-details">
                <div class="log-details-card">
                    <span class="log-date">${formatDate(log.timestamp)}</span>
                    ${log.price ? `<span class="log-price">₪${formatPrice(log.price)}</span>` : ''}
                </div>
            </div>
            <div class="delete-log-message">פעולה זו לא ניתנת לביטול</div>
            <div class="delete-log-buttons">
                <button class="btn btn-danger" onclick="executeDeleteLog()">מחק רישום</button>
                <button class="btn btn-secondary" onclick="cancelDeleteLog('${encodeURIComponent(originalContent)}')">ביטול</button>
            </div>
        </div>
    `;
}

function cancelDeleteLog(originalContent) {
	logToDelete = null;
	const previousLogsDiv = document.getElementById('previousLogs');
	previousLogsDiv.innerHTML = decodeURIComponent(originalContent);

	// Re-attach event listeners to the restored buttons
	if (currentActivity) {
		openLogActivityModal(currentActivity);
	}
}

function executeDeleteLog() {
	if (!logToDelete) return;

	data.logs = data.logs.filter(l => l.id !== logToDelete.id);
	saveData();
	logToDelete = null;

	if (currentActivity) {
		openLogActivityModal(currentActivity); // Refresh the modal
	}
	renderActivities(); // Refresh the activities to update totals
}

function editLog(log) {
	logToEdit = log;
	openEditLogModal(log);
}

function openEditLogModal(log) {
	// Close the log activity modal first
	closeModal('logActivityModal');

	// Set the edit log modal content
	document.getElementById('editLogTitle').textContent = `עריכת רישום - ${currentActivity.name}`;

	// Set current values
	const logDate = new Date(log.timestamp);
	const dateString = logDate.toISOString().slice(0, 16); // Format for datetime-local input
	document.getElementById('editLogDate').value = dateString;

	const editPriceGroup = document.getElementById('editPriceGroup');
	if (currentActivity.hasPrice) {
		editPriceGroup.style.display = 'block';
		document.getElementById('editLogPrice').value = log.price || '';
	} else {
		editPriceGroup.style.display = 'none';
	}

	document.getElementById('editLogModal').classList.add('active');
}

function saveLogEdit() {
	if (!logToEdit) return;

	const newDate = document.getElementById('editLogDate').value;
	const newPrice = currentActivity.hasPrice ? parseFloat(document.getElementById('editLogPrice').value) || 0 : null;

	if (!newDate) {
		alert('נא לבחור תאריך וזמן');
		return;
	}

	if (currentActivity.hasPrice && newPrice <= 0) {
		alert('נא להזין מחיר חוקי');
		return;
	}

	// Update the log
	logToEdit.timestamp = new Date(newDate).toISOString();
	if (currentActivity.hasPrice) {
		logToEdit.price = newPrice;
	}

	saveData();
	closeModal('editLogModal');
	logToEdit = null;

	// Refresh the views
	renderActivities();
	if (currentActivity) {
		openLogActivityModal(currentActivity);
	}
}

function deleteLog(logId) {
	data.logs = data.logs.filter(l => l.id !== logId);
	saveData();
	if (currentActivity) {
		openLogActivityModal(currentActivity); // Refresh the modal
	}
	renderActivities(); // Refresh the activities to update totals
}

function logActivity() {
	if (!currentActivity) return;

	const price = currentActivity.hasPrice ? parseFloat(document.getElementById('activityPrice').value) || 0 : null;
	const priceInput = document.getElementById('activityPrice');
	if (currentActivity.hasPrice && price <= 0) {
		priceInput.style.borderColor = 'red';
		return;
	} else {
		priceInput.style.borderColor = '#e0e0e0';
	}

	const log = {
		id: Date.now(),
		activityId: currentActivity.id,
		timestamp: new Date().toISOString(),
		price: price,
	};

	data.logs.push(log);
	saveData();
	closeModal('logActivityModal');
	renderActivities();
}

function deleteActivity(activityId) {
	activityToDelete = activityId;
	document.getElementById('deleteConfirmModal').classList.add('active');
}

function editActivity(activityId) {
	const activity = data.activities.find(a => a.id === activityId);
	if (!activity) return;

	activityToEdit = activity;
	selectedColor = activity.color;

	document.getElementById('editActivityName').value = activity.name;

	// Render color picker
	const colorPicker = document.getElementById('colorPicker');
	colorPicker.innerHTML = '';

	colors.forEach(color => {
		const colorOption = document.createElement('div');
		colorOption.className = 'color-option';
		colorOption.style.background = color;
		if (color === selectedColor) {
			colorOption.classList.add('selected');
		}
		colorOption.onclick = () => selectColor(color);
		colorPicker.appendChild(colorOption);
	});

	document.getElementById('editActivityModal').classList.add('active');
}

function selectColor(color) {
	selectedColor = color;
	document.querySelectorAll('.color-option').forEach(option => {
		option.classList.remove('selected');
		if (option.style.background === color) {
			option.classList.add('selected');
		}
	});
}

function saveActivityEdit() {
	if (!activityToEdit) return;

	const newName = document.getElementById('editActivityName').value.trim();

	if (!newName) {
		alert('נא להזין שם פעילות');
		return;
	}

	activityToEdit.name = newName;
	activityToEdit.color = selectedColor;

	saveData();
	closeModal('editActivityModal');
	activityToEdit = null;
	selectedColor = null;
	renderActivities();
}

// Drag and drop functions
function handleDragStart(e) {
	draggedElement = e.currentTarget;
	draggedActivityId = parseInt(e.currentTarget.dataset.activityId);
	e.currentTarget.classList.add('dragging');
	e.dataTransfer.effectAllowed = 'move';
}

function handleDragEnd(e) {
	e.currentTarget.classList.remove('dragging');
	document.querySelectorAll('.activity-card').forEach(card => {
		card.classList.remove('drag-over');
	});
}

function handleDragOver(e) {
	if (e.preventDefault) {
		e.preventDefault();
	}
	e.dataTransfer.dropEffect = 'move';

	const targetCard = e.currentTarget;
	if (targetCard !== draggedElement && targetCard.dataset.activityId) {
		targetCard.classList.add('drag-over');
	}

	return false;
}

function handleDragLeave(e) {
	e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
	if (e.stopPropagation) {
		e.stopPropagation();
	}

	e.currentTarget.classList.remove('drag-over');

	const targetActivityId = parseInt(e.currentTarget.dataset.activityId);

	if (draggedActivityId !== targetActivityId) {
		// Find the indices
		const draggedIndex = data.activities.findIndex(a => a.id === draggedActivityId);
		const targetIndex = data.activities.findIndex(a => a.id === targetActivityId);

		if (draggedIndex !== -1 && targetIndex !== -1) {
			// Swap the activities
			const temp = data.activities[draggedIndex];
			data.activities[draggedIndex] = data.activities[targetIndex];
			data.activities[targetIndex] = temp;

			saveData();
			renderActivities();
		}
	}

	return false;
}

function confirmDelete() {
	if (!activityToDelete) return;

	// Remove activity
	data.activities = data.activities.filter(a => a.id !== activityToDelete);

	// Remove all logs for this activity
	data.logs = data.logs.filter(l => l.activityId !== activityToDelete);

	saveData();
	closeModal('deleteConfirmModal');
	activityToDelete = null;
	renderActivities();
}

function formatDate(timestamp) {
	const now = new Date();
	const date = new Date(timestamp);
	const diffMs = now - date;
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMs / 3600000);
	const diffDays = Math.floor(diffMs / 86400000);
	const diffWeeks = Math.floor(diffDays / 7);
	const diffMonths = Math.floor(diffDays / 30);

	if (diffMins < 1) return 'כרגע';
	if (diffMins < 60) return `לפני ${diffMins} דקות`;
	if (diffHours < 24) return `לפני ${diffHours} שעות`;
	if (diffDays === 1) return 'לפני יום';
	if (diffDays < 7) return `לפני ${diffDays} ימים`;
	if (diffWeeks === 1) return 'לפני שבוע';
	if (diffDays < 30) return `לפני ${diffWeeks} שבועות`;
	if (diffMonths === 1) return 'לפני חודש';
	if (diffMonths < 12) return `לפני ${diffMonths} חודשים`;

	const day = String(date.getDate()).padStart(2, '0');
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const year = String(date.getFullYear()).slice(-2);
	return `${day}/${month}/${year}`;
}

function formatPrice(price) {
	return new Intl.NumberFormat('he-IL').format(Math.round(price));
}

let showingAllHistory = false;

function renderReport() {
	const historyList = document.getElementById('historyList');
	historyList.innerHTML = '';

	// Add toggle button
	const toggleSection = document.createElement('div');
	toggleSection.className = 'history-toggle-section';
	toggleSection.innerHTML = `
        <button class="btn ${showingAllHistory ? 'btn-secondary' : 'btn-primary'}" onclick="toggleHistoryView()">
            ${showingAllHistory ? 'הצג חודש אחרון' : 'הצג כל ההיסטוריה'}
        </button>
    `;
	historyList.appendChild(toggleSection);

	// Calculate date range
	const now = new Date();
	let startDate = null;

	if (!showingAllHistory) {
		// Last month calculation
		startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
	}

	// Filter logs by date range
	const filteredLogs = startDate ? data.logs.filter(log => new Date(log.timestamp) >= startDate) : data.logs;

	// Calculate totals
	const totalLogsCount = filteredLogs.length;
	const totalExpenses = filteredLogs.reduce((sum, log) => sum + (log.price || 0), 0);

	// Add summary section
	const summarySection = document.createElement('div');
	summarySection.className = 'summary-section';

	let periodText = showingAllHistory ? 'כל הזמנים' : 'חודש אחרון';
	let summaryHTML = `<div class="summary-title">${periodText}</div>`;
	summaryHTML += `<div class="summary-stats">`;
	summaryHTML += `<div class="summary-stat">סה"כ רישומים: ${totalLogsCount}</div>`;
	if (totalExpenses > 0) {
		summaryHTML += `<div class="summary-stat">סה"כ הוצאות: ₪${formatPrice(totalExpenses)}</div>`;
	}
	summaryHTML += `</div>`;

	summarySection.innerHTML = summaryHTML;
	historyList.appendChild(summarySection);

	// Group filtered logs by activity
	const activitiesWithLogs = {};
	filteredLogs.forEach(log => {
		if (!activitiesWithLogs[log.activityId]) {
			activitiesWithLogs[log.activityId] = [];
		}
		activitiesWithLogs[log.activityId].push(log);
	});

	// Get activities that have logs in the filtered period
	const relevantActivities = data.activities.filter(activity => activitiesWithLogs[activity.id] && activitiesWithLogs[activity.id].length > 0);

	// Order activities by most recent log
	relevantActivities.sort((a, b) => {
		const aLogs = activitiesWithLogs[a.id];
		const bLogs = activitiesWithLogs[b.id];
		const aLastLog = aLogs.length > 0 ? new Date(aLogs[aLogs.length - 1].timestamp) : 0;
		const bLastLog = bLogs.length > 0 ? new Date(bLogs[bLogs.length - 1].timestamp) : 0;
		return bLastLog - aLastLog;
	});

	relevantActivities.forEach(activity => {
		const logs = activitiesWithLogs[activity.id];
		if (!logs || logs.length === 0) return;

		const section = document.createElement('div');
		section.className = 'activity-section';

		const activityTotal = logs.reduce((sum, log) => sum + (log.price || 0), 0);

		let titleHTML = `<div class="activity-section-title">${activity.name}`;
		titleHTML += ` (${logs.length})`;
		if (activity.hasPrice && activityTotal > 0) {
			titleHTML += ` - סה"כ: ₪${formatPrice(activityTotal)}`;
		}
		titleHTML += `</div>`;

		section.innerHTML = titleHTML;

		// Order logs by newest first
		logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(log => {
			const item = document.createElement('div');
			item.className = 'history-item';
			item.innerHTML = `
                <span class="history-date">${formatDate(log.timestamp)}</span>
                ${log.price ? `<span class="history-price">₪${formatPrice(log.price)}</span>` : ''}
            `;
			section.appendChild(item);
		});

		historyList.appendChild(section);
	});

	if (totalLogsCount === 0) {
		const noDataSection = document.createElement('div');
		noDataSection.className = 'activity-section';
		noDataSection.innerHTML = `<div class="activity-section-title">אין פעילויות שנרשמו ${showingAllHistory ? 'עדיין' : 'בחודש האחרון'}</div>`;
		historyList.appendChild(noDataSection);
	}
}

function toggleHistoryView() {
	showingAllHistory = !showingAllHistory;
	renderReport();
}

// Initialize
renderActivities();

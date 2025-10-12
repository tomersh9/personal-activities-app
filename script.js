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
		document.querySelector('.nav-btn:nth-child(1)').classList.add('active');
		renderActivities();
	} else if (page === 'report') {
		document.getElementById('reportPage').classList.add('active');
		document.querySelector('.nav-btn:nth-child(2)').classList.add('active');
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

	// Add the "+" button first
	const addButton = document.createElement('div');
	addButton.className = 'activity-card add-activity-card';
	addButton.onclick = openCreateActivityModal;
	addButton.textContent = '+';
	grid.appendChild(addButton);

	// Then add all activities (newest first due to unshift)
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
			infoHTML += `<div class="activity-info">סה"כ: ₪${totalSpent.toFixed(0)}</div>`;
		}
		if (lastLog) {
			infoHTML += `<div class="last-activity">${formatDate(lastLog.timestamp)}</div>`;
		}

		// Add weekly averages
		let weeklyStatsHTML = '';
		if (activity.hasPrice && weeklyStats.avgSpentPerWeek > 0) {
			weeklyStatsHTML += `<div class="weekly-avg-spent">₪${weeklyStats.avgSpentPerWeek.toFixed(0)}/ש</div>`;
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

		// Drag and drop event listeners
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
				logItem.textContent = `${formatDate(log.timestamp)}${log.price ? ` - ₪${log.price.toFixed(0)}` : ''}`;
				previousLogsDiv.appendChild(logItem);

				//set the last log's price in the text field
				if (log.price > 0 && i === 0) {
					document.getElementById('activityPrice').value = log.price ? log.price.toFixed(0) : '';
				}

				//add delete log button to the side
				const deleteLogButton = document.createElement('button');
				deleteLogButton.textContent = '❌';
				deleteLogButton.style.float = 'left';
				deleteLogButton.style.border = 'none';
				deleteLogButton.style.cursor = 'pointer';
				//position it to the left side
				deleteLogButton.onclick = e => {
					e.stopPropagation();
					deleteLog(log.id);
				};
				logItem.appendChild(deleteLogButton);
			});
	} else {
		previousLogsDiv.innerHTML = '<div class="previous-logs-title">אין רישומים קודמים</div>';
	}

	document.getElementById('logActivityModal').classList.add('active');
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

function renderReport() {
	const historyList = document.getElementById('historyList');
	historyList.innerHTML = '';

	const totalSection = document.createElement('div');
	historyList.appendChild(totalSection);

	let grandTotal = 0;

	data.activities.forEach(activity => {
		const logs = data.logs.filter(l => l.activityId === activity.id);
		if (logs.length === 0) return;

		const section = document.createElement('div');
		section.className = 'activity-section';

		const activityTotal = logs.reduce((sum, log) => sum + (log.price || 0), 0);
		grandTotal += activityTotal;

		let titleHTML = `<div class="activity-section-title">${activity.name}`;
		if (activity.hasPrice) {
			titleHTML += ` - סה"כ: ₪${activityTotal.toFixed(0)}`;
		}
		titleHTML += `</div>`;

		section.innerHTML = titleHTML;

		logs.forEach(log => {
			const item = document.createElement('div');
			item.className = 'history-item';
			item.innerHTML = `
			                    <span class="history-date">${formatDate(log.timestamp)}</span>
			                     ${log.price ? `<span class="history-price">₪${log.price.toFixed(0)}</span>` : ''}
			                 `;
			section.appendChild(item);
		});

		historyList.appendChild(section);
	});

	if (grandTotal > 0) {
		totalSection.className = 'total-section';
		totalSection.textContent = `סה"כ הוצאות: ₪${grandTotal.toFixed(0)}`;
	}

	if (data.logs.length === 0) {
		historyList.innerHTML = '<div class="activity-section"><div class="activity-section-title">אין פעילויות שנרשמו עדיין</div></div>';
	}
}

// Initialize
renderActivities();

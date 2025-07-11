// 影子計劃 - 完整功能單頁應用
const html = `
<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>影子計劃 - 智慧學習系統</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        shadow: {
                            50: '#f8fafc',
                            100: '#f1f5f9',
                            200: '#e2e8f0',
                            300: '#cbd5e1',
                            400: '#94a3b8',
                            500: '#64748b',
                            600: '#475569',
                            700: '#334155',
                            800: '#1e293b',
                            900: '#0f172a'
                        },
                        focus: {
                            50: '#eff6ff',
                            100: '#dbeafe',
                            200: '#bfdbfe',
                            300: '#93c5fd',
                            400: '#60a5fa',
                            500: '#3b82f6',
                            600: '#2563eb',
                            700: '#1d4ed8',
                            800: '#1e40af',
                            900: '#1e3a8a'
                        },
                        success: {
                            50: '#f0fdf4',
                            100: '#dcfce7',
                            200: '#bbf7d0',
                            300: '#86efac',
                            400: '#4ade80',
                            500: '#22c55e',
                            600: '#16a34a',
                            700: '#15803d',
                            800: '#166534',
                            900: '#14532d'
                        },
                        warning: {
                            50: '#fffbeb',
                            100: '#fef3c7',
                            200: '#fde68a',
                            300: '#fcd34d',
                            400: '#fbbf24',
                            500: '#f59e0b',
                            600: '#d97706',
                            700: '#b45309',
                            800: '#92400e',
                            900: '#78350f'
                        },
                        danger: {
                            50: '#fef2f2',
                            100: '#fee2e2',
                            200: '#fecaca',
                            300: '#fca5a5',
                            400: '#f87171',
                            500: '#ef4444',
                            600: '#dc2626',
                            700: '#b91c1c',
                            800: '#991b1b',
                            900: '#7f1d1d'
                        }
                    }
                }
            }
        }
    </script>
    <style>
        .glass-effect {
            background: rgba(255, 255, 255, 0.7);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .card-shadow {
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        .btn-primary {
            @apply bg-focus-500 text-white px-4 py-2 rounded-lg hover:bg-focus-600 transition-colors;
        }
        .btn-secondary {
            @apply bg-shadow-100 text-shadow-700 px-4 py-2 rounded-lg hover:bg-shadow-200 transition-colors;
        }
        .timer-display {
            font-family: 'Courier New', monospace;
            font-size: 2rem;
            font-weight: bold;
        }
        .achievement-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        }
        .achievement-notification.show {
            transform: translateX(0);
        }
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
    <!-- 成就通知 -->
    <div id="achievementNotification" class="achievement-notification glass-effect rounded-lg p-4 card-shadow max-w-sm">
        <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-warning-500 rounded-full flex items-center justify-center">
                <span class="text-white font-bold">🏆</span>
            </div>
            <div>
                <div class="font-semibold text-shadow-900" id="achievementTitle">恭喜獲得成就！</div>
                <div class="text-sm text-shadow-600" id="achievementDesc">第一個任務完成</div>
            </div>
        </div>
    </div>

    <div class="max-w-6xl mx-auto px-4 py-8">
        <!-- Header -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold text-shadow-900 mb-2">影子計劃</h1>
            <p class="text-shadow-600 text-lg">專注學習，成就未來</p>
        </div>

        <!-- Stats -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div class="glass-effect rounded-xl p-6 card-shadow">
                <div class="text-2xl font-bold text-shadow-900" id="pendingCount">0</div>
                <div class="text-shadow-600">待完成任務</div>
            </div>
            <div class="glass-effect rounded-xl p-6 card-shadow">
                <div class="text-2xl font-bold text-focus-600" id="inProgressCount">0</div>
                <div class="text-shadow-600">進行中</div>
            </div>
            <div class="glass-effect rounded-xl p-6 card-shadow">
                <div class="text-2xl font-bold text-success-600" id="completedCount">0</div>
                <div class="text-shadow-600">已完成</div>
            </div>
            <div class="glass-effect rounded-xl p-6 card-shadow">
                <div class="text-2xl font-bold text-danger-600" id="dueCardsCount">0</div>
                <div class="text-shadow-600">待複習</div>
            </div>
        </div>

        <!-- 專注計時器 -->
        <div class="glass-effect rounded-xl p-6 card-shadow mb-8" id="timerSection" style="display: none;">
            <div class="text-center">
                <h2 class="text-2xl font-semibold mb-4 text-shadow-800">專注計時</h2>
                <div class="timer-display text-focus-600 mb-4" id="timerDisplay">25:00</div>
                <div class="text-shadow-600 mb-4" id="currentTaskTitle">選擇任務開始專注</div>
                <div class="flex justify-center gap-4">
                    <button id="startTimer" class="btn-primary">開始專注</button>
                    <button id="pauseTimer" class="btn-secondary">暫停</button>
                    <button id="stopTimer" class="btn-secondary">停止</button>
                </div>
            </div>
        </div>

        <!-- Navigation -->
        <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <button onclick="showAddTaskModal()" class="btn-primary flex items-center gap-2 card-shadow">
                <span>➕</span>
                新增任務
            </button>
            <button onclick="showPage('memory')" class="btn-secondary flex items-center gap-2 card-shadow">
                <span>🧠</span>
                智慧記憶
            </button>
            <button onclick="showPage('library')" class="btn-secondary flex items-center gap-2 card-shadow">
                <span>📚</span>
                教材庫
            </button>
            <button onclick="showPage('stats')" class="btn-secondary flex items-center gap-2 card-shadow">
                <span>📊</span>
                學習統計
            </button>
        </div>

        <!-- 主要內容區 -->
        <div id="mainContent">
            <!-- 任務列表 -->
            <div id="taskList" class="space-y-4">
                <div class="text-center py-12 text-shadow-400">
                    <div class="text-lg mb-4">還沒有任務，開始新增第一個任務吧！</div>
                    <button onclick="showAddTaskModal()" class="btn-primary">新增任務</button>
                </div>
            </div>
        </div>
    </div>

    <!-- 新增任務 Modal -->
    <div id="addTaskModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style="display: none;">
        <div class="glass-effect rounded-xl p-6 w-full max-w-md mx-4">
            <h2 class="text-2xl font-semibold mb-4 text-shadow-800">新增任務</h2>
            <form id="addTaskForm">
                <div class="mb-4">
                    <label class="block text-sm font-medium text-shadow-700 mb-2">任務標題</label>
                    <input type="text" id="taskTitle" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500" required>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-shadow-700 mb-2">任務描述</label>
                    <textarea id="taskDescription" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500" rows="3"></textarea>
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-shadow-700 mb-2">預估時間 (分鐘)</label>
                    <input type="number" id="taskTime" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500" min="1" value="25">
                </div>
                <div class="mb-4">
                    <label class="block text-sm font-medium text-shadow-700 mb-2">重要程度</label>
                    <select id="taskImportance" class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-focus-500">
                        <option value="1">低</option>
                        <option value="2">中</option>
                        <option value="3" selected>高</option>
                        <option value="4">很高</option>
                        <option value="5">極高</option>
                    </select>
                </div>
                <div class="flex gap-4">
                    <button type="submit" class="btn-primary flex-1">新增任務</button>
                    <button type="button" onclick="hideAddTaskModal()" class="btn-secondary flex-1">取消</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // 全局狀態
        let tasks = [];
        let currentTask = null;
        let timerInterval = null;
        let timerSeconds = 25 * 60; // 25 分鐘
        let isTimerRunning = false;

        // 初始化
        document.addEventListener('DOMContentLoaded', async () => {
            await initializeDatabase();
            await loadTasks();
            updateStats();
            setupEventListeners();
        });

        // 事件監聽器
        function setupEventListeners() {
            document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
            document.getElementById('startTimer').addEventListener('click', startTimer);
            document.getElementById('pauseTimer').addEventListener('click', pauseTimer);
            document.getElementById('stopTimer').addEventListener('click', stopTimer);
        }

        // 初始化資料庫
        async function initializeDatabase() {
            try {
                await fetch('/api/init-db');
            } catch (error) {
                console.error('Database initialization failed:', error);
            }
        }

        // 載入任務
        async function loadTasks() {
            try {
                const response = await fetch('/api/tasks');
                tasks = await response.json();
                renderTasks();
            } catch (error) {
                console.error('Failed to load tasks:', error);
            }
        }

        // 渲染任務列表
        function renderTasks() {
            const taskList = document.getElementById('taskList');
            
            if (tasks.length === 0) {
                taskList.innerHTML = \`
                    <div class="text-center py-12 text-shadow-400">
                        <div class="text-lg mb-4">還沒有任務，開始新增第一個任務吧！</div>
                        <button onclick="showAddTaskModal()" class="btn-primary">新增任務</button>
                    </div>
                \`;
                return;
            }

            taskList.innerHTML = tasks.map(task => \`
                <div class="glass-effect rounded-xl p-6 card-shadow">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="text-lg font-semibold text-shadow-800">\${task.title}</h3>
                            <p class="text-shadow-600 text-sm mt-1">\${task.description || ''}</p>
                            <div class="flex items-center gap-4 mt-3">
                                <span class="text-xs bg-focus-100 text-focus-700 px-2 py-1 rounded">
                                    ⏱️ \${formatTime(task.estimated_time)}
                                </span>
                                <span class="text-xs bg-warning-100 text-warning-700 px-2 py-1 rounded">
                                    🔥 \${getImportanceLabel(task.importance)}
                                </span>
                                <span class="text-xs bg-\${getStatusColor(task.status)}-100 text-\${getStatusColor(task.status)}-700 px-2 py-1 rounded">
                                    \${getStatusLabel(task.status)}
                                </span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 ml-4">
                            <button onclick="startFocusSession(\${task.id})" class="btn-primary text-sm">
                                開始專注
                            </button>
                            <button onclick="toggleTaskStatus(\${task.id})" class="btn-secondary text-sm">
                                \${task.status === 'completed' ? '重新開始' : '完成'}
                            </button>
                            <button onclick="deleteTask(\${task.id})" class="text-danger-500 hover:text-danger-700 text-sm">
                                刪除
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // 新增任務
        async function handleAddTask(e) {
            e.preventDefault();
            
            const taskData = {
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                estimated_time: parseInt(document.getElementById('taskTime').value),
                importance: parseInt(document.getElementById('taskImportance').value)
            };

            try {
                const response = await fetch('/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(taskData)
                });

                if (response.ok) {
                    await loadTasks();
                    updateStats();
                    hideAddTaskModal();
                    document.getElementById('addTaskForm').reset();
                    
                    // 第一個任務成就
                    if (tasks.length === 1) {
                        showAchievement('🎯 初出茅廬', '創建了第一個任務！');
                    }
                }
            } catch (error) {
                console.error('Failed to add task:', error);
            }
        }

        // 開始專注會話
        function startFocusSession(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            currentTask = task;
            timerSeconds = task.estimated_time * 60;
            updateTimerDisplay();
            
            document.getElementById('currentTaskTitle').textContent = task.title;
            document.getElementById('timerSection').style.display = 'block';
            
            // 滾動到計時器
            document.getElementById('timerSection').scrollIntoView({ behavior: 'smooth' });
        }

        // 計時器功能
        function startTimer() {
            if (!isTimerRunning) {
                isTimerRunning = true;
                timerInterval = setInterval(() => {
                    timerSeconds--;
                    updateTimerDisplay();
                    
                    if (timerSeconds <= 0) {
                        completeTimer();
                    }
                }, 1000);
            }
        }

        function pauseTimer() {
            if (isTimerRunning) {
                isTimerRunning = false;
                clearInterval(timerInterval);
            }
        }

        function stopTimer() {
            isTimerRunning = false;
            clearInterval(timerInterval);
            if (currentTask) {
                timerSeconds = currentTask.estimated_time * 60;
                updateTimerDisplay();
            }
        }

        function completeTimer() {
            isTimerRunning = false;
            clearInterval(timerInterval);
            
            if (currentTask) {
                // 完成任務
                toggleTaskStatus(currentTask.id);
                showAchievement('⏰ 專注達人', \`完成了 \${currentTask.title} 的專注時間！\`);
            }
            
            document.getElementById('timerSection').style.display = 'none';
            currentTask = null;
        }

        function updateTimerDisplay() {
            const minutes = Math.floor(timerSeconds / 60);
            const seconds = timerSeconds % 60;
            document.getElementById('timerDisplay').textContent = 
                \`\${minutes.toString().padStart(2, '0')}:\${seconds.toString().padStart(2, '0')}\`;
        }

        // 切換任務狀態
        async function toggleTaskStatus(taskId) {
            const task = tasks.find(t => t.id === taskId);
            if (!task) return;

            const newStatus = task.status === 'completed' ? 'pending' : 'completed';
            
            try {
                const response = await fetch(\`/api/tasks/\${taskId}\`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ ...task, status: newStatus })
                });

                if (response.ok) {
                    await loadTasks();
                    updateStats();
                    
                    if (newStatus === 'completed') {
                        showAchievement('✅ 任務完成', \`\${task.title} 已完成！\`);
                    }
                }
            } catch (error) {
                console.error('Failed to update task:', error);
            }
        }

        // 刪除任務
        async function deleteTask(taskId) {
            if (!confirm('確定要刪除這個任務嗎？')) return;

            try {
                const response = await fetch(\`/api/tasks/\${taskId}\`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    await loadTasks();
                    updateStats();
                }
            } catch (error) {
                console.error('Failed to delete task:', error);
            }
        }

        // 更新統計數據
        function updateStats() {
            const pending = tasks.filter(t => t.status === 'pending').length;
            const inProgress = tasks.filter(t => t.status === 'in_progress').length;
            const completed = tasks.filter(t => t.status === 'completed').length;

            document.getElementById('pendingCount').textContent = pending;
            document.getElementById('inProgressCount').textContent = inProgress;
            document.getElementById('completedCount').textContent = completed;
        }

        // 顯示成就通知
        function showAchievement(title, description) {
            document.getElementById('achievementTitle').textContent = title;
            document.getElementById('achievementDesc').textContent = description;
            
            const notification = document.getElementById('achievementNotification');
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 3000);
        }

        // Modal 控制
        function showAddTaskModal() {
            document.getElementById('addTaskModal').style.display = 'flex';
        }

        function hideAddTaskModal() {
            document.getElementById('addTaskModal').style.display = 'none';
        }

        // 頁面切換
        function showPage(page) {
            alert(\`\${page} 頁面功能開發中！\`);
        }

        // 輔助函數
        function formatTime(minutes) {
            if (minutes < 60) return \`\${minutes} 分鐘\`;
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            return remainingMinutes > 0 ? \`\${hours} 小時 \${remainingMinutes} 分鐘\` : \`\${hours} 小時\`;
        }

        function getImportanceLabel(importance) {
            const labels = ['', '低', '中', '高', '很高', '極高'];
            return labels[importance] || '未知';
        }

        function getStatusLabel(status) {
            const labels = {
                'pending': '待完成',
                'in_progress': '進行中',
                'completed': '已完成'
            };
            return labels[status] || status;
        }

        function getStatusColor(status) {
            const colors = {
                'pending': 'warning',
                'in_progress': 'focus',
                'completed': 'success'
            };
            return colors[status] || 'gray';
        }
    </script>
</body>
</html>
`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
// 簡單的靜態首頁，用於測試部署
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
                        }
                    }
                }
            }
        }
    </script>
</head>
<body class="min-h-screen bg-gradient-to-br from-shadow-50 to-shadow-100">
    <div class="max-w-4xl mx-auto px-4 py-8">
        <div class="text-center mb-8">
            <h1 class="text-4xl font-bold text-shadow-900 mb-2">影子計劃</h1>
            <p class="text-shadow-600 text-lg">智慧學習系統 - 測試部署成功！</p>
        </div>
        
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-6">
            <h2 class="text-2xl font-semibold mb-4 text-shadow-800">系統功能</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-focus-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-focus-800">核心專注</h3>
                    <p class="text-sm text-focus-600">任務管理與專注計時</p>
                </div>
                <div class="bg-green-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-green-800">智慧記憶</h3>
                    <p class="text-sm text-green-600">SRS 間隔重複學習</p>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg">
                    <h3 class="font-semibold text-purple-800">成就系統</h3>
                    <p class="text-sm text-purple-600">個人化學習統計</p>
                </div>
            </div>
        </div>
        
        <div class="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <h2 class="text-2xl font-semibold mb-4 text-shadow-800">API 測試</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button onclick="testAPI('/api/init-db')" class="bg-focus-500 text-white px-4 py-2 rounded-lg hover:bg-focus-600">
                    初始化資料庫
                </button>
                <button onclick="testAPI('/api/tasks')" class="bg-focus-500 text-white px-4 py-2 rounded-lg hover:bg-focus-600">
                    測試任務 API
                </button>
                <button onclick="testAPI('/api/material-library')" class="bg-focus-500 text-white px-4 py-2 rounded-lg hover:bg-focus-600">
                    測試教材庫
                </button>
                <button onclick="testAPI('/api/achievements')" class="bg-focus-500 text-white px-4 py-2 rounded-lg hover:bg-focus-600">
                    測試成就系統
                </button>
            </div>
            <div id="apiResult" class="mt-4 p-4 bg-gray-100 rounded-lg min-h-[100px]">
                <p class="text-gray-500">點擊上方按鈕測試 API</p>
            </div>
        </div>
    </div>
    
    <script>
        async function testAPI(endpoint) {
            const resultDiv = document.getElementById('apiResult');
            resultDiv.innerHTML = '<p class="text-blue-600">測試中...</p>';
            
            try {
                const response = await fetch(endpoint);
                const data = await response.json();
                resultDiv.innerHTML = \`
                    <p class="text-green-600 font-semibold">✅ 成功！</p>
                    <p class="text-sm text-gray-600">端點: \${endpoint}</p>
                    <pre class="text-xs bg-white p-2 rounded mt-2 overflow-auto">\${JSON.stringify(data, null, 2)}</pre>
                \`;
            } catch (error) {
                resultDiv.innerHTML = \`
                    <p class="text-red-600 font-semibold">❌ 錯誤！</p>
                    <p class="text-sm text-gray-600">端點: \${endpoint}</p>
                    <p class="text-sm text-red-500">\${error.message}</p>
                \`;
            }
        }
    </script>
</body>
</html>
`;

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
};
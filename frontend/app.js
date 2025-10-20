// DOM要素の取得
const currentValueEl = document.getElementById("current-value");
const lastUpdateEl = document.getElementById("last-update");
const thresholdInput = document.getElementById("threshold");
const dataPointsInput = document.getElementById("data-points");
const updateIntervalInput = document.getElementById("update-interval");
const alertMessageEl = document.getElementById("alert-message");

// 変数の初期化
let chart; // グラフのインスタンス
let dataHistory = []; // データ履歴
let updateInterval; // 更新間隔のタイマー
let lastAlertTime = 0; // 最後にアラートを送信した時間
let lastValue = null; // 最後に取得した値
const ALERT_COOLDOWN = 60000; // アラートのクールダウン時間（1分）

// 設定の初期化
let currentThreshold = parseFloat(thresholdInput.value);
let currentDataPoints = parseInt(dataPointsInput.value);
let currentUpdateInterval = parseInt(updateIntervalInput.value);

// イベントリスナーの設定
thresholdInput.addEventListener('change', function() {
    currentThreshold = parseFloat(this.value);
    checkThreshold(lastValue);
});

dataPointsInput.addEventListener('change', function() {
    currentDataPoints = parseInt(this.value);
    updateChart();
});

updateIntervalInput.addEventListener('change', function() {
    currentUpdateInterval = parseInt(this.value);
    restartUpdateInterval();
});

// データ取得関数
async function fetchData() {
    try {
        const response = await fetch("http://localhost:8081/value");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        const value = json.value;
        const timestamp = new Date();

        // 値が変更された場合のみ更新
        if (lastValue !== value) {
            // 値表示
            currentValueEl.textContent = value;
            lastUpdateEl.textContent = timestamp.toLocaleTimeString();
            lastValue = value;

            // データ履歴に追加
            dataHistory.push({ 
                time: timestamp.toLocaleTimeString(), 
                value: value,
                timestamp: timestamp.getTime()
            });

            // データポイント数を制限
            if (dataHistory.length > currentDataPoints) {
                dataHistory = dataHistory.slice(-currentDataPoints);
            }

            // グラフ更新
            updateChart();

            // 基準値チェック
            checkThreshold(value);

            // 値が変更されたことをコンソールに表示
            console.log(`新しい水温が検出されました: ${value}°C (時刻: ${timestamp.toLocaleTimeString()})`);
        }

    } catch (error) {
        console.error("データ取得に失敗:", error);
        alertMessageEl.textContent = "❌ サーバーに接続できません";
    }
}

// 基準値チェック関数
function checkThreshold(value) {
    if (value > currentThreshold) {
        alertMessageEl.textContent = "⚠️ 基準値オーバー！";
        alertMessageEl.style.display = "block";
        
        // メール通知（クールダウン期間を考慮）
        const now = Date.now();
        if (now - lastAlertTime > ALERT_COOLDOWN) {
            sendEmailAlert(value);
            lastAlertTime = now;
        }
    } else {
        alertMessageEl.style.display = "none";
    }
}

// メール通知関数
async function sendEmailAlert(value) {
    try {
        const response = await fetch("http://localhost:8081/alert", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: value,
                threshold: currentThreshold,
                timestamp: new Date().toISOString().split('.')[0] + 'Z'
            })
        });

        if (response.ok) {
            console.log("アラートメールを送信しました");
        } else {
            console.error("メール送信に失敗しました");
        }
    } catch (error) {
        console.error("メール送信エラー:", error);
    }
}

// グラフ更新関数
function updateChart() {
    const labels = dataHistory.map(item => item.time);
    const values = dataHistory.map(item => item.value);

    if (!chart) {
        const ctx = document.getElementById("chart").getContext("2d");
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: '水温の推移',
                    data: values,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            font: {
                                size: 14
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            maxRotation: 45
                        }
                    }
                },
                animation: {
                    duration: 750,
                    easing: 'easeInOutQuart'
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    } else {
        chart.data.labels = labels;
        chart.data.datasets[0].data = values;
        chart.update('active');
    }
}

// 更新間隔の再設定
function restartUpdateInterval() {
    if (updateInterval) {
        clearInterval(updateInterval);
    }
    updateInterval = setInterval(fetchData, currentUpdateInterval * 1000);
}

// 初期化
function init() {
    // 初回データ取得
    fetchData();
    
    // 定期更新の開始
    restartUpdateInterval();
    
    // 初期グラフの作成
    updateChart();
    
    console.log("水温計システムが起動しました");
    console.log(`更新間隔: ${currentUpdateInterval}秒`);
    console.log(`グラフデータ数: ${currentDataPoints}個`);
    console.log(`基準値: ${currentThreshold}°C`);
}

// アプリケーション開始
document.addEventListener('DOMContentLoaded', init);

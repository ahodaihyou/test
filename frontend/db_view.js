const historyTableBodyEl = document.getElementById("history-table-body");
const statusEl = document.getElementById("status");
const limitInput = document.getElementById("limit");
const intervalInput = document.getElementById("interval");
const refreshButton = document.getElementById("refresh");

let refreshTimer;

function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = isError ? "status error" : "status ok";
}

function renderEmpty() {
    historyTableBodyEl.innerHTML = `
        <tr>
            <td class="table-empty" colspan="2">データがありません</td>
        </tr>
    `;
}

function renderRows(items) {
    const rows = items.map(item => {
        const timestamp = new Date(item.timestamp);
        const displayTime = Number.isNaN(timestamp.getTime())
            ? item.timestamp
            : timestamp.toLocaleString();
        return `
            <tr>
                <td>${displayTime}</td>
                <td>${item.value}</td>
            </tr>
        `;
    }).join("");

    historyTableBodyEl.innerHTML = rows || `
        <tr>
            <td class="table-empty" colspan="2">データがありません</td>
        </tr>
    `;
}

async function fetchHistory() {
    const limit = Math.max(1, Math.min(200, parseInt(limitInput.value, 10) || 20));
    limitInput.value = limit;

    try {
        setStatus("取得中...", false);
        const response = await fetch(`http://localhost:8081/history?limit=${limit}`);
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }

        const json = await response.json();
        const history = Array.isArray(json.history) ? json.history : [];
        renderRows(history);
        setStatus(`取得完了 (${history.length}件)`, false);
    } catch (error) {
        renderEmpty();
        setStatus("取得に失敗しました", true);
        console.error("履歴取得エラー:", error);
    }
}

function restartAutoRefresh() {
    if (refreshTimer) {
        clearInterval(refreshTimer);
    }
    const intervalSec = Math.max(1, Math.min(120, parseInt(intervalInput.value, 10) || 10));
    intervalInput.value = intervalSec;
    refreshTimer = setInterval(fetchHistory, intervalSec * 1000);
}

refreshButton.addEventListener("click", fetchHistory);
intervalInput.addEventListener("change", restartAutoRefresh);
limitInput.addEventListener("change", fetchHistory);

document.addEventListener("DOMContentLoaded", () => {
    fetchHistory();
    restartAutoRefresh();
});

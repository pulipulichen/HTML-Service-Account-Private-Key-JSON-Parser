document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const rawJsonInput = document.getElementById('rawJsonInput');
    const processBtn = document.getElementById('processBtn');
    const resultKey = document.getElementById('resultKey');
    const copyBtn = document.getElementById('copyBtn');
    const statusMsg = document.getElementById('statusMsg');
    const loadExampleBtn = document.getElementById('loadExampleBtn');

    // --- 核心邏輯：解析與提取 ---
    function extractAndDisplay(jsonString) {
        try {
            const data = JSON.parse(jsonString);

            // 檢查是否存在 private_key
            if (data && data.private_key) {
                resultKey.value = data.private_key;
                showStatus('成功提取 Private Key！', 'text-green-600');
                copyBtn.disabled = false;
            } else if (data && typeof data === 'object') {
                // 如果沒找到，嘗試在深層尋找 (選擇性功能)
                const found = findKeyDeep(data, 'private_key');
                if (found) {
                    resultKey.value = found;
                    showStatus('成功從深層結構中提取 Private Key！', 'text-green-600');
                    copyBtn.disabled = false;
                } else {
                    throw new Error('找不到 "private_key" 欄位');
                }
            } else {
                throw new Error('無效的 JSON 結構');
            }
        } catch (err) {
            resultKey.value = '';
            copyBtn.disabled = true;
            showStatus('解析錯誤: ' + err.message, 'text-red-600');
        }
    }

    // 遞迴尋找 key (處理巢狀 JSON)
    function findKeyDeep(obj, targetKey) {
        if (Object.prototype.hasOwnProperty.call(obj, targetKey)) return obj[targetKey];
        for (let key in obj) {
            if (typeof obj[key] === 'object' && obj[key] !== null) {
                const found = findKeyDeep(obj[key], targetKey);
                if (found) return found;
            }
        }
        return null;
    }

    function showStatus(msg, colorClass) {
        statusMsg.textContent = msg;
        statusMsg.className = `mt-3 text-sm ${colorClass}`;
        statusMsg.classList.remove('hidden');
    }

    // --- 事件監聽 ---

    // 1. 檔案瀏覽
    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                rawJsonInput.value = content;
                extractAndDisplay(content);
            };
            reader.readAsText(file);
        }
    });

    // 2. 拖曳上傳
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    dropZone.addEventListener('dragenter', () => dropZone.classList.add('drag-over'));
    dropZone.addEventListener('dragover', () => dropZone.classList.add('drag-over'));
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', (e) => {
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target.result;
                rawJsonInput.value = content;
                extractAndDisplay(content);
            };
            reader.readAsText(file);
        }
    });

    // 3. 貼上按鈕處理
    processBtn.addEventListener('click', () => {
        const content = rawJsonInput.value.trim();
        if (content) {
            extractAndDisplay(content);
        } else {
            showStatus('請先輸入 JSON 內容', 'text-amber-600');
        }
    });

    // 4. 載入範例按鈕
    loadExampleBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('./demo/static-forest-123456-example.json');
            if (!response.ok) throw new Error('無法載入範例檔案');
            const data = await response.text();
            rawJsonInput.value = data;
            extractAndDisplay(data);
        } catch (err) {
            showStatus('無法載入範例: ' + err.message, 'text-red-600');
        }
    });

    // 5. 複製功能
    copyBtn.addEventListener('click', () => {
        if (!resultKey.value) return;

        resultKey.select();
        resultKey.setSelectionRange(0, 99999); // 手機端支援

        try {
            // 根據指令使用 execCommand('copy')
            const successful = document.execCommand('copy');
            if (successful) {
                const originalText = copyBtn.innerHTML;
                copyBtn.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>已複製！</span>
                `;
                copyBtn.classList.replace('text-blue-600', 'text-green-600');

                setTimeout(() => {
                    copyBtn.innerHTML = originalText;
                    copyBtn.classList.replace('text-green-600', 'text-blue-600');
                }, 2000);
            }
        } catch (err) {
            showStatus('無法複製，請手動全選複製', 'text-red-600');
        }
    });
});

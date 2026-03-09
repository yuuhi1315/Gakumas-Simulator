document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabButtons = document.querySelectorAll('.tab-button');
    const probRadios = document.querySelectorAll('input[name="probPreset"]');
    const customProbWrapper = document.querySelector('.custom-prob');
    const probInput = document.getElementById('probInput');
    const setCountPreset = document.getElementById('setCountPreset');
    const customSetWrapper = document.querySelector('.custom-set');
    const setCountInput = document.getElementById('setCountInput');
    const customGachaWrapper = document.querySelector('.custom-gacha');
    const tryCountGroup = document.getElementById('tryCountGroup');
    const tryCountInput = document.getElementById('tryCountInput');
    const gachaCountRadios = document.querySelectorAll('input[name="gachaCountPreset"]');

    const targetHitGroup = document.getElementById('targetHitGroup');
    // ↓動的に生成されるため、ここではquerySelectorAllしても初期状態のものしか取れない
    // let targetHitRadios = document.querySelectorAll('input[name="targetHitPreset"]'); 
    const customTargetHitWrapper = document.querySelector('.custom-target-hit');
    const targetHitInput = document.getElementById('targetHitInput');
    const usePityCheckbox = document.getElementById('usePityCheckbox');
    const pitySettings = document.getElementById('pitySettings');
    const pityRadios = document.querySelectorAll('input[name="pityPreset"]');
    const customPityWrapper = document.querySelector('.custom-pity');
    const pityInput = document.getElementById('pityInput');

    const pricingGroup = document.getElementById('pricingGroup');
    const usePricingCheckbox = document.getElementById('usePricingCheckbox');
    const pricingSettings = document.getElementById('pricingSettings');
    const jewelRateRadios = document.querySelectorAll('input[name="jewelRatePreset"]');

    const errorMessage = document.getElementById('errorMessage');
    const executeButton = document.getElementById('executeButton');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultSection = document.getElementById('resultSection');
    const conditionSummary = document.getElementById('conditionSummary');
    const tableHeader = document.getElementById('tableHeader');
    const tableBody = document.getElementById('tableBody');

    const copyBtn = document.getElementById('copyBtn');
    const csvBtn = document.getElementById('csvBtn');
    const shareBtn = document.getElementById('shareBtn');
    const supplementaryText = document.getElementById('supplementaryText');

    let currentMode = 'hit-count';
    let lastResultData = null; // for CSV and Copy
    let lastProbPreset = null; // for CSV and Copy

    const modeDescription = document.getElementById('modeDescription');

    // UI Toggles
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMode = btn.dataset.mode;

            if (currentMode === 'hit-count') {
                tryCountGroup.style.display = 'block';
                targetHitGroup.style.display = 'none';
                pricingGroup.style.display = 'none';
                if (modeDescription) modeDescription.innerHTML = '任意の回数ガシャを回したとき、<br>何回当たるか実際に試行します。';
            } else {
                tryCountGroup.style.display = 'none';
                targetHitGroup.style.display = 'block';
                pricingGroup.style.display = 'block';
                if (modeDescription) modeDescription.innerHTML = '任意の回数当たるには、<br>何%の確率で何回で済むか実際に試行します。';
            }
            errorMessage.textContent = '';
            resultSection.style.display = 'none';
        });
    });

    const updateTargetHitOptions = (probType) => {
        let optionsHTML = '';
        if (probType === '1.00') {
            optionsHTML = `
                <label><input type="radio" name="targetHitPreset" value="1" checked> 1回(0凸)</label>
                <label><input type="radio" name="targetHitPreset" value="2"> 2回(1凸)</label>
                <label><input type="radio" name="targetHitPreset" value="3"> 3回(2凸)</label>
                <label><input type="radio" name="targetHitPreset" value="4"> 4回(3凸)</label>
                <label><input type="radio" name="targetHitPreset" value="5"> 5回(4凸)</label>
                <label><input type="radio" name="targetHitPreset" value="custom"> 任意の回数</label>
            `;
        } else {
            optionsHTML = `
                <label><input type="radio" name="targetHitPreset" value="1" checked> 1回(0凸)</label>
                <label><input type="radio" name="targetHitPreset" value="2"> 2回(1凸)</label>
                <label><input type="radio" name="targetHitPreset" value="4"> 4回(2凸)</label>
                <label><input type="radio" name="targetHitPreset" value="7"> 7回(3凸)</label>
                <label><input type="radio" name="targetHitPreset" value="11"> 11回(4凸)</label>
                <label><input type="radio" name="targetHitPreset" value="custom"> 任意の回数</label>
            `;
        }
        const targetHitPresetContainer = document.getElementById('targetHitPreset');
        targetHitPresetContainer.innerHTML = optionsHTML;
        customTargetHitWrapper.style.display = 'none';
        targetHitInput.value = '';

        // リスナーの再アタッチ
        const newTargetHitRadios = targetHitPresetContainer.querySelectorAll('input[name="targetHitPreset"]');
        newTargetHitRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    customTargetHitWrapper.style.display = 'flex';
                } else {
                    customTargetHitWrapper.style.display = 'none';
                }
            });
        });
    };

    probRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customProbWrapper.style.display = 'flex';
            } else {
                customProbWrapper.style.display = 'none';
            }
            updateTargetHitOptions(e.target.value);
        });
    });

    const setCountRadios = document.querySelectorAll('input[name="setCountPreset"]');
    setCountRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customSetWrapper.style.display = 'flex';
            } else {
                customSetWrapper.style.display = 'none';
            }
        });
    });

    gachaCountRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customGachaWrapper.style.display = 'flex';
            } else {
                customGachaWrapper.style.display = 'none';
            }
        });
    });

    usePityCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            pitySettings.style.display = 'block';
        } else {
            pitySettings.style.display = 'none';
        }
    });

    usePricingCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            pricingSettings.style.display = 'block';
        } else {
            pricingSettings.style.display = 'none';
        }
    });

    // targetHitRadiosはupdateTargetHitOptionsで毎回生成されるため、
    // ここで初期化時に一度だけ実行するのではなく、document全体のチェンジイベントで拾うのが確実
    document.addEventListener('change', (e) => {
        if (e.target && e.target.name === 'targetHitPreset') {
            if (e.target.value === 'custom') {
                customTargetHitWrapper.style.display = 'flex';
            } else {
                customTargetHitWrapper.style.display = 'none';
            }
        }
    });

    pityRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'custom') {
                customPityWrapper.style.display = 'flex';
            } else {
                customPityWrapper.style.display = 'none';
            }
        });
    });

    // Load URL Params
    const loadParams = () => {
        const params = new URLSearchParams(window.location.search);
        if (params.has('mode')) {
            const mode = params.get('mode');
            const tab = document.querySelector(`.tab-button[data-mode="${mode}"]`);
            if (tab) tab.click();
        }
        if (params.has('p')) {
            const pVal = params.get('p');
            let found = false;
            probRadios.forEach(radio => {
                if (radio.value === pVal) {
                    radio.checked = true;
                    found = true;
                }
            });
            if (!found) {
                document.querySelector('input[name="probPreset"][value="custom"]').checked = true;
                customProbWrapper.style.display = 'flex';
                probInput.value = pVal;
            }
        }
        if (params.has('s')) {
            const sVal = params.get('s');
            let found = false;
            document.querySelectorAll('input[name="setCountPreset"]').forEach(radio => {
                if (radio.value === sVal) {
                    radio.checked = true;
                    found = true;
                }
            });
            if (found) {
                customSetWrapper.style.display = 'none';
            } else {
                document.querySelector('input[name="setCountPreset"][value="custom"]').checked = true;
                customSetWrapper.style.display = 'flex';
                setCountInput.value = sVal;
            }
        }
        if (params.has('g')) { // nからgに変更
            const gVal = params.get('g');
            let found = false;
            document.querySelectorAll('input[name="gachaCountPreset"]').forEach(radio => {
                if (radio.value === gVal) {
                    radio.checked = true;
                    found = true;
                }
            });
            if (found) {
                customGachaWrapper.style.display = 'none';
            } else {
                document.querySelector('input[name="gachaCountPreset"][value="custom"]').checked = true;
                customGachaWrapper.style.display = 'flex';
                tryCountInput.value = gVal; // 変数自体はtryCountInputのままにしておく(入力欄自体のID)
            }
        }
        if (params.has('x')) {
            const xVal = params.get('x');
            let found = false;
            document.querySelectorAll('input[name="targetHitPreset"]').forEach(radio => {
                if (radio.value === xVal) {
                    radio.checked = true;
                    found = true;
                }
            });
            if (found) {
                customTargetHitWrapper.style.display = 'none';
            } else {
                document.querySelector('input[name="targetHitPreset"][value="custom"]').checked = true;
                customTargetHitWrapper.style.display = 'flex';
                targetHitInput.value = xVal;
            }
        }
        if (params.has('pity')) {
            usePityCheckbox.checked = true;
            pitySettings.style.display = 'block';
            const pityVal = params.get('pity');
            let found = false;
            pityRadios.forEach(radio => {
                if (radio.value === pityVal) {
                    radio.checked = true;
                    found = true;
                }
            });
            if (!found) {
                document.querySelector('input[name="pityPreset"][value="custom"]').checked = true;
                customPityWrapper.style.display = 'flex';
                pityInput.value = pityVal;
            }
        }
        if (params.has('pricing')) {
            usePricingCheckbox.checked = true;
            pricingSettings.style.display = 'block';
            const rateVal = params.get('rate');
            if (rateVal) {
                jewelRateRadios.forEach(radio => {
                    if (radio.value === rateVal) radio.checked = true;
                });
            }
        }
    };
    loadParams();

    // Execution
    executeButton.addEventListener('click', () => {
        errorMessage.textContent = '';

        // Get p
        let pPresetValue = document.querySelector('input[name="probPreset"]:checked').value;
        let pStr = pPresetValue;
        let pDisplay = pStr;
        if (pStr === 'custom') {
            pStr = probInput.value;
            pDisplay = pStr;
        }
        const pVal = parseFloat(pStr);

        // Validate p
        if (isNaN(pVal) || pVal <= 0 || pVal > 100) {
            errorMessage.textContent = '当たり確率は 0 より大きく 100 以下で入力してください。';
            return;
        }
        const p = pVal / 100;

        // Get s
        let sStr = document.querySelector('input[name="setCountPreset"]:checked').value;
        if (sStr === 'custom') {
            sStr = setCountInput.value;
        }
        const s = parseInt(sStr, 10);

        // Validate s
        if (isNaN(s) || s <= 0) {
            errorMessage.textContent = 'セット数は正の整数で入力してください。';
            return;
        }

        let n = null; // internal calculation param
        let x = null;

        if (currentMode === 'hit-count') {
            let nStr = document.querySelector('input[name="gachaCountPreset"]:checked').value;
            if (nStr === 'custom') {
                nStr = tryCountInput.value;
            }
            n = parseInt(nStr, 10);
            if (isNaN(n) || n <= 0) {
                errorMessage.textContent = 'ガシャ回数は正の整数で入力してください。';
                return;
            }
        } else {
            let xStr = document.querySelector('input[name="targetHitPreset"]:checked').value;
            if (xStr === 'custom') {
                xStr = targetHitInput.value;
            }
            x = parseInt(xStr, 10);
            if (isNaN(x) || x <= 0) {
                errorMessage.textContent = '当てたい回数は正の整数で入力してください。';
                return;
            }
        }

        let usePity = usePityCheckbox.checked;
        let pityCount = null;
        if (usePity) {
            let pityStr = document.querySelector('input[name="pityPreset"]:checked').value;
            if (pityStr === 'custom') {
                pityStr = pityInput.value;
            }
            pityCount = parseInt(pityStr, 10);
            if (isNaN(pityCount) || pityCount <= 0) {
                errorMessage.textContent = '天井までの回数は正の整数で入力してください。';
                return;
            }
        }

        let usePricing = usePricingCheckbox.checked && currentMode === 'try-count';
        let jewelRate = 0;
        if (usePricing) {
            const selectedRate = document.querySelector('input[name="jewelRatePreset"]:checked');
            jewelRate = selectedRate ? parseFloat(selectedRate.value) : 1.12643678;
        }

        // Set UI to loading state
        executeButton.disabled = true;
        loadingOverlay.style.display = 'block';
        resultSection.style.display = 'none';

        // Build params for sharing
        let sDisplay = '';
        if (s >= 10000 && s % 10000 === 0) {
            sDisplay = `${s / 10000}万回`;
        } else {
            sDisplay = `${s.toLocaleString()}回`;
        }

        const urlParams = new URLSearchParams();
        urlParams.set('mode', currentMode);
        urlParams.set('p', pDisplay);
        urlParams.set('s', s);
        if (n) urlParams.set('g', n); // param name n->g
        if (x) urlParams.set('x', x);
        if (usePity) urlParams.set('pity', pityCount);
        if (usePricing) {
            urlParams.set('pricing', '1');
            urlParams.set('rate', document.querySelector('input[name="jewelRatePreset"]:checked').value);
        }

        let conditionText = currentMode === 'hit-count'
            ? `当たり確率: ${pDisplay}% | ガシャ回数: ${n}連 | セット数: ${sDisplay}`
            : `当たり確率: ${pDisplay}% | 当てたい回数: ${x}回 | セット数: ${sDisplay}`;
        if (usePity) {
            conditionText += ` | 天井ポイントは全て交換する: ${pityCount}回`;
        }
        if (usePricing) {
            const selectedRateLabel = document.querySelector('input[name="jewelRatePreset"]:checked').parentElement.textContent.trim();
            conditionText += ` | 金額換算あり (${selectedRateLabel})`;
        }

        const startTime = performance.now();

        const workerCode = `
self.addEventListener('message', function(e) {
  const data = e.data;
  const mode = data.mode;
  const p = data.p;
  const s = data.s;
  const usePity = data.usePity;
  const pityCount = data.pityCount;

  try {
    if (mode === 'hit-count') {
      const n = data.n;
      const result = simulateHitCount(p, s, n, usePity, pityCount);
      self.postMessage({ success: true, mode: mode, result: result });
    } else if (mode === 'try-count') {
      const x = data.x;
      const result = simulateTryCount(p, s, x, usePity, pityCount);
      self.postMessage({ success: true, mode: mode, result: result });
    } else {
      throw new Error("不明なモードです。");
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});

function simulateHitCount(p, s, n, usePity, pityCount) {
  const counts = {};
  for (let i = 0; i < s; i++) {
    let hits = 0;
    let pityCounter = 0;
    for (let j = 0; j < n; j++) {
      pityCounter++;
      if (Math.random() < p) {
        hits++;
      }
      if (usePity && pityCounter >= pityCount) {
        hits++;
        pityCounter = 0;
      }
    }
    counts[hits] = (counts[hits] || 0) + 1;
  }
  const resultList = [];
  const keys = Object.keys(counts).map(Number).sort((a, b) => a - b);
  for (const hits of keys) {
    const count = counts[hits];
    const ratio = (count / s) * 100;
    const oneInX = ratio > 0 ? (100 / ratio) : Infinity;
    resultList.push({ hits: hits, count: count, ratio: ratio, oneInX: oneInX });
  }
  return resultList;
}

function simulateTryCount(p, s, x, usePity, pityCount) {
  const tryCounts = new Int32Array(s);
  for (let i = 0; i < s; i++) {
    let hits = 0;
    let tries = 0;
    let pityCounter = 0;
    while (hits < x) {
      tries++;
      pityCounter++;
      if (Math.random() < p) {
        hits++;
      }
      if (usePity && pityCounter >= pityCount) {
        hits++;
        pityCounter = 0;
      }
      if (tries > 1000000) {
         throw new Error("試行回数が100万回を超達したためシミュレーションを中断しました。確率が低すぎる可能性があります。");
      }
    }
    tryCounts[i] = tries;
  }
  tryCounts.sort();
  const percentiles = [];
  const maxPct = usePity ? 100 : 90;
  for (let pct = 10; pct <= maxPct; pct += 10) {
    let tries = 0;
    let exchanges = 0;
    if (pct === 100) {
      tries = x * pityCount;
      exchanges = x;
    } else {
      const index = Math.floor((s - 1) * (pct / 100));
      tries = tryCounts[index];
      exchanges = (usePity && pityCount > 0) ? Math.floor(tries / pityCount) : 0;
    }
    percentiles.push({ probability: pct, tries: tries, exchanges: exchanges });
  }
  return percentiles;
}
`;
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);

        worker.onmessage = (e) => {
            URL.revokeObjectURL(workerUrl);
            const data = e.data;
            executeButton.disabled = false;
            loadingOverlay.style.display = 'none';

            if (data.success) {
                const endTime = performance.now();
                const durationSec = ((endTime - startTime) / 1000).toFixed(1);
                const finalSummaryText = `${conditionText} | 計算時間: ${durationSec}秒`;

                lastResultData = data.result;
                lastProbPreset = pPresetValue;
                // 追加: 金額情報を渡す
                renderResult(data.mode, data.result, finalSummaryText, urlParams.toString(), pPresetValue, usePricing, jewelRate);
            } else {
                errorMessage.textContent = 'エラーが発生しました: ' + data.error;
            }
            worker.terminate();
        };

        worker.onerror = (err) => {
            URL.revokeObjectURL(workerUrl);
            executeButton.disabled = false;
            loadingOverlay.style.display = 'none';
            errorMessage.textContent = 'ワーカーでエラーが発生しました。';
            worker.terminate();
        };

        worker.postMessage({
            mode: currentMode,
            p: p,
            s: s,
            n: n,
            x: x,
            usePity: usePity,
            pityCount: pityCount
        });
    });

    const formatOneInX = (val) => {
        if (val === Infinity) return '-';
        if (val >= 1000) return `${Math.round(val)} 人に1人`;
        return `${val.toFixed(1)} 人に1人`;
    };

    const getTotsuString = (probType, hits) => {
        if (probType === '0.75') {
            if (hits === 1) return '(0凸)';
            if (hits === 2) return '(1凸)';
            if (hits === 4) return '(2凸)';
            if (hits === 7) return '(3凸)';
            if (hits === 11) return '(4凸)';
        } else if (probType === '1.00') {
            if (hits === 1) return '(0凸)';
            if (hits === 2) return '(1凸)';
            if (hits === 3) return '(2凸)';
            if (hits === 4) return '(3凸)';
            if (hits === 5) return '(4凸)';
        }
        return '';
    };

    const generateTableHTML = (mode, result, probPresetValue, usePricing, jewelRate) => {
        let thead = '';
        let tbody = '';
        if (mode === 'hit-count') {
            thead = `<tr><th>当たり回数</th><th>全体に占める割合(%)</th><th>何人に1人か</th></tr>`;
            result.forEach(row => {
                let oneInXStr = formatOneInX(row.oneInX);
                let hitsDisplay = `${row.hits} 回${getTotsuString(probPresetValue, row.hits)}`;
                tbody += `<tr>
          <td>${hitsDisplay}</td>
          <td>${row.ratio.toFixed(2)} %</td>
          <td>${oneInXStr}</td>
        </tr>`;
            });
        } else {
            thead = `<tr><th>確率</th><th>かかるガシャ回数</th><th>天井交換回数</th>`;
            if (usePricing) thead += `<th>金額(円)</th>`;
            thead += `</tr>`;

            result.forEach(row => {
                tbody += `<tr>
          <td>${row.probability} %</td>
          <td>${row.tries.toLocaleString()} 連</td>
          <td>${row.exchanges} 回</td>`;

                if (usePricing) {
                    const price = Math.round(row.tries * 250 / jewelRate);
                    tbody += `<td>${price.toLocaleString()} 円</td>`;
                }
                tbody += `</tr>`;
            });
        }
        return { thead, tbody };
    };

    const renderResult = (mode, result, summaryText, urlQuery, probPresetValue, usePricing, jewelRate) => {
        conditionSummary.textContent = summaryText;

        const { thead, tbody } = generateTableHTML(mode, result, probPresetValue, usePricing, jewelRate);
        tableHeader.innerHTML = thead;
        tableBody.innerHTML = tbody;

        if (mode === 'hit-count') {
            const urlParams = new URLSearchParams(urlQuery);
            const pulls = urlParams.get('g') || 0;
            const usePity = urlParams.has('pity');
            const pityCount = urlParams.get('pity') || 0;
            const exchanges = (usePity && pityCount > 0) ? Math.floor(pulls / pityCount) : 0;
            supplementaryText.textContent = `ガシャ回数${pulls}連、天井交換${exchanges}回のとき`;
            supplementaryText.style.display = 'block';
        } else {
            supplementaryText.style.display = 'none';
        }

        resultSection.style.display = 'block';
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        // Set share URL to current window state without reloading
        const shareUrl = window.location.origin + window.location.pathname + '?' + urlQuery;
        shareBtn.dataset.url = shareUrl;
    };

    // Export & Share Logic
    copyBtn.addEventListener('click', () => {
        if (!lastResultData) return;
        let text = '';
        if (currentMode === 'hit-count') {
            text = '当たり回数\t全体に占める割合(%)\t何人に1人か\n';
            lastResultData.forEach(r => {
                let oneInXStr = formatOneInX(r.oneInX);
                let hitsDisplay = `${r.hits} 回${getTotsuString(lastProbPreset, r.hits)}`;
                text += `${hitsDisplay}\t${r.ratio.toFixed(2)} %\t${oneInXStr}\n`;
            });
        } else {
            const usePricing = usePricingCheckbox.checked;
            const jewelRate = usePricing ? parseFloat(document.querySelector('input[name="jewelRatePreset"]:checked').value) : 0;

            text = '確率\tかかるガシャ回数\t天井交換回数';
            if (usePricing) text += '\t金額(円)';
            text += '\n';

            lastResultData.forEach(r => {
                text += `${r.probability} %\t${r.tries} 連\t${r.exchanges} 回`;
                if (usePricing) {
                    const price = Math.round(r.tries * 250 / jewelRate);
                    text += `\t${price} 円`;
                }
                text += '\n';
            });
        }
        navigator.clipboard.writeText(text).then(() => {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = 'コピー完了';
            setTimeout(() => copyBtn.textContent = originalText, 2000);
        });
    });

    csvBtn.addEventListener('click', () => {
        if (!lastResultData) return;
        let csv = '\uFEFF'; // BOM
        if (currentMode === 'hit-count') {
            csv += '当たり回数,全体に占める割合(%),何人に1人か\n';
            lastResultData.forEach(r => {
                let oneInXStr = formatOneInX(r.oneInX);
                let hitsDisplay = `${r.hits} 回${getTotsuString(lastProbPreset, r.hits)}`;
                csv += `${hitsDisplay},${r.ratio.toFixed(2)} %,${oneInXStr}\n`;
            });
        } else {
            const usePricing = usePricingCheckbox.checked;
            const jewelRate = usePricing ? parseFloat(document.querySelector('input[name="jewelRatePreset"]:checked').value) : 0;

            csv += '確率,かかるガシャ回数,天井交換回数';
            if (usePricing) csv += ',金額(円)';
            csv += '\n';

            lastResultData.forEach(r => {
                csv += `${r.probability} %,${r.tries} 連,${r.exchanges} 回`;
                if (usePricing) {
                    const price = Math.round(r.tries * 250 / jewelRate);
                    csv += `,${price} 円`;
                }
                csv += '\n';
            });
        }

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        link.setAttribute("download", `gacha_sim_result_${dateStr}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    shareBtn.addEventListener('click', () => {
        const url = shareBtn.dataset.url;
        if (url) {
            navigator.clipboard.writeText(url).then(() => {
                const originalText = shareBtn.textContent;
                shareBtn.textContent = 'URLコピー完了';
                window.history.replaceState(null, '', url);
                setTimeout(() => shareBtn.textContent = originalText, 2000);
            });
        }
    });
});

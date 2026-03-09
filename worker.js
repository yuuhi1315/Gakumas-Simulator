self.addEventListener('message', function(e) {
  const data = e.data;
  const mode = data.mode;
  const p = data.p;
  const s = data.s;

  try {
    if (mode === 'hit-count') {
      const n = data.n;
      const result = simulateHitCount(p, s, n);
      self.postMessage({ success: true, mode: mode, result: result });
    } else if (mode === 'try-count') {
      const x = data.x;
      const result = simulateTryCount(p, s, x);
      self.postMessage({ success: true, mode: mode, result: result });
    } else {
      throw new Error("不明なモードです。");
    }
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});

function simulateHitCount(p, s, n) {
  // 記録用: 当たり回数をキー、件数を値にもつハッシュ
  const counts = {};

  for (let i = 0; i < s; i++) {
    let hits = 0;
    // 長いループの際はチャンクで分けることも考えられるが、
    // 今回はWorker上なので一気に回す。
    for (let j = 0; j < n; j++) {
      if (Math.random() < p) {
        hits++;
      }
    }
    counts[hits] = (counts[hits] || 0) + 1;
  }

  // 配列に変換し、当たり回数で昇順ソート
  const resultList = [];
  const keys = Object.keys(counts).map(Number).sort((a, b) => a - b);
  
  for (const hits of keys) {
    const count = counts[hits];
    const ratio = (count / s) * 100;
    resultList.push({
      hits: hits,
      count: count,
      ratio: ratio
    });
  }

  return resultList;
}

function simulateTryCount(p, s, x) {
  // s回の試行が必要なため、高速化のために TypedArray を使用
  const tryCounts = new Int32Array(s);

  for (let i = 0; i < s; i++) {
    let hits = 0;
    let tries = 0;
    
    // x回当たるまで引き続ける
    while (hits < x) {
      tries++;
      if (Math.random() < p) {
        hits++;
      }
      // フリーズ防止のセーフティガード（現実的には引けない確率対策）
      if (tries > 1000000) {
         throw new Error("試行回数が100万回を超達したためシミュレーションを中断しました。確率が低すぎる可能性があります。");
      }
    }
    tryCounts[i] = tries;
  }

  // 昇順にソート（Int32Arrayのsortは数値としてソートされる）
  tryCounts.sort();

  const percentiles = [];
  for (let pct = 10; pct <= 90; pct += 10) {
    // 下位からのパーセンタイル位置を計算
    const index = Math.floor((s - 1) * (pct / 100));
    percentiles.push({
      probability: pct,
      tries: tryCounts[index]
    });
  }

  return percentiles;
}

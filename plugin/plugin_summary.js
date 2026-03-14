// ================================================================
//  plugin_summary.js  — TaskFlowZero 週次レポートプラグイン v2
//
//  機能:
//    - 今週 / 先週 のタスク増減・完了数・進捗率比較
//    - マイルストーン別の遅延アラート
//    - 週次コメント入力・保存（project.weeklyNotes に格納）
//    - 「レポート出力」→ 印刷用ウィンドウ表示
//      Chrome の「PDF として保存」でそのまま PDF 化可能
//    - 印刷レポートにはガントチャート（SVG）を含む
//
//  データ格納先: project.weeklyNotes = [
//    { weekStart: '2026-03-09', text: '...', createdAt, updatedAt }
//  ]
// ================================================================

(function () {
  'use strict';

  // ── グローバルハンドラ名前空間 ──────────────────────────────
  window._SummaryPlugin = window._SummaryPlugin || {};
  var SP = window._SummaryPlugin;

  // ══════════════════════════════════════════════════════════
  // 日付ユーティリティ
  // ══════════════════════════════════════════════════════════
  function toDateStr(d) {
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function localToday() { return toDateStr(new Date()); }
  function addDays(s, n) {
    var d = new Date(s + 'T00:00:00'); d.setDate(d.getDate() + n); return toDateStr(d);
  }
  function diffDays(a, b) {
    return Math.round((new Date(b + 'T00:00:00') - new Date(a + 'T00:00:00')) / 86400000);
  }
  function getWeekBounds(dateStr) {
    var d   = new Date(dateStr + 'T00:00:00');
    var day = d.getDay();
    var mon = new Date(d); mon.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
    return { start: toDateStr(mon), end: addDays(toDateStr(mon), 6) };
  }
  function fmtDate(s) {
    if (!s) return '―';
    var d = new Date(s + 'T00:00:00');
    return (d.getMonth() + 1) + '/' + d.getDate();
  }
  function fmtWeekLabel(ws) { return fmtDate(ws) + '〜' + fmtDate(addDays(ws, 6)) + ' の週'; }
  function esc(s) {
    return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  // ══════════════════════════════════════════════════════════
  // 統計計算
  // ══════════════════════════════════════════════════════════
  function calcStats(project) {
    var today    = localToday();
    var thisWeek = getWeekBounds(today);
    var lastWeek = getWeekBounds(addDays(today, -7));
    var tasks    = project.tasks || [];

    function inRange(ds, r) { return ds && ds >= r.start && ds <= r.end; }

    var total  = tasks.length;
    var done   = tasks.filter(function(t){ return t.status === 'done'; }).length;
    var inprog = tasks.filter(function(t){ return t.status === 'inprogress'; }).length;
    var review = tasks.filter(function(t){ return t.status === 'review'; }).length;
    var todo   = tasks.filter(function(t){ return t.status === 'todo'; }).length;
    var pct    = total > 0 ? Math.round(done / total * 100) : 0;

    var addedThisWeek     = tasks.filter(function(t){ return inRange(t.createdAt, thisWeek); }).length;
    var addedLastWeek     = tasks.filter(function(t){ return inRange(t.createdAt, lastWeek); }).length;
    var completedThisWeek = tasks.filter(function(t){ return inRange(t.completedAt, thisWeek); }).length;
    var completedLastWeek = tasks.filter(function(t){ return inRange(t.completedAt, lastWeek); }).length;

    var doneAsOfLastWeek  = tasks.filter(function(t){ return t.completedAt && t.completedAt <= lastWeek.end; }).length;
    var totalAsOfLastWeek = tasks.filter(function(t){ return !t.createdAt || t.createdAt <= lastWeek.end; }).length;
    var pctLastWeek = totalAsOfLastWeek > 0 ? Math.round(doneAsOfLastWeek / totalAsOfLastWeek * 100) : 0;

    var overdue = tasks.filter(function(t){ return t.status !== 'done' && t.dueDate && t.dueDate < today; }).length;

    var spTotal    = tasks.reduce(function(s,t){ return s+(t.storyPoints||0); }, 0);
    var spThisWeek = tasks.filter(function(t){ return inRange(t.completedAt, thisWeek); }).reduce(function(s,t){ return s+(t.storyPoints||0); }, 0);
    var spLastWeek = tasks.filter(function(t){ return inRange(t.completedAt, lastWeek); }).reduce(function(s,t){ return s+(t.storyPoints||0); }, 0);

    return {
      today, thisWeek, lastWeek,
      total, done, inprog, review, todo, pct,
      pctLastWeek, pctDelta: pct - pctLastWeek,
      addedThisWeek, addedLastWeek,
      completedThisWeek, completedLastWeek,
      overdue, spTotal, spThisWeek, spLastWeek,
    };
  }

  function calcMilestones(project) {
    var today = localToday();
    var tasks = project.tasks || [];
    return (project.milestones || []).map(function(ms) {
      var mt  = tasks.filter(function(t){ return t.milestoneId === ms.id; });
      var tot = mt.length;
      var dn  = mt.filter(function(t){ return t.status === 'done'; }).length;
      var pct = tot > 0 ? Math.round(dn / tot * 100) : 0;
      return {
        id: ms.id, name: ms.name, color: ms.color,
        startDate: ms.startDate, endDate: ms.endDate,
        total: tot, done: dn, pct: pct,
        isOverdue: !!(ms.endDate && ms.endDate < today && pct < 100),
        daysLeft: ms.endDate ? diffDays(today, ms.endDate) : null,
      };
    });
  }

  // ══════════════════════════════════════════════════════════
  // 週次コメント
  // ══════════════════════════════════════════════════════════
  function getCurrentNote(project) {
    var wb = getWeekBounds(localToday());
    return (project.weeklyNotes || []).find(function(n){ return n.weekStart === wb.start; }) || null;
  }

  SP.saveNote = function(pid) {
    var project = TaskFlow.getProject(pid);
    if (!project) return;
    var ta = document.getElementById('sum-note-ta');
    if (!ta) return;
    var wb = getWeekBounds(localToday());
    if (!project.weeklyNotes) project.weeklyNotes = [];
    var ex = project.weeklyNotes.find(function(n){ return n.weekStart === wb.start; });
    if (ex) { ex.text = ta.value; ex.updatedAt = localToday(); }
    else     { project.weeklyNotes.push({ weekStart: wb.start, text: ta.value, createdAt: localToday(), updatedAt: localToday() }); }
    project.weeklyNotes.sort(function(a,b){ return b.weekStart.localeCompare(a.weekStart); });
    if (project.weeklyNotes.length > 52) project.weeklyNotes = project.weeklyNotes.slice(0, 52);
    TaskFlow.autoSave(pid);
    TaskFlow.toast('コメントを保存しました', 'success');
  };

  SP.toggleHistory = function() {
    var el = document.getElementById('sum-note-history');
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
  };

  // ══════════════════════════════════════════════════════════
  // ガントチャート SVG（印刷用）
  // ══════════════════════════════════════════════════════════
  function buildGanttSVG(project, totalWidth) {
    var tasks      = project.tasks || [];
    var milestones = project.milestones || [];
    var today      = localToday();

    var dates = [];
    tasks.forEach(function(t){
      if (t.startDate) dates.push(t.startDate);
      if (t.dueDate)   dates.push(t.dueDate);
    });
    milestones.forEach(function(ms){
      if (ms.startDate) dates.push(ms.startDate);
      if (ms.endDate)   dates.push(ms.endDate);
    });
    if (dates.length === 0) {
      return '<div style="color:#888;font-size:12px;padding:8px">日程データなし（タスクに開始日・期限日を設定してください）</div>';
    }
    dates.sort();
    var gs  = addDays(dates[0], -3);
    var ge  = addDays(dates[dates.length - 1], 7);
    if (diffDays(gs, ge) < 28) ge = addDays(gs, 28);

    var totalDays = diffDays(gs, ge) + 1;
    var LEFT_W    = 190;
    var CHART_W   = totalWidth - LEFT_W;
    var DAY_W     = CHART_W / totalDays;
    var ROW_H     = 26;
    var HEADER_H  = 40;

    var msIdSet = {};
    milestones.forEach(function(m){ msIdSet[m.id] = true; });
    var rows = [];
    milestones.forEach(function(ms) {
      rows.push({ type: 'ms', ms: ms });
      tasks.filter(function(t){ return t.milestoneId === ms.id; }).forEach(function(t){
        rows.push({ type: 'task', task: t, indent: true });
      });
    });
    tasks.filter(function(t){ return !t.milestoneId || !msIdSet[t.milestoneId]; }).forEach(function(t){
      rows.push({ type: 'task', task: t, indent: false });
    });

    var svgH = HEADER_H + rows.length * ROW_H + 20;

    var SC = { todo:'#9ca3af', inprogress:'#3b82f6', review:'#f59e0b', done:'#22c55e' };
    function xOf(s) { return LEFT_W + diffDays(gs, s) * DAY_W; }

    var o = [];
    o.push('<svg xmlns="http://www.w3.org/2000/svg" width="' + totalWidth + '" height="' + svgH + '" font-family="Hiragino Kaku Gothic ProN,Meiryo,sans-serif" font-size="11">');
    o.push('<rect width="' + totalWidth + '" height="' + svgH + '" fill="#fff"/>');

    // 週グリッド
    var cur = gs;
    while (cur <= ge) {
      if (new Date(cur + 'T00:00:00').getDay() === 1) {
        var gx = xOf(cur);
        o.push('<line x1="' + gx + '" y1="' + HEADER_H + '" x2="' + gx + '" y2="' + svgH + '" stroke="#f0f0f0" stroke-width="1"/>');
      }
      cur = addDays(cur, 1);
    }

    // ヘッダー
    var prevM = -1; cur = gs;
    while (cur <= ge) {
      var dd = new Date(cur + 'T00:00:00'), m = dd.getMonth(), dom = dd.getDate();
      var hx = xOf(cur);
      if (m !== prevM) {
        o.push('<rect x="' + hx + '" y="0" width="' + (7*DAY_W) + '" height="' + HEADER_H + '" fill="' + (m%2===0?'#f8fafc':'#f1f5f9') + '"/>');
        o.push('<text x="' + (hx+3) + '" y="14" fill="#1f2937" font-size="11" font-weight="700">' + (m+1) + '月</text>');
        prevM = m;
      }
      if (dd.getDay() === 1) o.push('<text x="' + hx + '" y="30" fill="#6b7280" font-size="9">' + dom + '</text>');
      cur = addDays(cur, 7);
    }
    o.push('<line x1="0" y1="' + HEADER_H + '" x2="' + totalWidth + '" y2="' + HEADER_H + '" stroke="#d1d5db" stroke-width="1"/>');
    o.push('<line x1="' + LEFT_W + '" y1="0" x2="' + LEFT_W + '" y2="' + svgH + '" stroke="#d1d5db" stroke-width="1"/>');

    // 行
    rows.forEach(function(row, i) {
      var ry = HEADER_H + i * ROW_H;
      o.push('<rect x="0" y="' + ry + '" width="' + totalWidth + '" height="' + ROW_H + '" fill="' + (i%2===0?'#fafafa':'#fff') + '"/>');

      if (row.type === 'ms') {
        var ms = row.ms, lbl = ms.name; if (lbl.length > 24) lbl = lbl.slice(0,23)+'…';
        o.push('<text x="6" y="' + (ry+ROW_H*0.7) + '" fill="#1e40af" font-weight="700" font-size="11">◆ ' + esc(lbl) + '</text>');
        if (ms.startDate && ms.endDate) {
          var bx1 = Math.max(xOf(ms.startDate), LEFT_W);
          var bx2 = Math.min(xOf(ms.endDate)+DAY_W, totalWidth);
          var late = ms.endDate < today;
          o.push('<rect x="' + bx1 + '" y="' + (ry+6) + '" width="' + Math.max(bx2-bx1,4) + '" height="' + (ROW_H-12) + '" rx="3" fill="' + (late?'#fecaca':'#bfdbfe') + '" stroke="' + (late?'#ef4444':'#3b82f6') + '" stroke-width="1.5"/>');
        }
      } else {
        var t = row.task, ind = row.indent ? 14 : 6;
        var tlbl = (t.number?'#'+t.number+' ':'')+(t.title||'');
        if (tlbl.length > 22) tlbl = tlbl.slice(0,21)+'…';
        o.push('<text x="' + ind + '" y="' + (ry+ROW_H*0.7) + '" fill="#374151" font-size="10">' + esc(tlbl) + '</text>');
        var col = SC[t.status]||'#9ca3af';
        var sd = t.startDate||t.dueDate, ed = t.dueDate||t.startDate;
        if (sd && ed) {
          var tx1 = Math.max(xOf(sd), LEFT_W);
          var tx2 = Math.min(xOf(ed)+DAY_W, totalWidth);
          o.push('<rect x="' + tx1 + '" y="' + (ry+5) + '" width="' + Math.max(tx2-tx1,6) + '" height="' + (ROW_H-10) + '" rx="3" fill="' + col + '" opacity="0.85"/>');
        }
      }
    });

    // 今日ライン
    if (today >= gs && today <= ge) {
      var tx = xOf(today);
      o.push('<line x1="' + tx + '" y1="' + HEADER_H + '" x2="' + tx + '" y2="' + (svgH-20) + '" stroke="#ef4444" stroke-width="2" stroke-dasharray="4,3"/>');
      o.push('<text x="' + (tx+3) + '" y="' + (HEADER_H+11) + '" fill="#ef4444" font-size="9" font-weight="700">今日</text>');
    }

    // 凡例
    var ly = svgH - 6;
    [['#9ca3af','未着手'],['#3b82f6','進行中'],['#f59e0b','レビュー'],['#22c55e','完了'],['#bfdbfe','マイルストーン']].forEach(function(it,i){
      var lx = LEFT_W + i*100 + 8;
      o.push('<rect x="' + lx + '" y="' + (ly-8) + '" width="10" height="8" rx="2" fill="' + it[0] + '"/>');
      o.push('<text x="' + (lx+13) + '" y="' + ly + '" fill="#6b7280" font-size="9">' + it[1] + '</text>');
    });

    o.push('</svg>');
    return o.join('\n');
  }

  // ══════════════════════════════════════════════════════════
  // 印刷 HTML 生成
  // ══════════════════════════════════════════════════════════
  function buildPrintHTML(project, stats, milestones, currentNote, ganttSVG) {
    var wb   = stats.thisWeek;
    var note = currentNote ? currentNote.text : '（コメントなし）';

    function pDelta(n) {
      if (n > 0) return '<span style="color:#16a34a;font-weight:700">▲' + n + '%</span>';
      if (n < 0) return '<span style="color:#dc2626;font-weight:700">▼' + Math.abs(n) + '%</span>';
      return '<span style="color:#6b7280">±0%</span>';
    }
    function nDelta(n) { return (n > 0 ? '+' : '') + n; }

    var msRows = milestones.map(function(ms) {
      var st  = ms.pct >= 100 ? '✅ 完了' : ms.isOverdue ? '⚠️ 遅延' : ms.daysLeft !== null ? (ms.daysLeft <= 0 ? '期限切れ' : ms.daysLeft + '日後') : '―';
      var stc = ms.pct >= 100 ? '#16a34a' : ms.isOverdue ? '#dc2626' : '#374151';
      return '<tr><td>' + esc(ms.name) + '</td><td style="text-align:center">' + ms.done + '/' + ms.total + '</td>' +
        '<td><div style="background:#e5e7eb;border-radius:3px;height:8px;width:100px;display:inline-block;vertical-align:middle">' +
          '<div style="background:#3b82f6;height:8px;border-radius:3px;width:' + ms.pct + '%"></div></div> ' + ms.pct + '%</td>' +
        '<td style="color:' + stc + '">' + st + '</td></tr>';
    }).join('');

    function wRow(label, tw, lw, unit) {
      var d = tw - lw, col = d > 0 ? '#16a34a' : d < 0 ? '#dc2626' : '#6b7280';
      return '<tr><td>' + label + '</td><td style="text-align:center;font-weight:700">' + tw + unit + '</td>' +
        '<td style="text-align:center">' + lw + unit + '</td>' +
        '<td style="text-align:center;color:' + col + ';font-weight:600">' + nDelta(d) + '</td></tr>';
    }

    return '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<title>週次レポート — ' + esc(project.name) + '</title>' +
    '<style>' +
      'body{font-family:"Hiragino Kaku Gothic ProN","Meiryo",sans-serif;color:#1f2937;margin:0;padding:20px 28px;font-size:13px;line-height:1.6}' +
      'h1{font-size:22px;margin:0 0 2px}.sub{color:#6b7280;font-size:12px;margin-bottom:18px}' +
      'h2{font-size:13px;font-weight:700;border-left:3px solid #3b82f6;padding-left:8px;margin:20px 0 10px;color:#1e3a5f}' +
      '.g4{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px}' +
      '.card{background:#f3f4f6;border-radius:6px;padding:12px 8px;text-align:center}' +
      '.cv{font-size:26px;font-weight:700}.cl{font-size:11px;color:#6b7280;margin-top:2px}' +
      'table{border-collapse:collapse;width:100%;font-size:12px;margin-bottom:12px}' +
      'th{background:#f3f4f6;padding:6px 10px;border:1px solid #e5e7eb;font-weight:600}' +
      'td{padding:6px 10px;border:1px solid #e5e7eb}' +
      '.note{background:#fffbeb;border:1px solid #fde68a;border-radius:6px;padding:14px;white-space:pre-wrap;min-height:60px;font-size:13px}' +
      '.ok{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;padding:10px 14px;color:#16a34a;margin-bottom:12px;font-size:12px}' +
      '.warn{background:#fef2f2;border:1px solid #fecaca;border-radius:6px;padding:10px 14px;color:#dc2626;margin-bottom:12px;font-size:12px}' +
      '.pbar{background:#e5e7eb;border-radius:4px;height:10px;margin:6px 0 4px}' +
      '.pfill{background:#3b82f6;height:10px;border-radius:4px}' +
      '.gantt-wrap{overflow-x:auto;border:1px solid #e5e7eb;border-radius:6px;padding:8px}' +
      '.btn{padding:8px 20px;background:#3b82f6;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600}' +
      '@media print{' +
        '@page{size:A4 landscape;margin:10mm 12mm}' +
        'body{padding:0;font-size:11px}' +
        '.no-print{display:none!important}' +
        'h1{font-size:16px}.cv{font-size:20px}' +
        '.gantt-wrap{border:none;padding:0}' +
      '}' +
    '</style></head><body>' +

    '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px">' +
      '<div><h1>' + esc(project.name) + ' — 週次レポート</h1>' +
      '<div class="sub">対象週: ' + fmtDate(wb.start) + '（月）〜 ' + fmtDate(wb.end) + '（日）&nbsp;|&nbsp;出力日: ' + stats.today + '</div></div>' +
      '<button class="btn no-print" onclick="window.print()">🖨️ 印刷 / PDF保存</button>' +
    '</div>' +

    '<h2>📊 進捗サマリー</h2>' +
    '<div class="g4">' +
      '<div class="card"><div class="cv">' + stats.total + '</div><div class="cl">総タスク</div></div>' +
      '<div class="card"><div class="cv" style="color:#22c55e">' + stats.done + '</div><div class="cl">完了</div></div>' +
      '<div class="card"><div class="cv" style="color:#3b82f6">' + stats.inprog + '</div><div class="cl">進行中</div></div>' +
      '<div class="card"><div class="cv" style="color:' + (stats.overdue>0?'#ef4444':'#22c55e') + '">' + stats.overdue + '</div><div class="cl">期限切れ</div></div>' +
    '</div>' +
    '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px">' +
      '<div style="flex:1"><div class="pbar"><div class="pfill" style="width:' + stats.pct + '%"></div></div></div>' +
      '<div style="font-size:28px;font-weight:700;min-width:56px">' + stats.pct + '%</div>' +
      '<div style="font-size:12px;color:#6b7280">先週比 ' + pDelta(stats.pctDelta) + '</div>' +
    '</div>' +
    (stats.overdue>0
      ? '<div class="warn">⚠️ 期限切れタスクが ' + stats.overdue + ' 件あります</div>'
      : '<div class="ok">✅ 期限切れタスクはありません</div>') +

    '<h2>📅 今週の動き（' + fmtDate(wb.start) + ' 〜 ' + fmtDate(wb.end) + '）</h2>' +
    '<table><tr><th>指標</th><th>今週</th><th>先週</th><th>増減</th></tr>' +
      wRow('追加タスク', stats.addedThisWeek, stats.addedLastWeek, '件') +
      wRow('完了タスク', stats.completedThisWeek, stats.completedLastWeek, '件') +
      (stats.spTotal > 0 ? wRow('完了SP', stats.spThisWeek, stats.spLastWeek, 'SP') : '') +
    '</table>' +

    (milestones.length > 0
      ? '<h2>🏁 マイルストーン状況</h2><table><tr><th>名前</th><th>完了</th><th>進捗</th><th>状態</th></tr>' + msRows + '</table>'
      : '') +

    '<h2>💬 今週のコメント</h2>' +
    '<div class="note">' + esc(note) + '</div>' +

    '<h2>📅 ガントチャート</h2>' +
    '<div class="gantt-wrap">' + ganttSVG + '</div>' +

    '<div style="text-align:center;margin-top:24px" class="no-print">' +
      '<button class="btn" onclick="window.print()">🖨️ 印刷 / PDF保存</button>' +
      '<div style="margin-top:8px;font-size:11px;color:#9ca3af">Chrome / Edge の印刷ダイアログで「送信先: PDF に保存」を選択してください</div>' +
    '</div>' +
    '</body></html>';
  }

  // ══════════════════════════════════════════════════════════
  // レポート出力（グローバルハンドラ）
  // ══════════════════════════════════════════════════════════
  SP.printReport = function(pid) {
    var project = TaskFlow.getProject(pid);
    if (!project) return;
    var stats      = calcStats(project);
    var milestones = calcMilestones(project);
    var curNote    = getCurrentNote(project);
    var ganttSVG   = buildGanttSVG(project, 980);
    var html       = buildPrintHTML(project, stats, milestones, curNote, ganttSVG);
    var w = window.open('', '_blank', 'width=1050,height=780');
    w.document.write(html);
    w.document.close();
    setTimeout(function(){ w.focus(); }, 300);
  };

  // ══════════════════════════════════════════════════════════
  // サマリータブ レンダリング
  // ══════════════════════════════════════════════════════════
  function statCard(label, val, color) {
    return '<div style="background:var(--surface2);border-radius:8px;padding:16px;text-align:center">' +
      '<div style="font-size:28px;font-weight:700;color:' + color + '">' + val + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + label + '</div></div>';
  }
  function weekCard(label, tw, lw, unit) {
    var diff = lw !== null ? tw - lw : null;
    var dc = diff === null ? '' : diff > 0 ? 'var(--green)' : diff < 0 ? 'var(--red)' : 'var(--muted)';
    var dt = diff === null ? '' : (diff >= 0 ? '▲'+diff : '▼'+Math.abs(diff));
    return '<div style="background:var(--surface2);border-radius:8px;padding:14px;text-align:center">' +
      '<div style="font-size:24px;font-weight:700">' + tw + '<span style="font-size:12px;font-weight:400"> ' + unit + '</span></div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:2px">' + label + '</div>' +
      (lw !== null ? '<div style="font-size:11px;color:var(--muted);margin-top:4px">先週: ' + lw + unit + ' <span style="color:' + dc + ';font-weight:600">' + dt + '</span></div>' : '') +
    '</div>';
  }

  function render(project) {
    if (!project) return '<div style="padding:32px;color:var(--muted)">プロジェクトを選択してください</div>';

    var pid        = project.id;
    var stats      = calcStats(project);
    var milestones = calcMilestones(project);
    var notes      = project.weeklyNotes || [];
    var curNote    = getCurrentNote(project);
    var wb         = stats.thisWeek;

    var pDeltaHtml = stats.pctDelta > 0
      ? '<span style="color:var(--green);font-size:12px">▲' + stats.pctDelta + '%</span>'
      : stats.pctDelta < 0
        ? '<span style="color:var(--red);font-size:12px">▼' + Math.abs(stats.pctDelta) + '%</span>'
        : '<span style="color:var(--muted);font-size:12px">±0%</span>';

    // マイルストーン
    var msHtml = '';
    if (milestones.length > 0) {
      msHtml = '<div style="margin-bottom:24px"><div style="font-size:13px;font-weight:600;margin-bottom:10px">🏁 マイルストーン</div>' +
        milestones.map(function(ms) {
          var st  = ms.pct >= 100 ? '✅ 完了' : ms.isOverdue ? '⚠️ 遅延' : ms.daysLeft !== null ? (ms.daysLeft <= 0 ? '期限切れ' : ms.daysLeft + '日後') : '―';
          var stc = ms.pct >= 100 ? 'var(--green)' : ms.isOverdue ? 'var(--red)' : 'var(--text)';
          return '<div style="display:flex;align-items:center;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">' +
            '<div style="flex:1;font-size:13px">' + esc(ms.name) + '</div>' +
            '<div style="width:130px">' +
              '<div style="background:var(--border);border-radius:3px;height:6px">' +
                '<div style="background:var(--accent);height:100%;border-radius:3px;width:' + ms.pct + '%"></div></div>' +
              '<div style="font-size:10px;color:var(--muted);margin-top:2px">' + ms.done + '/' + ms.total + ' (' + ms.pct + '%)</div></div>' +
            '<div style="font-size:12px;font-weight:600;color:' + stc + ';min-width:60px;text-align:right">' + st + '</div></div>';
        }).join('') + '</div>';
    }

    // 過去コメント
    var pastNotes = notes.filter(function(n){ return n.weekStart !== wb.start; }).slice(0,12);
    var histHtml = '';
    if (pastNotes.length > 0) {
      histHtml = '<div style="margin-top:12px">' +
        '<button onclick="window._SummaryPlugin.toggleHistory()" style="background:none;border:none;cursor:pointer;color:var(--accent);font-size:12px;padding:0">📋 過去のコメントを表示 / 非表示</button>' +
        '<div id="sum-note-history" style="display:none;margin-top:12px;max-height:280px;overflow-y:auto">' +
          pastNotes.map(function(n){
            return '<div style="margin-bottom:12px">' +
              '<div style="font-size:11px;color:var(--muted);margin-bottom:4px">' + fmtWeekLabel(n.weekStart) + '</div>' +
              '<div style="background:var(--surface2);border-radius:6px;padding:10px 12px;font-size:12px;white-space:pre-wrap;line-height:1.6">' + esc(n.text) + '</div></div>';
          }).join('') + '</div></div>';
    }

    return '<div style="padding:28px 32px;max-width:820px">' +

      '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:22px">' +
        '<div><div style="font-size:20px;font-weight:700">' + esc(project.name) + '</div>' +
        '<div style="font-size:12px;color:var(--muted);margin-top:2px">対象週: ' + fmtDate(wb.start) + '（月）〜 ' + fmtDate(wb.end) + '（日）</div></div>' +
        '<button onclick="window._SummaryPlugin.printReport(\'' + pid + '\')" ' +
          'style="padding:8px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">' +
          '🖨️ レポート出力</button>' +
      '</div>' +

      '<div style="margin-bottom:24px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px">' +
          '<span>全体進捗</span>' +
          '<span style="display:flex;gap:14px;align-items:center">' +
            '<span>' + stats.done + ' / ' + stats.total + ' 完了</span>' +
            '<strong style="font-size:18px;color:var(--text)">' + stats.pct + '%</strong>' +
            '<span>先週比 ' + pDeltaHtml + '</span>' +
          '</span>' +
        '</div>' +
        '<div style="background:var(--surface2);border-radius:4px;height:10px;overflow:hidden">' +
          '<div style="height:100%;background:var(--accent);border-radius:4px;width:' + stats.pct + '%;transition:width .4s"></div></div>' +
      '</div>' +

      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">' +
        statCard('To Do',   stats.todo,   '#6b7280') +
        statCard('進行中',   stats.inprog, '#3b82f6') +
        statCard('レビュー', stats.review, '#f59e0b') +
        statCard('完了',     stats.done,   '#22c55e') +
      '</div>' +

      '<div style="margin-bottom:24px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:10px">📅 今週の動き（' + fmtDate(wb.start) + '〜' + fmtDate(wb.end) + '）</div>' +
        '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">' +
          weekCard('追加タスク', stats.addedThisWeek, stats.addedLastWeek, '件') +
          weekCard('完了タスク', stats.completedThisWeek, stats.completedLastWeek, '件') +
          (stats.spTotal > 0
            ? weekCard('完了SP', stats.spThisWeek, stats.spLastWeek, 'SP')
            : weekCard('期限切れ', stats.overdue, null, '件')) +
        '</div>' +
      '</div>' +

      msHtml +

      (stats.overdue > 0
        ? '<div style="background:rgba(239,68,68,.08);border:1px solid rgba(239,68,68,.25);border-radius:8px;padding:12px 16px;font-size:13px;color:var(--red);margin-bottom:24px">⚠️ 期限切れタスクが ' + stats.overdue + ' 件あります</div>'
        : '<div style="background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:12px 16px;font-size:13px;color:var(--green);margin-bottom:24px">✅ 期限切れタスクはありません</div>') +

      '<div style="margin-bottom:8px">' +
        '<div style="font-size:13px;font-weight:600;margin-bottom:8px">💬 今週のコメント</div>' +
        '<textarea id="sum-note-ta" rows="6" ' +
          'style="width:100%;box-sizing:border-box;background:var(--surface2);border:1px solid var(--border);' +
          'border-radius:6px;padding:10px 12px;font-size:13px;color:var(--text);resize:vertical;font-family:inherit;line-height:1.7" ' +
          'placeholder="今週の進捗・課題・来週の予定などを記入...">' + esc(curNote ? curNote.text : '') + '</textarea>' +
        '<div style="text-align:right;margin-top:8px">' +
          '<button onclick="window._SummaryPlugin.saveNote(\'' + pid + '\')" ' +
            'style="padding:7px 18px;background:var(--accent);color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600">' +
            '💾 保存</button></div>' +
      '</div>' +
      histHtml +
    '</div>';
  }

  // ══════════════════════════════════════════════════════════
  // 登録
  // ══════════════════════════════════════════════════════════
  document.addEventListener('taskflow-ready', function () {
    TaskFlow.addViewTab({
      id:     'summary',
      label:  '📈 サマリー',
      render: function(project) { return render(project); },
    });
  });

  console.log('[plugin_summary] v2 loaded');
})();

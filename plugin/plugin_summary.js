// ================================================================
//  plugin_summary.js  - TaskFlowZero サマリービュープラグイン
//  プロジェクトの進捗・ステータス集計をタブとして表示します。
//  plugin/ フォルダに置いて plugins.js に登録してください。
// ================================================================

(function () {
  'use strict';

  // ── 言語定義 ─────────────────────────────────────────────
  var DICT = {
    ja: {
      tabLabel:    '📈 サマリー',
      noProject:   'プロジェクトを選択してください',
      progress:    '進捗',
      complete:    '完了',
      overduWarn:  function(n){ return '⚠️ 期限切れタスクが ' + n + ' 件あります'; },
      noOverdue:   '✅ 期限切れタスクはありません',
      statusLabels: { todo: 'To Do', inprogress: '進行中', review: 'レビュー', done: '完了' },
    },
    en: {
      tabLabel:    '📈 Summary',
      noProject:   'Please select a project',
      progress:    'Progress',
      complete:    'Complete',
      overduWarn:  function(n){ return '⚠️ ' + n + ' overdue task' + (n !== 1 ? 's' : ''); },
      noOverdue:   '✅ No overdue tasks',
      statusLabels: { todo: 'To Do', inprogress: 'In Progress', review: 'Review', done: 'Done' },
    },
  };

  var _lang = localStorage.getItem('taskflow_lang') || 'ja';
  function t() { return DICT[_lang] || DICT.ja; }

  // ── 今日の日付（ローカル） ────────────────────────────────
  function localToday() {
    var d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // ── ステータスカード ──────────────────────────────────────
  function statCard(label, count, color) {
    return '<div style="background:var(--surface2);border-radius:8px;padding:16px;text-align:center">' +
      '<div style="font-size:28px;font-weight:700;color:' + color + '">' + count + '</div>' +
      '<div style="font-size:12px;color:var(--muted);margin-top:4px">' + label + '</div>' +
    '</div>';
  }

  // ── レンダリング ──────────────────────────────────────────
  function render(project) {
    if (!project) {
      return '<div style="padding:32px;color:var(--muted)">' + t().noProject + '</div>';
    }

    var d = t();
    var tasks   = project.tasks || [];
    var total   = tasks.length;
    var done    = tasks.filter(function(t){ return t.status === 'done'; }).length;
    var inprog  = tasks.filter(function(t){ return t.status === 'inprogress'; }).length;
    var review  = tasks.filter(function(t){ return t.status === 'review'; }).length;
    var todo    = tasks.filter(function(t){ return t.status === 'todo'; }).length;
    var pct     = total > 0 ? Math.round(done / total * 100) : 0;
    var today   = localToday();
    var overdue = tasks.filter(function(task){
      return task.status !== 'done' && task.dueDate && task.dueDate < today;
    }).length;

    var sl = d.statusLabels;

    return '<div style="padding:28px 32px;max-width:720px">' +

      // タイトル・説明
      '<div style="font-size:20px;font-weight:700;margin-bottom:4px">' + project.name + '</div>' +
      '<div style="font-size:13px;color:var(--muted);margin-bottom:24px">' + (project.description || '') + '</div>' +

      // 進捗バー
      '<div style="margin-bottom:24px">' +
        '<div style="display:flex;justify-content:space-between;font-size:12px;color:var(--muted);margin-bottom:6px">' +
          '<span>' + d.progress + '</span>' +
          '<span>' + done + ' / ' + total + ' ' + d.complete + ' (' + pct + '%)</span>' +
        '</div>' +
        '<div style="background:var(--surface2);border-radius:4px;height:8px;overflow:hidden">' +
          '<div style="height:100%;background:var(--accent);border-radius:4px;width:' + pct + '%;transition:width .3s"></div>' +
        '</div>' +
      '</div>' +

      // ステータス集計
      '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px">' +
        statCard(sl.todo,      todo,   '#4b5563') +
        statCard(sl.inprogress,inprog, '#2563eb') +
        statCard(sl.review,    review, '#d97706') +
        statCard(sl.done,      done,   '#16a34a') +
      '</div>' +

      // 期限切れ表示
      (overdue > 0
        ? '<div style="background:rgba(239,68,68,.1);border:1px solid rgba(239,68,68,.3);border-radius:8px;padding:12px 16px;font-size:13px;color:var(--red)">' + d.overduWarn(overdue) + '</div>'
        : '<div style="background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:8px;padding:12px 16px;font-size:13px;color:var(--green)">' + d.noOverdue + '</div>'
      ) +

    '</div>';
  }

  // ── 登録 ─────────────────────────────────────────────────
  document.addEventListener('taskflow-ready', function () {
    TaskFlow.addViewTab({
      id:    'summary',
      label: t().tabLabel,
      render: function(project) { return render(project); },
    });

    // 言語切り替えに追随（リロード式なので起動時読み込みのみで基本OK）
    TaskFlow.on('lang-changed', function(data) {
      _lang = data.lang || 'ja';
    });
  });

  console.log('[plugin_summary] loaded');
})();

// ================================================================
//  plugin_csv_export.js  - TaskFlow CSVエクスポートプラグイン
//  plugin/ フォルダに置いて plugins.js に登録してください
// ================================================================

(function () {
  'use strict';

  var PLUGIN_ID = 'csv-export';

  // ── プラグインメタ情報を登録 ─────────────────────────────
  // 設定画面「プラグイン」ペインに説明・バージョンを表示するために呼ぶ。
  // TaskFlow 本体のバージョンが registerPlugin に対応していない場合は
  // 何もしない（後方互換）。
  if (typeof TaskFlow !== 'undefined' && typeof TaskFlow.registerPlugin === 'function') {
    TaskFlow.registerPlugin({
      id:          PLUGIN_ID,
      name:        'CSVエクスポート',
      description: 'タスク一覧をCSVファイルとして出力します。' +
                   '現在のプロジェクトのみ、または全プロジェクトをまとめて1ファイルに出力できます。',
      version:     '1.0.0',
    });
  }

  // ── 言語定義 ─────────────────────────────────────────────
  var DICT = {
    ja: {
      sidebarLabel:  '📊 CSVエクスポート',
      modalTitle:    '📊 CSVエクスポート',
      btnCurrent:    '現在のプロジェクトのみ',
      btnAll:        '全プロジェクト（1ファイルにまとめる）',
      colsLine1:     '出力列: プロジェクト / # / タイトル / ステータス / 担当者 / 作成者',
      colsLine2:     'マイルストーン / 開始日 / 期限 / 完了日 / SP',
      colsLine3:     '見積工数(h) / 実績工数(h) / ラベル / チェックリスト進捗 / 作成日',
      btnClose:      '閉じる',
      errNoProject:  'プロジェクトを選択してください',
      errNoProjects: 'プロジェクトがありません',
      toastCurrent:  function(n,c){ return '「'+n+'」をエクスポートしました（'+c+'件）'; },
      toastAll:      function(p,t){ return '全 '+p+' プロジェクト・'+t+' タスクをエクスポートしました'; },
      statusLabels:  { todo:'To Do', inprogress:'進行中', review:'レビュー', done:'完了' },
      csvHeader:     [
        'プロジェクト','#','タイトル','ステータス','担当者','作成者',
        'マイルストーン','開始日','期限','完了日','SP',
        '見積工数(h)','実績工数(h)','ラベル','チェックリスト進捗','作成日',
      ],
    },
    en: {
      sidebarLabel:  '📊 CSV Export',
      modalTitle:    '📊 CSV Export',
      btnCurrent:    'Current project only',
      btnAll:        'All projects (combined into one file)',
      colsLine1:     'Columns: Project / # / Title / Status / Assignee / Creator',
      colsLine2:     'Milestone / Start / Due / Completed / SP',
      colsLine3:     'Est.(h) / Actual(h) / Labels / Checklist / Created',
      btnClose:      'Close',
      errNoProject:  'Please select a project',
      errNoProjects: 'No projects found',
      toastCurrent:  function(n,c){ return '"'+n+'" exported ('+c+' tasks)'; },
      toastAll:      function(p,t){ return 'Exported '+p+' projects, '+t+' tasks'; },
      statusLabels:  { todo:'To Do', inprogress:'In Progress', review:'Review', done:'Done' },
      csvHeader:     [
        'Project','#','Title','Status','Assignee','Creator',
        'Milestone','Start','Due','Completed','SP',
        'Est.(h)','Actual(h)','Labels','Checklist','Created',
      ],
    },
  };

  var _lang = localStorage.getItem('taskflow_lang') || 'ja';
  function t() { return DICT[_lang] || DICT.ja; }

  // ── CSVエスケープ ─────────────────────────────────────────
  function cell(v) {
    return '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  }

  // ── 単一プロジェクトのCSV生成 ────────────────────────────
  function buildCsv(project) {
    var milestoneMap = {};
    (project.milestones || []).forEach(function(m) { milestoneMap[m.id] = m.name; });

    var statusLabels = t().statusLabels;

    var rows = project.tasks.map(function(task) {
      var cl      = task.checklist || [];
      var clTotal = cl.length;
      // checked と done の両方に対応（スキーマ移行の互換性）
      var clDone  = cl.filter(function(c) { return c.checked || c.done; }).length;
      var clStr   = clTotal > 0 ? (clDone + '/' + clTotal) : '';

      return [
        project.name,
        '#' + task.number,
        task.title,
        statusLabels[task.status] || task.status,
        task.assignee || '',
        task.creator  || '',                                               // 作成者
        task.milestoneId ? (milestoneMap[task.milestoneId] || '') : '',
        task.startDate   || '',
        task.dueDate     || '',
        task.completedAt || '',
        task.storyPoints || 0,
        task.estimatedHours > 0 ? task.estimatedHours : '',               // 見積工数(h)
        task.actualHours    > 0 ? task.actualHours    : '',               // 実績工数(h)
        (task.labels || []).join(', '),
        clStr,
        task.createdAt || '',
      ];
    });

    return [t().csvHeader].concat(rows)
      .map(function(r) { return r.map(cell).join(','); })
      .join('\r\n');
  }

  // ── ダウンロード ─────────────────────────────────────────
  function download(filename, csvStr) {
    var blob = new Blob(['\uFEFF' + csvStr], { type: 'text/csv;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ── エクスポート処理 ─────────────────────────────────────
  function exportCurrentProject() {
    var p = TaskFlow.getCurrentProject();
    if (!p) { TaskFlow.toast(t().errNoProject, 'error'); return; }
    download(p.name + '_tasks.csv', buildCsv(p));
    TaskFlow.toast(t().toastCurrent(p.name, p.tasks.length), 'success');
  }

  function exportAllProjects() {
    var projects = TaskFlow.getProjects().filter(function(p) { return !p.archived; });
    if (!projects.length) { TaskFlow.toast(t().errNoProjects, 'error'); return; }
    var sections = projects.map(buildCsv);
    var combined = sections.map(function(csv, i) {
      return i === 0 ? csv : csv.split('\r\n').slice(1).join('\r\n');
    }).join('\r\n');
    var today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    download('taskflow_all_' + today + '.csv', combined);
    var total = projects.reduce(function(s, p) { return s + p.tasks.length; }, 0);
    TaskFlow.toast(t().toastAll(projects.length, total), 'success');
  }

  // ── モーダル表示 ─────────────────────────────────────────
  var MODAL_ID = 'csv-export-modal';

  function hideModal() { TaskFlow.closeModal(MODAL_ID); }

  function buildModal() {
    var d = t();

    // 初回のみDOMを生成
    if (!document.getElementById(MODAL_ID)) {
      var overlay = document.createElement('div');
      overlay.id = MODAL_ID;
      overlay.className = 'modal-overlay';
      overlay.addEventListener('click', function(e) { if (e.target === overlay) hideModal(); });

      var box = document.createElement('div');
      box.className = 'modal';
      box.style.cssText = 'width:400px';
      overlay.appendChild(box);
      document.body.appendChild(overlay);
    }

    // 中身を毎回再構築（言語切り替え対応）
    var box = document.querySelector('#' + MODAL_ID + ' .modal');
    box.innerHTML =
      '<div style="font-size:16px;font-weight:700;margin-bottom:20px">' + d.modalTitle + '</div>' +
      '<div style="display:flex;flex-direction:column;gap:10px;margin-bottom:24px">' +
        '<button class="btn btn-primary" id="csv-btn-current">' + d.btnCurrent + '</button>' +
        '<button class="btn btn-secondary" id="csv-btn-all">' + d.btnAll + '</button>' +
      '</div>' +
      '<div style="font-size:11px;color:var(--muted);margin-bottom:16px;line-height:1.7;background:var(--surface2);border:1px solid var(--border);border-radius:6px;padding:10px 12px">' +
        d.colsLine1 + '<br>' + d.colsLine2 + '<br>' + d.colsLine3 +
      '</div>' +
      '<div style="text-align:right"><button class="btn btn-secondary btn-sm" id="csv-btn-close">' + d.btnClose + '</button></div>';

    box.querySelector('#csv-btn-current').addEventListener('click', function() { exportCurrentProject(); hideModal(); });
    box.querySelector('#csv-btn-all').addEventListener('click', function() { exportAllProjects(); hideModal(); });
    box.querySelector('#csv-btn-close').addEventListener('click', hideModal);

    TaskFlow.openModal(MODAL_ID);
  }

  // ── サイドバー登録 ────────────────────────────────────────
  document.addEventListener('taskflow-ready', function () {
    TaskFlow.addSidebarItem({ id: PLUGIN_ID, label: t().sidebarLabel, onclick: buildModal });
  });

  console.log('[plugin_csv_export] loaded v1.0.0');
})();

// ================================================================
//  plugin_overdue_badge.js  - TaskFlow 期限切れバッジプラグイン
//  plugin/ フォルダに置いて plugins.js に登録してください
// ================================================================

(function () {
  'use strict';

  var PLUGIN_ID = 'overdue-badge';
  var ITEM_ID   = 'overdue-badge';

  // ── プラグインメタ情報を登録 ─────────────────────────────
  // 設定画面「プラグイン」ペインに説明・設定項目を表示するために呼ぶ。
  // TaskFlow 本体のバージョンが registerPlugin に対応していない場合は
  // 何もしない（後方互換）。
  if (typeof TaskFlow !== 'undefined' && typeof TaskFlow.registerPlugin === 'function') {
    TaskFlow.registerPlugin({
      id:          PLUGIN_ID,
      name:        '期限切れバッジ',
      description: '期限を過ぎた未完了タスクをサイドバーに件数表示します。' +
                   'クリックで一覧モーダルを開き、タスクに直接ジャンプできます。',
      version:     '1.1.0',
      settings: [
        {
          key:     'showZero',
          label:   '期限切れが 0件のときもバッジを表示する',
          type:    'boolean',
          default: true,
        },
        {
          key:         'warnDays',
          label:       '期限まで残り何日以内を警告表示するか',
          description: '0 にすると当日期限のタスクのみを警告対象にします',
          type:        'number',
          default:     0,
        },
        {
          key:     'includeArchived',
          label:   'アーカイブ済みプロジェクトも集計対象にする',
          type:    'boolean',
          default: false,
        },
        {
          key:     'intervalMin',
          label:   '自動更新の間隔（分）',
          type:    'number',
          default: 5,
        },
      ],
    });
  }

  // ── 言語定義 ─────────────────────────────────────────────
  var DICT = {
    ja: {
      counting:      '⚠️ 集計中…',
      noOverdue:     '✅ 期限切れなし',
      overdue:       function(n){ return '⚠️ 期限切れ ' + n + '件'; },
      modalTitle:    function(n){ return n > 0 ? '⚠️ 期限切れタスク（' + n + '件）' : '⚠️ 期限切れタスク'; },
      empty:         '期限切れタスクはありません 🎉',
      daysOver:      function(n){ return n + '日超過'; },
      btnClose:      '閉じる',
    },
    en: {
      counting:      '⚠️ Counting…',
      noOverdue:     '✅ No overdue tasks',
      overdue:       function(n){ return '⚠️ Overdue: ' + n; },
      modalTitle:    function(n){ return n > 0 ? '⚠️ Overdue Tasks (' + n + ')' : '⚠️ Overdue Tasks'; },
      empty:         'No overdue tasks 🎉',
      daysOver:      function(n){ return n + ' day' + (n !== 1 ? 's' : '') + ' overdue'; },
      btnClose:      'Close',
    },
  };

  var _lang = localStorage.getItem('taskflow_lang') || 'ja';
  function t() { return DICT[_lang] || DICT.ja; }

  // ── 設定値を読む（getPluginConfig 非対応バージョンへのフォールバック付き） ──
  function getCfg() {
    var defaults = { showZero: true, warnDays: 0, includeArchived: false, intervalMin: 5 };
    if (typeof TaskFlow !== 'undefined' && typeof TaskFlow.getPluginConfig === 'function') {
      return Object.assign({}, defaults, TaskFlow.getPluginConfig(PLUGIN_ID));
    }
    return defaults;
  }

  // ── 今日の日付（ローカル時刻ベース） ─────────────────────
  function localToday() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  // ── 期限切れ（または警告対象）タスクを集計（全プロジェクト） ──
  function getOverdueTasks() {
    var cfg = getCfg();
    var today = localToday();

    // warnDays が 1 以上なら「N日後以前」も警告対象に含める
    var warnDate = today;
    if (cfg.warnDays > 0) {
      var d = new Date(today + 'T00:00:00');
      d.setDate(d.getDate() + cfg.warnDays);
      warnDate = d.getFullYear() + '-'
        + String(d.getMonth() + 1).padStart(2, '0') + '-'
        + String(d.getDate()).padStart(2, '0');
    }

    var result = [];
    var projects = typeof TaskFlow.getProjects === 'function'
      ? TaskFlow.getProjects()
      : (TaskFlow.getData().projects || []);

    projects
      .filter(function(p) { return cfg.includeArchived ? true : !p.archived; })
      .forEach(function(p) {
        p.tasks.forEach(function(task) {
          if (task.status !== 'done' && task.dueDate && task.dueDate <= warnDate) {
            result.push({ task: task, project: p });
          }
        });
      });
    return result;
  }

  // ── バッジラベルを更新 ────────────────────────────────────
  function updateBadge() {
    try {
      var cfg = getCfg();
      var overdue = getOverdueTasks();
      var count = overdue.length;
      var icon, label, color, weight;

      if (count === 0) {
        icon = '✅'; label = t().noOverdue.replace(/^✅\s*/, '');
        color = 'var(--muted)'; weight = 'normal';
      } else {
        icon = '⚠️'; label = t().overdue(count).replace(/^⚠️\s*/, '');
        color = 'var(--red)'; weight = '600';
      }

      // showZero=false かつ 0件のときはサイドバー項目を非表示
      // 色・太字・非表示状態は opts として渡し、TaskFlow 側の def に保存してもらう。
      // （以前は document.getElementById() で取得したボタンに直接 style を
      //   書き込んでいたが、renderSidebar() がプロジェクト以外の項目選択のたびに
      //   プラグインサイドバー項目を作り直すため、その都度スタイルが失われ
      //   「非プロジェクト項目を選択すると赤文字が黒に戻る」バグの原因になっていた）
      var hidden = (count === 0 && !cfg.showZero);
      TaskFlow.updateSidebarItem(ITEM_ID, icon, label, {
        color: color,
        fontWeight: weight,
        hidden: hidden,
      });
    } catch (e) {
      console.error('[plugin_overdue_badge] updateBadge error:', e);
    }
  }

  // ── 期限切れ一覧モーダルを表示 ───────────────────────────
  var MODAL_ID = 'overdue-modal';

  function closeOverdueModal() {
    TaskFlow.closeModal(MODAL_ID);
  }

  function showOverdueModal() {
    try {
      var allOverdue = getOverdueTasks();
      var today = localToday();

      function daysOver(dueDate) {
        return Math.round(
          (new Date(today + 'T00:00:00') - new Date(dueDate + 'T00:00:00')) / 86400000
        );
      }

      // 既存モーダルがあれば再利用、なければ生成
      var overlay = document.getElementById(MODAL_ID);
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = MODAL_ID;
        overlay.className = 'modal-overlay';
        overlay.addEventListener('click', function(e) {
          if (e.target === overlay) closeOverdueModal();
        });

        var box = document.createElement('div');
        box.className = 'modal';
        box.style.cssText = 'width:440px;max-width:95vw;max-height:80vh;display:flex;flex-direction:column;padding:24px 28px';
        overlay.appendChild(box);
        document.body.appendChild(overlay);
      }

      // モーダル内容を毎回再構築
      var box = overlay.querySelector('.modal');
      box.innerHTML = '';

      // ヘッダー
      var header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px';

      var titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:16px;font-weight:700';
      titleEl.textContent = t().modalTitle(allOverdue.length);

      var closeBtn = document.createElement('button');
      closeBtn.className = 'btn btn-secondary btn-sm';
      closeBtn.textContent = t().btnClose;
      closeBtn.addEventListener('click', closeOverdueModal);

      header.appendChild(titleEl);
      header.appendChild(closeBtn);
      box.appendChild(header);

      // リスト
      var listWrap = document.createElement('div');
      listWrap.style.cssText = 'overflow-y:auto;flex:1';

      if (allOverdue.length === 0) {
        var empty = document.createElement('div');
        empty.style.cssText = 'text-align:center;color:var(--muted);padding:24px 0;font-size:13px';
        empty.textContent = t().empty;
        listWrap.appendChild(empty);
      } else {
        allOverdue
          .sort(function(a, b) { return a.task.dueDate < b.task.dueDate ? -1 : 1; })
          .forEach(function(item) {
            var task = item.task, p = item.project;
            var row = document.createElement('div');
            row.style.cssText =
              'display:flex;align-items:center;gap:10px;padding:8px 4px;' +
              'border-bottom:1px solid var(--border);cursor:pointer;border-radius:4px;transition:background .12s';
            row.addEventListener('mouseenter', function() { row.style.background = 'var(--surface2)'; });
            row.addEventListener('mouseleave', function() { row.style.background = ''; });

            (function(pid, tid) {
              row.addEventListener('click', function() {
                closeOverdueModal();
                openOverdueTask(pid, tid);
              });
            })(p.id, task.id);

            var info = document.createElement('div');
            info.style.cssText = 'flex:1;min-width:0';

            var projEl = document.createElement('div');
            projEl.style.cssText = 'font-size:12px;color:var(--muted);margin-bottom:2px';
            projEl.textContent = 'P' + p.number + ' ' + p.name;

            var taskEl = document.createElement('div');
            taskEl.style.cssText = 'font-size:13px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis';
            taskEl.textContent = '#' + task.number + ' ' + task.title;

            info.appendChild(projEl);
            info.appendChild(taskEl);

            var meta = document.createElement('div');
            meta.style.cssText = 'flex-shrink:0;text-align:right';

            var dateEl = document.createElement('div');
            dateEl.style.cssText = 'font-size:11px;color:var(--red);font-weight:600';
            dateEl.textContent = task.dueDate;

            var overEl = document.createElement('div');
            overEl.style.cssText = 'font-size:10px;color:var(--red)';
            var d = daysOver(task.dueDate);
            overEl.textContent = d > 0 ? t().daysOver(d) : '本日期限';

            meta.appendChild(dateEl);
            meta.appendChild(overEl);
            row.appendChild(info);
            row.appendChild(meta);
            listWrap.appendChild(row);
          });
      }

      box.appendChild(listWrap);
      TaskFlow.openModal(MODAL_ID);

    } catch (e) {
      console.error('[plugin_overdue_badge] showOverdueModal error:', e);
    }
  }

  // ── 別プロジェクトのタスクを開く ─────────────────────────
  function openOverdueTask(projectId, taskId) {
    var state = TaskFlow.getState();
    var isSameProject = state.currentProjectId === projectId;

    var p = TaskFlow.getProject(projectId);
    if (p) {
      state.currentProjectId = projectId;

      var colorBadge = document.getElementById('ph-color-badge');
      if (colorBadge) colorBadge.style.background = p.color || '#4f8eff';

      var titleEl = document.getElementById('ph-title');
      if (titleEl) titleEl.textContent = p.name;

      var descEl = document.getElementById('ph-desc');
      if (descEl) descEl.textContent = p.description || '';

      var numEl = document.getElementById('ph-project-num');
      if (numEl) numEl.textContent = p.number ? 'P' + p.number : '';

      var archBtn = document.getElementById('btn-archive-project');
      if (archBtn) archBtn.textContent = p.archived ? '♻️ 未完了に戻す' : '📦 完了';

      // 設定画面・マイタスク・プロジェクト一覧など、本体の全ビューを確実に隠してから
      // プロジェクト詳細を表示する（isSameProject の場合でも実行することで、
      // 「設定画面を開いたまま同じプロジェクトのタスクへ遷移」した際の表示崩れを防ぐ）
      var projectDetail = document.getElementById('project-detail');
      if (typeof TaskFlow.hideAllViews === 'function') {
        TaskFlow.hideAllViews();
      } else {
        // 後方互換: 古い本体バージョン向けフォールバック
        ['projects-view', 'my-tasks-view', 'settings-view'].forEach(function(id) {
          var el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
      }
      if (projectDetail) projectDetail.style.display = 'flex';

      TaskFlow.renderSidebar();
      if (!isSameProject) TaskFlow.renderCurrentView();
    }

    setTimeout(function() { TaskFlow.openTaskPanel(taskId); }, 80);
  }

  // ── 初期化（重複防止つき） ───────────────────────────────
  var _initialized = false;
  var _intervalId  = null;

  function init() {
    if (_initialized) return;
    _initialized = true;

    TaskFlow.addSidebarItem({ id: ITEM_ID, icon: '⚠️', label: t().counting.replace(/^⚠️\s*/, ''), onclick: showOverdueModal });
    setTimeout(updateBadge, 50);

    TaskFlow.on('task-save',   updateBadge);
    TaskFlow.on('task-create', updateBadge);
    TaskFlow.on('task-delete', updateBadge);
    TaskFlow.on('view-change', updateBadge);

    // 自動更新（intervalMin 設定値を読んで適用）
    var cfg = getCfg();
    var ms = Math.max(1, cfg.intervalMin) * 60 * 1000;
    if (_intervalId) clearInterval(_intervalId);
    _intervalId = setInterval(updateBadge, ms);
  }

  if (window.TaskFlow) { TaskFlow.on('ready', init); }
  document.addEventListener('taskflow-ready', init);

  console.log('[plugin_overdue_badge] loaded v1.1.0');
})();

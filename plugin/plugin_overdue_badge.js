// ================================================================
//  plugin_overdue_badge.js  - TaskFlow 期限切れバッジプラグイン
//  plugin/ フォルダに置いて plugins.js に登録してください
// ================================================================

(function () {
  'use strict';

  var ITEM_ID = 'overdue-badge';

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

  // ── 今日の日付（ローカル時刻ベース） ─────────────────────
  function localToday() {
    var d = new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + day;
  }

  // ── 期限切れタスクを集計（全プロジェクト） ───────────────
  function getOverdueTasks() {
    var today = localToday();
    var result = [];
    var projects = typeof TaskFlow.getProjects === 'function'
      ? TaskFlow.getProjects()
      : (TaskFlow.getData().projects || []);
    projects.filter(function(p) { return !p.archived; }).forEach(function(p) {
      p.tasks.forEach(function(task) {
        if (task.status !== 'done' && task.dueDate && task.dueDate < today) {
          result.push({ task: task, project: p });
        }
      });
    });
    return result;
  }

  // ── バッジラベルを更新 ────────────────────────────────────
  function updateBadge() {
    try {
      var count = getOverdueTasks().length;
      var label, color, weight;
      if (count === 0) {
        label = t().noOverdue; color = 'var(--muted)'; weight = 'normal';
      } else {
        label = t().overdue(count); color = 'var(--red)'; weight = '600';
      }
      TaskFlow.updateSidebarItem(ITEM_ID, label);
      var btn = document.getElementById('plugin-sidebar-' + ITEM_ID);
      if (btn) { btn.style.color = color; btn.style.fontWeight = weight; }
    } catch (e) {
      console.error('[plugin_overdue_badge] updateBadge error:', e);
    }
  }

  // ── 期限切れ一覧モーダルを表示 ───────────────────────────
  function showOverdueModal() {
    try {
      var allOverdue = getOverdueTasks();
      var today = localToday();

      var existing = document.getElementById('overdue-modal');
      if (existing) existing.remove();

      function daysOver(dueDate) {
        return Math.round(
          (new Date(today + 'T00:00:00') - new Date(dueDate + 'T00:00:00')) / 86400000
        );
      }

      var overlay = document.createElement('div');
      overlay.id = 'overdue-modal';
      overlay.style.cssText =
        'position:fixed;inset:0;background:rgba(0,0,0,.5);' +
        'display:flex;align-items:center;justify-content:center;z-index:3000';

      var box = document.createElement('div');
      box.style.cssText =
        'background:var(--surface);border:1px solid var(--border);border-radius:12px;' +
        'padding:24px 28px;width:440px;max-width:96vw;max-height:80vh;' +
        'display:flex;flex-direction:column';

      // ヘッダー
      var header = document.createElement('div');
      header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:16px';

      var titleEl = document.createElement('div');
      titleEl.style.cssText = 'font-size:16px;font-weight:700';
      titleEl.textContent = t().modalTitle(allOverdue.length);

      var closeBtn = document.createElement('button');
      closeBtn.className = 'btn btn-secondary btn-sm';
      closeBtn.textContent = t().btnClose;
      closeBtn.addEventListener('click', function() { overlay.remove(); });

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
                overlay.remove();
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
            overEl.textContent = t().daysOver(daysOver(task.dueDate));

            meta.appendChild(dateEl);
            meta.appendChild(overEl);
            row.appendChild(info);
            row.appendChild(meta);
            listWrap.appendChild(row);
          });
      }

      box.appendChild(listWrap);
      overlay.appendChild(box);
      overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
      document.body.appendChild(overlay);

    } catch (e) {
      console.error('[plugin_overdue_badge] showOverdueModal error:', e);
    }
  }

  // ── 別プロジェクトのタスクを開く ─────────────────────────
  function openOverdueTask(projectId, taskId) {
    var state = TaskFlow.getState();
    if (state.currentProjectId !== projectId) {
      var p = TaskFlow.getProject(projectId);
      if (p) {
        state.currentProjectId = projectId;
        TaskFlow.renderSidebar();
        TaskFlow.renderCurrentView();
      }
    }
    setTimeout(function() { TaskFlow.openTaskPanel(taskId); }, 80);
  }

  // ── 初期化（重複防止つき） ───────────────────────────────
  var _initialized = false;

  function init() {
    if (_initialized) return;
    _initialized = true;

    TaskFlow.addSidebarItem({ id: ITEM_ID, label: t().counting, onclick: showOverdueModal });
    setTimeout(updateBadge, 50);

    TaskFlow.on('task-save',   updateBadge);
    TaskFlow.on('task-create', updateBadge);
    TaskFlow.on('task-delete', updateBadge);
    TaskFlow.on('view-change', updateBadge);

    setInterval(updateBadge, 5 * 60 * 1000);
  }

  if (window.TaskFlow) { TaskFlow.on('ready', init); }
  document.addEventListener('taskflow-ready', init);

  console.log('[plugin_overdue_badge] loaded');
})();

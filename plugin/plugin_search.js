(function () {
  'use strict';

  // メタ情報を登録（設定画面に表示される）
  if (typeof TaskFlow !== 'undefined' && typeof TaskFlow.registerPlugin === 'function') {
    TaskFlow.registerPlugin({
      id:          'search',
      name:        '全体検索',
      description: '全プロジェクトのタスク・コメント・Wikiから横断的に検索します。' +
                   'ショートカット Ctrl+Shift+F で素早くアクセスできます。',
      version:     '1.1.0',
    });
  }

  document.addEventListener('taskflow-ready', function () {

    // 1. メイン領域に検索用の独立ビュー（div）を作成して追加
    const mainArea = document.getElementById('main');
    if (!mainArea) return;

    const searchView = document.createElement('div');
    searchView.id = 'global-search-view';
    // plugin-custom-view クラスを付けることで _hideAllViews() の対象になる
    searchView.classList.add('plugin-custom-view');
    searchView.style.display = 'none';
    searchView.style.flex = '1';
    searchView.style.overflowY = 'auto';
    searchView.style.padding = '28px';

    searchView.innerHTML = `
      <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px;">
        <div>
          <div style="font-family:'Outfit',sans-serif; font-size:24px; font-weight:700;">🔍 全体検索</div>
          <div style="font-size:13px; color:var(--muted); margin-top:4px;">全プロジェクトのタスク、コメント、Wikiから横断的に検索します</div>
        </div>
      </div>

      <div style="display:flex; gap:8px; margin-bottom:24px; max-width:800px; flex-wrap:wrap;">
        <input type="text" id="global-search-input" class="form-input" placeholder="検索キーワードを入力..." style="flex:1; min-width:200px; font-size:14px; padding:10px 14px;">
        <select id="global-search-filter" class="form-select" style="width:160px; font-size:13px;">
          <option value="all">すべての項目</option>
          <option value="task">タスク・詳細</option>
          <option value="comment">コメント</option>
          <option value="wiki">Wiki・概要</option>
        </select>
        <label style="display:flex; align-items:center; gap:6px; font-size:13px; color:var(--text); cursor:pointer; background:var(--surface2); padding:0 12px; border:1px solid var(--border); border-radius:var(--radius); user-select:none;">
          <input type="checkbox" id="global-search-exclude-archived" checked style="accent-color:var(--accent);"> 完了プロジェクトを除外
        </label>
      </div>

      <div id="global-search-results" style="display:flex; flex-direction:column; gap:12px; max-width:800px; padding-bottom:40px;">
        <div style="color:var(--muted); font-size:13px; text-align:center; padding:40px;">
          検索キーワードを入力してください<br>
          <span style="font-size:11px; opacity:0.7;">（ショートカット: Ctrl + Shift + F）</span>
        </div>
      </div>
    `;
    mainArea.appendChild(searchView);

    // 2. 他の標準ビューが表示されたら、検索ビューを隠す監視設定
    // settings-view も監視対象に追加
    const observer = new MutationObserver(() => {
      const pView = document.getElementById('projects-view');
      const dView = document.getElementById('project-detail');
      const mView = document.getElementById('my-tasks-view');
      const sView = document.getElementById('settings-view');

      const anyStandardVisible =
        (pView && pView.style.display !== 'none') ||
        (dView && dView.style.display !== 'none') ||
        (mView && mView.style.display !== 'none') ||
        (sView && sView.style.display !== 'none' && sView.style.display !== '');

      if (anyStandardVisible) {
        searchView.style.display = 'none';
        _clearSearchActive();
      }
    });

    const targets = ['projects-view', 'project-detail', 'my-tasks-view', 'settings-view'];
    targets.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    });

    function _clearSearchActive() {
      const navSearch = document.getElementById('plugin-sidebar-nav-global-search');
      if (navSearch) {
        navSearch.classList.remove('active');
        navSearch.style.background = 'none';
        navSearch.style.color = 'var(--text)';
      }
    }

    // 3. 検索画面を表示する関数
    function showGlobalSearchView() {
      // TaskFlow.hideAllViews() で本体の全ビュー（settings-view含む）を確実に隠す
      if (typeof TaskFlow.hideAllViews === 'function') {
        TaskFlow.hideAllViews();
      } else {
        // 旧バージョンの本体との後方互換
        ['projects-view', 'project-detail', 'my-tasks-view', 'settings-view'].forEach(id => {
          const el = document.getElementById(id);
          if (el) el.style.display = 'none';
        });
      }

      TaskFlow.getState().currentProjectId = null;

      searchView.style.display = 'block';
      TaskFlow.viewFadeIn(searchView);

      // サイドバーのハイライト状態を検索ボタンに
      TaskFlow.renderSidebar();
      setTimeout(() => {
        document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
        const navSearch = document.getElementById('plugin-sidebar-nav-global-search');
        if (navSearch) {
          navSearch.classList.add('active');
          navSearch.style.background = 'rgba(79,142,255,.15)';
          navSearch.style.color = 'var(--accent2)';
        }
      }, 0);

      const input = document.getElementById('global-search-input');
      if (input) { input.focus(); input.select(); }
    }

    // 4. サイドバーにボタンを追加
    TaskFlow.addSidebarItem({
      id: 'nav-global-search',
      label: '🔍 全体検索',
      onclick: showGlobalSearchView
    });

    // 5. 検索処理の実装
    const input = document.getElementById('global-search-input');
    const filter = document.getElementById('global-search-filter');
    const excludeArchived = document.getElementById('global-search-exclude-archived');
    const resultsContainer = document.getElementById('global-search-results');
    let debounceTimer;

    const performSearch = () => {
      const q = input.value.trim().toLowerCase();
      const target = filter.value;
      const skipArchived = excludeArchived.checked;

      if (!q) {
        resultsContainer.innerHTML = '<div style="color:var(--muted); font-size:13px; text-align:center; padding:40px;">検索キーワードを入力してください</div>';
        return;
      }

      let hitCount = 0;
      let resultsHtml = '';
      const projects = TaskFlow.getProjects() || [];

      const escAndMark = (str) => {
        if (!str) return '';
        const safeStr = String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return safeStr.replace(regex, '<mark style="background:rgba(251,146,60,0.3); color:var(--orange); padding:0 2px; border-radius:2px; font-weight:bold;">$1</mark>');
      };

      projects.forEach(p => {
        if (skipArchived && p.archived) return;

        const pColor = p.color || '#4f8eff';
        const pBadge = `<span style="background:${pColor}22; color:${pColor}; padding:1px 6px; border-radius:3px; font-size:10px; font-weight:600;">${escAndMark(p.name)}</span>`;

        // ① Wiki / プロジェクト概要
        if (target === 'all' || target === 'wiki') {
          if (p.name.toLowerCase().includes(q) || (p.description||'').toLowerCase().includes(q) || (p.wiki||'').toLowerCase().includes(q)) {
            hitCount++;
            let snippet = '';
            if ((p.wiki||'').toLowerCase().includes(q)) {
              const idx = p.wiki.toLowerCase().indexOf(q);
              const start = Math.max(0, idx - 40);
              const end = Math.min(p.wiki.length, idx + 60);
              snippet = (start > 0 ? '...' : '') + p.wiki.substring(start, end) + (end < p.wiki.length ? '...' : '');
            } else if ((p.description||'').toLowerCase().includes(q)) {
              snippet = p.description;
            }
            resultsHtml += `
              <div class="project-card" style="padding:14px 16px; margin-bottom:0;"
                   onclick="openProject('${p.id}'); setTimeout(() => TaskFlow.switchView('wiki'), 100);">
                <div style="font-size:11px; color:var(--muted); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                  <span>📖 Wiki / プロジェクト概要</span> ${pBadge}
                </div>
                <div style="font-size:14px; font-weight:600; margin-bottom:6px;">${escAndMark(p.name)}</div>
                ${snippet ? `<div style="font-size:12px; color:var(--text); line-height:1.6; opacity:0.85;">${escAndMark(snippet)}</div>` : ''}
              </div>`;
          }
        }

        // ② タスク / コメント
        if (target === 'all' || target === 'task' || target === 'comment') {
          (p.tasks || []).forEach(t => {
            let hitType = '';
            let hitSnippet = '';
            let commentNo = null;

            if (target !== 'comment') {
              if (t.title.toLowerCase().includes(q) || (t.description||'').toLowerCase().includes(q)) {
                hitType = 'task';
                if ((t.description||'').toLowerCase().includes(q)) {
                  const idx = t.description.toLowerCase().indexOf(q);
                  hitSnippet = t.description.substring(Math.max(0, idx - 40), Math.min(t.description.length, idx + 60));
                  if (idx > 40) hitSnippet = '...' + hitSnippet;
                  if (idx + 60 < t.description.length) hitSnippet += '...';
                }
              }
            }

            if (!hitType && (target === 'all' || target === 'comment')) {
              const sortedComments = [...(t.comments||[])].sort((a,b)=>a.createdAt.localeCompare(b.createdAt));
              const hitIdx = sortedComments.findIndex(c => (c.text||'').toLowerCase().includes(q));
              if (hitIdx !== -1) {
                hitType = 'comment';
                commentNo = hitIdx + 1;
                const cText = sortedComments[hitIdx].text;
                const idx = cText.toLowerCase().indexOf(q);
                hitSnippet = cText.substring(Math.max(0, idx - 40), Math.min(cText.length, idx + 60));
                if (idx > 40) hitSnippet = '...' + hitSnippet;
                if (idx + 60 < cText.length) hitSnippet += '...';
              }
            }

            if (hitType) {
              hitCount++;
              const isDone = t.status === 'done';
              const hash = `#P${p.number}-${t.number}${commentNo ? '-C' + commentNo : ''}`;
              resultsHtml += `
                <div class="project-card" style="padding:14px 16px; margin-bottom:0; ${isDone ? 'opacity:0.65; filter:grayscale(0.3);' : ''}"
                     onclick="window.location.hash = '${hash}';">
                  <div style="font-size:11px; color:var(--muted); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
                    <span>${hitType === 'task' ? '📋 タスク' : '💬 コメント C'+commentNo}</span>
                    ${pBadge}
                    ${isDone ? `<span style="font-size:10px; background:var(--surface2); color:var(--green); padding:1px 6px; border-radius:3px; font-weight:600;">完了</span>` : ''}
                  </div>
                  <div style="font-size:14px; font-weight:600; margin-bottom:6px; font-family:'JetBrains Mono', monospace;">
                    <span style="color:var(--muted); margin-right:4px;">#${t.number}</span>
                    <span style="font-family:'Outfit', 'Noto Sans JP', sans-serif;">${escAndMark(t.title)}</span>
                  </div>
                  ${hitSnippet ? `<div style="font-size:12px; color:var(--text); line-height:1.6; opacity:0.85;">${escAndMark(hitSnippet)}</div>` : ''}
                </div>`;
            }
          });
        }
      });

      if (hitCount === 0) {
        resultsContainer.innerHTML = `
          <div style="text-align:center; padding:40px;">
            <div style="font-size:32px; opacity:0.5; margin-bottom:12px;">👻</div>
            <div style="color:var(--muted); font-size:14px;">「<span style="color:var(--text)">${escAndMark(input.value)}</span>」に一致する情報は見つかりませんでした</div>
          </div>`;
      } else {
        resultsContainer.innerHTML = `
          <div style="font-size:12px; font-weight:600; color:var(--muted); text-transform:uppercase; letter-spacing:1px; border-bottom:1px solid var(--border); padding-bottom:8px; margin-bottom:8px;">
            ${hitCount} 件ヒットしました
          </div>
          ${resultsHtml}`;
      }
    };

    // 6. デバウンス付きイベントリスナー
    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(performSearch, 300);
    });
    filter.addEventListener('change', performSearch);
    excludeArchived.addEventListener('change', performSearch);

    // 7. ショートカット (Ctrl + Shift + F)
    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        showGlobalSearchView();
      }
    });

  });
})();

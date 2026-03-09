// ================================================================
//  plugin_lang.js  - TaskFlow 言語切り替えプラグイン
//  taskflow.html と同じフォルダに置くと自動で読み込まれます
//  不要な場合はこのファイルを置かなければ機能は追加されません
// ================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'taskflow_lang';

  // ── 翻訳辞書 ─────────────────────────────────────────────
  const DICT = {
    // ヘッダー / 起動画面
    'プロジェクト管理システム':           'Project Management',
    '☀️ ライト':                          '☀️ Light',
    '🌙 ダーク':                          '🌙 Dark',
    '💾 保存':                            '💾 Save',
    '📂 別のファイルを開く':              '📂 Open Another File',
    '📂 ファイル変更':                    '📂 Change File',
    '前回のファイル':                     'Last File',
    'をご使用ください。':                 'Please use Chrome or Edge.',
    'File System Access API が使用できません': 'File System Access API is not supported',
    'このシステムは':                     'This app requires',
    'または':                             'or',
    '↩ 開く':                            '↩ Open',
    '✨ 新規作成':                        '✨ New File',
    '新規作成':                           'New File',
    'を選択':                             '(select)',
    '✅ アクセス許可あり — すぐに開けます': '✅ Access granted — ready to open',
    '🔑 クリックするとアクセス許可を求めます': '🔑 Click to request access permission',
    '↩ すぐに開く':                      '↩ Open Now',
    '共有フォルダ上のJSONファイルを開くか、': 'Open a JSON file on a shared folder, or',
    '新規作成してください。':             'create a new one.',
    'データファイルを選択':               'Select Data File',
    '以降の変更は自動的にファイルへ保存されます。': 'Changes will be saved to the file automatically.',
    ': 保存場所（共有フォルダ）を指定してファイルを作成': ': Create a new file at a shared location',
    ': 共有フォルダの':                   ': Open file from shared folder',
    ': ブラウザに保存されたハンドルで即時復元': ': Instantly reopen from browser cache',
    'または':                             'or',
    'File System Access API が使用できません': 'File System Access API is not supported',
    'このシステムは':                     'Please use',
    'をご使用ください。':                 'to run this app.',
    '別のファイルを開く':                 'Open Another File',

    // サイドバー
    'すべてのプロジェクト':               'All Projects',
    'プロジェクト一覧':                   'Project List',
    '進行中のプロジェクトがありません':   'No active projects',

    // プロジェクト一覧
    '＋ 新規プロジェクト':               '＋ New Project',
    'プロジェクトがありません':           'No projects yet',
    '「＋ 新規プロジェクト」から始めましょう': 'Click "＋ New Project" to get started',
    'プロジェクト':                       'Project',
    '📦 完了':                            '📦 Archive',

    // プロジェクトヘッダー / フィルター
    '＋ タスク追加':                      '＋ Add Task',
    '🏁 マイルストーン':                  '🏁 Milestones',
    'フィルター:':                        'Filter:',
    'マイルストーン: 全て':               'Milestone: All',
    '担当者: 全員':                       'Assignee: All',
    'ラベル: 全て':                       'Label: All',
    '期限: 全て':                         'Due: All',
    '開始前':                             'Not Started',
    '期間内（開始後〜期限内）':            'In Progress',
    '期限切れ':                           'Overdue',
    '期限なし':                           'No Due Date',
    '🔍 タイトル検索...':                '🔍 Search title...',
    '🔍 プロジェクト名で検索...':         '🔍 Search projects...',

    // ビュータブ
    '☰ リスト':                          '☰ List',
    '📋 カンバン':                        '📋 Kanban',
    '📉 バーンダウン':                   '📉 Burndown',
    '📊 ガント':                          '📊 Gantt',

    // リストビュー
    '未完了':                             'Open',
    '完了':                               'Done',
    '全て':                               'All',
    'すべて':                             'All',
    'タイトル':                           'Title',
    'ステータス':                         'Status',
    '担当者':                             'Assignee',
    '開始日':                             'Start',
    '期限':                               'Due',
    '未割り当て':                         'Unassigned',
    'タスクはありません':                 'No tasks',
    'タスクなし':                         'No tasks',

    // カンバン
    '進行中':                             'In Progress',
    'レビュー':                           'Review',
    '＋ タスクを追加':                    '＋ Add Task',

    // バーンダウン
    'バーンダウンチャート（ストーリーポイント）': 'Burndown Chart (Story Points)',
    '残SP':                               'Remaining SP',
    '完了SP':                             'Done SP',
    '総SP':                               'Total SP',
    '進捗率':                             'Progress',
    '完了塗り':                           'Done Fill',

    // ガント
    '表示範囲:':                          'Range:',
    '1ヶ月':                             '1 Month',
    '3ヶ月':                             '3 Months',
    '6ヶ月':                             '6 Months',
    '1年':                               '1 Year',
    '今日から':                           'From Today',
    'プロジェクト開始から':               'From Start',
    'タスク表示':                         'Show Tasks',
    'イナズマ線':                         'Progress Line',
    'ナビゲーション':                     'Navigation',
    'タスクバー':                         'Task Bar',
    'マイルストーン / タスク':            'Milestone / Task',
    'イナズマ線（実績進捗）':             'Progress Line',
    '今日線':                             'Today Line',
    '完了日':                             'Completion',
    'タスク進捗詳細':                     'Task Progress',
    'マイルストーンはありません':         'No milestones',

    // Wiki
    'Wikiがまだありません':               'No wiki content yet',
    '「✏️ 編集」をクリックして記述を始めましょう': 'Click "✏️ Edit" to start writing',
    '目次':                               'Table of Contents',
    '見出しがありません':                 'No headings',
    '✏️ 編集':                           '✏️ Edit',
    '👁 プレビュー':                      '👁 Preview',

    // タスク詳細パネル
    '🔗 URLコピー':                       '🔗 Copy URL',
    '詳細':                               'Details',
    '(Markdown対応)':                     '(Markdown supported)',
    '**太字** *斜体* `コード`':           '**bold** *italic* `code`',
    'チェックリスト':                     'Checklist',
    '項目を追加... (Enterで追加)':        'Add item... (Enter to add)',
    '追加':                               'Add',
    'コメント / アクティビティ':          'Comments / Activity',
    '💬 コメントのみ':                    '💬 Comments Only',
    '🔄 アクティビティのみ':              '🔄 Activity Only',
    'コメントを投稿':                     'Post Comment',
    '投稿者名':                           'Author',
    'コメントをMarkdownで入力...':        'Write a comment in Markdown...',
    '操作':                               'Actions',
    '🗑 タスクを削除':                    '🗑 Delete Task',
    '保存':                               'Save',
    'キャンセル':                         'Cancel',
    '✓ 完了日':                           '✓ Completed',
    '未設定':                             'Not set',
    'ラベル':                             'Labels',
    'ラベルを追加...':                    'Add label...',
    '編集':                               'Edit',
    'プレビュー':                         'Preview',
    '詳細をMarkdownで記述...':            'Describe in Markdown...',

    // タスク追加モーダル
    'タスクを追加':                       'Add Task',
    'タイトル *':                         'Title *',
    'タスクのタイトル':                   'Task title',
    'ストーリーポイント':                 'Story Points',
    '担当者名':                           'Assignee name',
    'マイルストーン':                     'Milestone',
    '未設定':                             'None',

    // プロジェクト設定モーダル
    '新規プロジェクト':                   'New Project',
    'プロジェクト名 *':                   'Project Name *',
    '例: Webアプリリニューアル':          'e.g. Web App Renewal',
    '説明':                               'Description',
    'メンバー（カンマ区切り）':           'Members (comma-separated)',
    '例: 田中, 鈴木, 佐藤':              'e.g. Alice, Bob, Carol',
    'プロジェクトカラー':                 'Project Color',
    '終了日':                             'End Date',
    '閉じる':                             'Close',

    // マイルストーン
    '🏁 マイルストーン管理':              '🏁 Milestone Management',
    'マイルストーン管理':                 'Milestone Management',
    '新規マイルストーン':                 'New Milestone',
    '＋ マイルストーンを追加':            '＋ Add Milestone',
    '名前 *':                             'Name *',
    'カラー':                             'Color',
    'マイルストーンの説明...':            'Milestone description...',
    '例: v1.0リリース':                  'e.g. v1.0 Release',
    '✏️ 自分の変更':                      '✏️ My Changes',

    // 競合ダイアログ
    '保存競合が検出されました':           'Save Conflict Detected',
    'すべて自分を残す':                   'Keep All Mine',
    'すべて相手を残す':                   'Keep All Theirs',
    '👤 相手の変更':                      '👤 Their Changes',
    '保存を完了する':                     'Complete Save',

    // ステータス
    'To Do':                              'To Do',
    '未接続':                             'Disconnected',

    // その他
    'タスク':                             'Task',
    // Wiki placeholder（改行は\nで記述）
    '# プロジェクト概要\n\nここにWikiをMarkdownで記述してください。\n\n## 目的\n\n## アーキテクチャ\n\n## 開発環境のセットアップ':
      '# Project Overview\n\nWrite your Wiki in Markdown here.\n\n## Purpose\n\n## Architecture\n\n## Development Setup',
    '前回のファイル':                     'Last File',
  };

  // ── 現在の言語 ────────────────────────────────────────
  let _lang = 'ja';
  try { _lang = localStorage.getItem(STORAGE_KEY) || 'ja'; } catch (e) {}

  // ── テキストノードを再帰的に翻訳 ─────────────────────
  function translateNode(node) {
    if (_lang === 'ja') return; // 日本語はそのまま
    if (node.nodeType === Node.TEXT_NODE) {
      const original = node.textContent;
      const trimmed = original.trim();
      if (DICT[trimmed]) {
        node.textContent = original.replace(trimmed, DICT[trimmed]);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // placeholder の翻訳
      if (node.placeholder && DICT[node.placeholder]) {
        node.placeholder = DICT[node.placeholder];
      }
      // title 属性（ツールチップ）は意図的にスキップ（動的生成のため）
      node.childNodes.forEach(translateNode);
    }
  }

  function translateAll() {
    if (_lang === 'ja') return;
    translateNode(document.body);
    // welcome-info はJSで動的に書き換えられるため個別対応
    const wi = document.querySelector('.welcome-info');
    if (wi) {
      wi.innerHTML = wi.innerHTML
        .replace('をご使用ください。', 'Please use Chrome or Edge.')
        .replace('でご使用ください。', 'Please use Chrome or Edge.')
        .replace('File System Access API が使用できません', 'File System Access API is not supported')
        .replace('このシステムは', 'This app requires')
        .replace(' または ', ' or ');
    }
  }

  // ── MutationObserver で動的レンダリング後も自動翻訳 ──
  let _observer = null;
  function startObserver() {
    if (_observer) _observer.disconnect();
    if (_lang === 'ja') return;
    _observer = new MutationObserver((mutations) => {
      mutations.forEach(m => {
        m.addedNodes.forEach(n => translateNode(n));
      });
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  // ── 言語切り替え ──────────────────────────────────────
  function setLang(lang) {
    _lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    // ページリロードが最も確実（再レンダリングですべてに適用）
    location.reload();
  }

  // ── ヘッダーに言語切り替えボタンを追加 ───────────────
  function injectLangButton() {
    if (document.getElementById('lang-toggle')) return;
    const btn = document.createElement('button');
    btn.id = 'lang-toggle';
    btn.style.cssText = [
      'background:var(--surface2);border:1px solid var(--border);',
      'color:var(--text);padding:5px 10px;border-radius:var(--radius);',
      'font-size:13px;cursor:pointer;font-family:inherit;',
      'display:flex;align-items:center;gap:5px;',
    ].join('');
    btn.innerHTML = _lang === 'ja' ? '🌐 English' : '🌐 日本語';
    btn.title = _lang === 'ja' ? 'Switch to English' : '日本語に切り替え';
    btn.onclick = () => setLang(_lang === 'ja' ? 'en' : 'ja');

    // ヘッダーのテーマボタンの隣に挿入
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn && themeBtn.parentNode) {
      themeBtn.parentNode.insertBefore(btn, themeBtn);
    } else {
      // ヘッダーが見つからない場合は body 右上に固定
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.right = '10px';
      btn.style.zIndex = '9999';
      document.body.appendChild(btn);
    }
  }

  // ── プロジェクト一覧ページにも言語ボタンを追加 ────────
  // loader 画面（ファイル選択画面）にも表示したいため early injection も行う
  function earlyInject() {
    // loader 画面のボタンエリアに追加
    const loaderBtns = document.querySelector('.loader-card');
    if (loaderBtns && !document.getElementById('lang-toggle-loader')) {
      const btn = document.createElement('button');
      btn.id = 'lang-toggle-loader';
      btn.style.cssText = [
        'background:var(--surface2);border:1px solid var(--border);',
        'color:var(--muted);padding:5px 14px;border-radius:var(--radius);',
        'font-size:12px;cursor:pointer;font-family:inherit;margin-top:12px',
      ].join('');
      btn.textContent = _lang === 'ja' ? '🌐 Switch to English' : '🌐 日本語に切り替え';
      btn.onclick = () => setLang(_lang === 'ja' ? 'en' : 'ja');
      loaderBtns.appendChild(btn);
    }
  }

  // ── 初期化 ────────────────────────────────────────────
  function init() {
    injectLangButton();
    earlyInject();
    if (_lang !== 'ja') {
      translateAll();
      startObserver();
    }
  }

  // アクティビティ翻訳（英語モード時のみセットアップ）
  if (_lang !== 'ja') {

  // ── アクティビティテキストの翻訳 ─────────────────────────────
  // アクティビティのテキストはJSONに保存された日本語文字列のため
  // DOMに描画された後に正規表現でパターンマッチして英語に変換する

  // パターン: [正規表現, 英語テンプレート関数]
  // キャプチャグループが引数として渡される
  const ACTIVITY_PATTERNS = [
    // ステータス変更: ステータスを <b>A</b> → <b>B</b> に変更
    [/^ステータスを (<b>.+?<\/b>) → (<b>.+?<\/b>) に変更$/, (_, a, b) => `Changed status from ${a} to ${b}`],
    // 担当者変更: 担当者を <b>A</b> に変更 （元: <b>B</b>）
    [/^担当者を (<b>.+?<\/b>) に変更（元: (<b>.+?<\/b>)）$/, (_, a, b) => `Changed assignee to ${a} (was ${b})`],
    [/^担当者を (<b>.+?<\/b>) に変更$/, (_, a) => `Changed assignee to ${a}`],
    // 担当者解除: 担当者を解除（元: <b>A</b>）
    [/^担当者を解除（元: (<b>.+?<\/b>)）$/, (_, a) => `Removed assignee (was ${a})`],
    // 期限変更: 期限を <b>A</b> → <b>B</b> に変更
    [/^期限を (<b>.+?<\/b>) → (<b>.+?<\/b>) に変更$/, (_, a, b) => `Changed due date from ${a} to ${b}`],
    // 詳細更新
    [/^詳細内容を更新$/, () => 'Updated description'],
    // チェックリスト追加: チェックリストに追加: <b>A</b>
    [/^チェックリストに追加: (<b>.+?<\/b>)$/, (_, a) => `Added to checklist: ${a}`],
    // チェックリスト削除: チェックリスト削除: <b>A</b>
    [/^チェックリスト削除: (<b>.+?<\/b>)$/, (_, a) => `Removed from checklist: ${a}`],
    // チェック付けた: <b>A</b> にチェックを付けた
    [/^(<b>.+?<\/b>) にチェックを付けた$/, (_, a) => `Checked ${a}`],
    // チェック外した: <b>A</b> のチェックを外した
    [/^(<b>.+?<\/b>) のチェックを外した$/, (_, a) => `Unchecked ${a}`],
  ];

  function translateActivityText(html) {
    for (const [re, fn] of ACTIVITY_PATTERNS) {
      const m = html.match(re);
      if (m) return fn(...m);
    }
    return html; // マッチしなければそのまま
  }

  // renderTimeline が描画した後に activity-text を翻訳する
  function translateActivityNodes() {
    document.querySelectorAll('.activity-text').forEach(el => {
      el.innerHTML = translateActivityText(el.innerHTML);
    });
    // 空メッセージ（「まだ履歴がありません」等）
    const EMPTY_MSGS = {
      'コメントはまだありません':     'No comments yet',
      'アクティビティはまだありません': 'No activity yet',
      'まだ履歴がありません':          'No history yet',
    };
    document.querySelectorAll('#comment-list > div').forEach(el => {
      const t = el.textContent.trim();
      if (EMPTY_MSGS[t]) el.textContent = EMPTY_MSGS[t];
    });
  }

  // task-open / task-save / task-panel-close のたびに翻訳
  if (window.TaskFlow) {
    TaskFlow.on('task-open',        () => setTimeout(translateActivityNodes, 150));
    TaskFlow.on('task-save',        () => setTimeout(translateActivityNodes, 50));
    TaskFlow.on('task-panel-close', () => {});
  }
  document.addEventListener('taskflow-ready', function () {
    // comment-list の直接の子要素（アイテム行）の追加のみ監視する
    // subtree:true にすると translateActivityNodes の innerHTML 書き換えも
    // 検知してしまい無限ループになるため childList のみ使用
    const target = document.getElementById('comment-list');
    if (target) {
      new MutationObserver(() => {
        if (_lang !== 'ja') translateActivityNodes();
      }).observe(target, { childList: true });
    }
  });
  }

  // TaskFlow 準備完了後に実行
  if (window.TaskFlow) {
    window.TaskFlow.on('ready', init);
  }
  document.addEventListener('taskflow-ready', init);

  // DOM が早期に揃っている場合は即時実行（loader 画面対応）
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      earlyInject();
      if (_lang !== 'ja') translateAll();
    });
  } else {
    earlyInject();
    if (_lang !== 'ja') {
      translateAll();
      startObserver();
    }
  }

  // 公開API（他プラグインから利用可能）
  window.TaskFlowLang = {
    get: () => _lang,
    set: setLang,
    t: (key) => (_lang !== 'ja' && DICT[key]) ? DICT[key] : key,
    addDict: (entries) => Object.assign(DICT, entries), // 辞書の拡張
  };

  console.log('[plugin_lang] loaded, lang=' + _lang);

})();

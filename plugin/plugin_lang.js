// ================================================================
//  plugin_lang.js  - TaskFlow 言語切り替えプラグイン
//  taskflow.html と同じフォルダに置くと自動で読み込まれます
// ================================================================

(function () {
  'use strict';

  const STORAGE_KEY = 'taskflow_lang';

  // ── 英語月名 ─────────────────────────────────────────────
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // ── 翻訳辞書（完全一致） ──────────────────────────────────
  const DICT = {
    // ── ヘッダー / 起動画面 ─────────────────────────────────
    'プロジェクト管理システム':           'Project Management',
    '☀️ ライト':                          '☀️ Light',
    '🌙 ダーク':                          '🌙 Dark',
    '💾 保存':                            '💾 Save',
    'File System Access API が使用できません': 'File System Access API is not supported',
    'このシステムは':                     'This app requires',
    'または':                             'or',
    '↩ 開く':                            '↩ Open',
    '✨ 新規作成':                        '✨ New File',
    '新規作成':                           'New File',
    '✅ アクセス許可あり':                '✅ Access granted',
    '🔑 許可が必要':                      '🔑 Permission required',
    '↩ すぐに開く':                      '↩ Open Now',
    '別のファイルを開く':                 'Open Another File',
    '📂 フォルダ変更':                    '📂 Change Folder',
    '📂 別のフォルダを開く':              '📂 Open Another Folder',
    'データフォルダを選択':               'Select Data Folder',
    '以降の変更はプロジェクト単位で自動保存されます。': 'Changes are auto-saved per project.',
    '🔄 更新':                            '🔄 Refresh',
    '読み込み中...':                      'Loading...',
    'フォルダ履歴':                       'Folder History',
    '📁 フォルダ履歴':                    '📁 Folder History',
    'すべて削除':                         'Clear All',
    '履歴がありません':                   'No history',
    'をご使用ください。':                 'Please use Chrome or Edge.',

    // ── サイドバー ──────────────────────────────────────────
    'ナビゲーション':                     'Navigation',
    'すべてのプロジェクト':               'All Projects',
    'プロジェクト一覧':                   'Project List',
    '進行中のプロジェクトがありません':   'No active projects',
    'マイタスク':                         'My Tasks',
    '👤 マイタスク':                      '👤 My Tasks',

    // ── マイタスクビュー ────────────────────────────────────
    '自分への通知・担当タスクを一覧表示': 'View mentions and assigned tasks',
    '自分:':                              'Me:',
    '-- 選択してください --':             '-- Select --',
    '💬 メンション':                      '💬 Mentions',
    '📋 担当タスク':                      '📋 Assigned Tasks',
    '📊 アクティビティ':                  '📊 Activity',
    'プロジェクト: 全て':                  'Project: All',
    '完了以外':                           'Excluding Done',

    // ── アクティビティタブ（統計カード）────────────────────
    '過去1年のアクティビティ':            'Activities (past year)',
    'アクティブ日数':                     'Active Days',
    '現在の連続日数':                     'Current Streak',
    '最長連続日数':                       'Longest Streak',
    'この日のアクティビティはありません': 'No activity for this day',
    'セルをクリックして日付ごとの詳細を表示': 'Click a cell to view daily details',
    'クリックで詳細表示':                 'Click for details',
    '少ない':                             'Less',
    '多い':                               'More',

    // ── 月名（ヒートマップ・短形式）───────────────────────
    '1月':  'Jan',  '2月':  'Feb',  '3月':  'Mar',  '4月':  'Apr',
    '5月':  'May',  '6月':  'Jun',  '7月':  'Jul',  '8月':  'Aug',
    '9月':  'Sep',  '10月': 'Oct',  '11月': 'Nov',  '12月': 'Dec',

    // ── プロジェクト一覧 ────────────────────────────────────
    '＋ 新規プロジェクト':               '＋ New Project',
    '並び順: 番号':                       'Sort: Number',
    '並び順: 名前':                       'Sort: Name',
    '並び順: 作成日':                     'Sort: Date',
    '並び順: 進捗率':                     'Sort: Progress',
    'プロジェクトがありません':           'No projects yet',
    '「＋ 新規プロジェクト」から始めましょう': 'Click "＋ New Project" to get started',
    'プロジェクト':                       'Project',
    '📦 完了':                            '📦 Archive',
    '完了済みプロジェクト':               'Archived Projects',
    '♻️ 未完了に戻す':                    '♻️ Unarchive',
    '未完了に戻す':                       'Unarchive',
    '完了にする':                         'Archive',

    // ── プロジェクトヘッダー / フィルター ────────────────────
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

    // ── ビュータブ ──────────────────────────────────────────
    '☰ リスト':                          '☰ List',
    '📋 カンバン':                        '📋 Kanban',
    '📉 バーンダウン':                   '📉 Burndown',
    '📊 ガント':                          '📊 Gantt',
    '📖 Wiki':                            '📖 Wiki',

    // ── リストビュー ────────────────────────────────────────
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
    'チェックリスト':                     'Checklist',
    '見積(h)':                           'Est.(h)',
    '実績(h)':                           'Actual(h)',

    // ── カンバン ────────────────────────────────────────────
    '進行中':                             'In Progress',
    'レビュー':                           'Review',
    '＋ タスクを追加':                    '＋ Add Task',

    // ── バーンダウン ────────────────────────────────────────
    'バーンダウンチャート（ストーリーポイント）': 'Burndown Chart (Story Points)',
    '残SP':                               'Remaining SP',
    '完了SP':                             'Done SP',
    '総SP':                               'Total SP',
    '進捗率':                             'Progress',
    '完了塗り':                           'Done Fill',

    // ── ガント ──────────────────────────────────────────────
    '表示範囲:':                          'Range:',
    '1ヶ月':                             '1 Month',
    '3ヶ月':                             '3 Months',
    '6ヶ月':                             '6 Months',
    '1年':                               '1 Year',
    '今日から':                           'From Today',
    'プロジェクト開始から':               'From Start',
    'タスク表示':                         'Show Tasks',
    'イナズマ線':                         'Progress Line',
    'マイルストーン / タスク':            'Milestone / Task',
    'イナズマ線（実績進捗）':             'Progress Line',
    '今日線':                             'Today Line',
    'タスクバー':                         'Task Bar',
    '完了日':                             'Completion',
    'タスク進捗詳細':                     'Task Progress',
    'マイルストーンはありません':         'No milestones',
    '今日':                               'Today',

    // ── Wiki ────────────────────────────────────────────────
    'Wikiがまだありません':               'No wiki content yet',
    '「✏️ 編集」をクリックして記述を始めましょう': 'Click "✏️ Edit" to start writing',
    '目次':                               'Table of Contents',
    '見出しがありません':                 'No headings',
    '✏️ 編集':                           '✏️ Edit',
    '👁 プレビュー':                      '👁 Preview',

    // ── タスク詳細パネル ────────────────────────────────────
    '🔗 URLコピー':                       '🔗 Copy URL',
    '詳細':                               'Details',
    '(Markdown対応)':                     '(Markdown supported)',
    'コメント / アクティビティ':          'Comments / Activity',
    '💬 コメントのみ':                    '💬 Comments Only',
    '🔄 アクティビティのみ':              '🔄 Activity Only',
    'コメントを投稿':                     'Post Comment',
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
    '更新する':                           'Update',
    '保存済み ✓':                        'Saved ✓',

    // ── プレースホルダー / 入力 ──────────────────────────────
    '投稿者名':                           'Author name',
    '担当者名':                           'Assignee name',
    'コメントをMarkdownで入力...':        'Write a comment in Markdown...',
    'このURLをコピーしてください:':       'Please copy this URL:',

    // ── 工数入力 ────────────────────────────────────────────
    '工数 (h)':                           'Hours (h)',
    '工数入力（どちらか一方でも可）':     'Log Hours (either field optional)',
    '投稿時にタスクへ加算されます':       'Accumulated to task on submit',
    '＋ 工数を追加':                      '＋ Add Hours',
    '✕ 工数をキャンセル':                 '✕ Cancel Hours',
    '見積 (h)':                           'Est. (h)',
    '実績 (h)':                           'Actual (h)',

    // ── タスク追加モーダル ──────────────────────────────────
    'タスクを追加':                       'Add Task',
    'タイトル *':                         'Title *',
    'タスクのタイトル':                   'Task title',
    'ストーリーポイント':                 'Story Points',
    '作成者':                             'Creator',
    '作成者名':                           'Creator name',
    'マイルストーン':                     'Milestone',
    'タスクの詳細をMarkdownで記述できます...': 'Describe the task in Markdown...',
    '＋ 項目追加':                        '+ Add item',
    'チェック項目を入力して Enter':       'Enter item and press Enter',
    'ラベルを入力して Enter':             'Enter label and press Enter',

    // ── プロジェクト設定モーダル ────────────────────────────
    '新規プロジェクト':                   'New Project',
    'プロジェクト名 *':                   'Project Name *',
    '例: Webアプリリニューアル':          'e.g. Web App Renewal',
    '説明':                               'Description',
    'メンバー（カンマ区切り）':           'Members (comma-separated)',
    '例: 田中, 鈴木, 佐藤':              'e.g. Alice, Bob, Carol',
    'プロジェクトカラー':                 'Project Color',
    '終了日':                             'End Date',
    '閉じる':                             'Close',

    // ── マイルストーン ──────────────────────────────────────
    'マイルストーン管理':                 'Milestone Management',
    '新規マイルストーン':                 'New Milestone',
    '＋ マイルストーンを追加':            '＋ Add Milestone',
    '名前 *':                             'Name *',
    'カラー':                             'Color',
    'マイルストーンの説明...':            'Milestone description...',
    '例: v1.0リリース':                  'e.g. v1.0 Release',
    '✏️ 自分の変更':                      '✏️ My Changes',

    // ── プラグイン管理UI ────────────────────────────────────
    'プラグイン管理':                     'Plugin Manager',
    '🔌 プラグイン管理':                  '🔌 Plugin Manager',
    'インストール済み':                   'Installed',
    'プラグインを追加':                   'Add Plugin',
    'プラグインがありません':             'No plugins installed',
    'JSファイルをここにドロップ':         'Drop JS file here',
    'ファイルを選択':                     'Choose File',
    'インストール中...':                  'Installing...',
    '保存中...':                          'Saving...',
    '💾 保存して反映':                    '💾 Save & Reload',
    '変更後はページをリロードして反映':   'Save & reload to apply changes',
    'plugins.js を保存しました。ページをリロードして反映してください。':
      'plugins.js saved. Reload the page to apply changes.',
    '⠿ ドラッグで読み込み順を変更できます。削除してもJSファイルは残ります。':
      '⠿ Drag to reorder. Removing from list keeps the JS file.',

    // ── 競合ダイアログ ──────────────────────────────────────
    '保存競合が検出されました':           'Save Conflict Detected',
    'すべて自分を残す':                   'Keep All Mine',
    'すべて相手を残す':                   'Keep All Theirs',
    '👤 相手の変更':                      '👤 Their Changes',
    '保存を完了する':                     'Complete Save',

    // ── ステータス ──────────────────────────────────────────
    'To Do':                              'To Do',
    '未接続':                             'Disconnected',

    // ── ツールチップ / トースト ──────────────────────────────
    '昨日':                               'Yesterday',
    'TOPへ戻る':                          'Back to Top',
    '他のメンバーの変更を取得':           'Fetch latest changes',
    'ドラッグで幅を変更':                 'Drag to resize',
    'このタスクのURLをコピー':            'Copy task URL',
    'このコメントのURLをコピー':          'Copy comment URL',
    'コメントリンクをコピー':             'Copy comment link',
    'ドラッグで並び替え':                 'Drag to reorder',
    'クリックで編集':                     'Click to edit',
    '作成から24時間以内のみ編集できます': 'Editable within 24h of creation',
    'ファイル・画像を添付':               'Attach file / image',
    '太字 (Ctrl+B)':                      'Bold (Ctrl+B)',
    '斜体 (Ctrl+I)':                      'Italic (Ctrl+I)',
    'インラインコード':                   'Inline code',
    'リスト':                             'List',
    '見出し':                             'Heading',
    '削除':                               'Delete',

    '保存しました':                       'Saved',
    '保存しました（他の変更を自動マージ）': 'Saved (auto-merged changes)',
    '保存しました（競合を解決）':         'Saved (conflict resolved)',
    '保存に失敗しました':                 'Save failed',
    '新規ファイルを作成しました':         'New file created',
    'フォルダを開けませんでした':         'Could not open folder',
    'アクセスが拒否されました':           'Access denied',
    '既に最新です':                       'Already up to date',
    '更新に失敗しました':                 'Update failed',
    'マイルストーンを更新しました':       'Milestone updated',
    'マイルストーンを追加しました':       'Milestone added',
    'マイルストーンを削除しました':       'Milestone deleted',
    'マイルストーンを並び替えました':     'Milestones reordered',
    'プロジェクトを更新しました':         'Project updated',
    'プロジェクトを作成しました':         'Project created',
    'プロジェクトを削除しました':         'Project deleted',
    'コメントを投稿しました':             'Comment posted',
    'コメントと工数を投稿しました':       'Comment & hours posted',
    'コメントを更新しました':             'Comment updated',
    'タスクを削除しました':               'Task deleted',
    '日付を更新しました':                 'Date updated',
    'リンクをコピーしました':             'Link copied',
    'Wiki を保存しました':               'Wiki saved',
    '旧形式を検出しました。次回保存時に分割形式へ移行します。': 'Legacy format detected. Will migrate on next save.',
    '分割形式への移行が完了しました':     'Migration to split format complete',
    '競合の解決をキャンセルしました。再度保存するまで変更は反映されません。': 'Conflict resolution cancelled. Changes won\'t apply until you save again.',
    'プロジェクトを選択してください':     'Please select a project',
    '.js ファイルをドロップしてください': 'Please drop a .js file',
    'フォルダが設定されていません。一度モーダルを閉じて再度開いてください': 'No folder set. Close and reopen the modal.',
    'フォルダが選択されていません':       'No folder selected',

    // ── UI・ラベル（単体） / 空の状態 / 確認 ────────────────
    '見積':                               'Est.',
    '実績':                               'Actual',
    '追加':                               'Add',
    '項目を追加... (Enterで追加)':        'Add item... (Press Enter)',
    '読み込み中…':                        'Loading...',
    '匿名':                               'Anonymous',
    '名無し':                             'Anonymous',
    '（なし）':                           '(None)',
    '（空）':                             '(Empty)',
    '（見つかりません）':                 '(Not found)',
    'はい':                               'Yes',
    'いいえ':                             'No',
    'マイルストーンを編集':               'Edit Milestone',
    'プロジェクトを編集':                 'Edit Project',
    '上の「自分」で自分の名前を選択してください。': 'Please select your name from "Me" above.',
    'メンションはありません':             'No mentions',
    '担当タスクはありません':             'No assigned tasks',
    '履歴を削除しました':                 'History cleared',
    '保存されたフォルダがありません':     'No saved folders',
    '履歴が見つかりません':               'History not found',
    'ファイルを作成できませんでした':     'Could not create file',
    'フォルダが開かれていません':         'No folder opened',
    '保存中です。しばらくお待ちください': 'Saving... Please wait',
    '名前を入力してください':             'Please enter a name',
    'プロジェクト名を入力してください':   'Please enter a project name',
    'タイトルを入力してください':         'Please enter a title',
    'コメントを入力してください':         'Please enter a comment',
    '画像を保存中...':                    'Saving image...',
    '画像を貼り付けました':               'Image pasted',
    'ファイルを保存中...':                'Saving file...',
    '🔄 更新中...':                       '🔄 Refreshing...',

    // ── 確認ダイアログ（confirm）────────────────────────────
    '変更が保存されていません。TOPに戻りますか？': 'Unsaved changes. Return to TOP?',
    'フォルダ履歴をすべて削除しますか？': 'Clear all folder history?',
    'このマイルストーンを削除しますか？\n（タスクの割り当ては解除されます）': 'Delete this milestone?\n(Task assignments will be removed)',
    '変更が保存されていません。閉じますか？': 'Unsaved changes. Close anyway?',
    'このタスクを削除しますか？': 'Delete this task?',
    'このコメントを削除しますか？\n工数が登録されている場合は合計から減算されます。': 'Delete this comment?\nLogged hours will be deducted.',
    'Wikiの変更が保存されていません。切り替えますか？\n（「キャンセル」で編集を続けられます）': 'Unsaved Wiki changes. Switch views?\n(Click "Cancel" to continue editing)',

    // ── その他 ──────────────────────────────────────────────
    'タスク':                             'Task',
    '# プロジェクト概要\n\nここにWikiをMarkdownで記述してください。\n\n## 目的\n\n## アーキテクチャ\n\n## 開発環境のセットアップ':
      '# Project Overview\n\nWrite your Wiki in Markdown here.\n\n## Purpose\n\n## Architecture\n\n## Development Setup',
  };

  let _lang = 'ja';
  try { _lang = localStorage.getItem(STORAGE_KEY) || 'ja'; } catch (e) {}

  // ── 動的文字列の正規表現翻訳 ─────────────────────────────
  function translateDynamic(text) {
    if (!text) return text;
    let s = text;

    // トースト / ダイアログ関連
    s = s.replace(/^フォルダを読み込みました: (.+)$/, 'Folder loaded: $1');
    s = s.replace(/^フォルダを開きました: (.+)$/, 'Folder opened: $1');
    s = s.replace(/^競合コピー (\d+) 件を自動マージしました$/, '$1 conflict copies auto-merged');
    s = s.replace(/^競合コピー (\d+) 件に手動解決が必要です$/, '$1 conflicts need manual resolution');
    s = s.replace(/^更新しました（(\d+)件のプロジェクトに変更あり）$/, 'Updated ($1 projects changed)');
    s = s.replace(/^タスク #(\d+) を追加しました$/, 'Task #$1 added');
    s = s.replace(/^#(\d+) を「(.+)」に移動$/, '#$1 moved to "$2"');
    s = s.replace(/^「(.+)」を完了にしました$/, '"$1" archived');
    s = s.replace(/^「(.+)」を未完了に戻しました$/, '"$1" unarchived');
    s = s.replace(/^(C\d+) のURLをコピーしました$/, '$1 URL copied');
    s = s.replace(/^⚠️ (\d+)件の競合があります — Ctrl\+S で解決してください$/, '⚠️ $1 conflicts — press Ctrl+S to resolve');
    s = s.replace(/^(.+) を添付しました$/, '$1 attached');
    s = s.replace(/^(.+) をインストールしました$/, '$1 installed');
    s = s.replace(/^ 保存中\.\.\.$/, ' Saving...');
    s = s.replace(/^インストール失敗: (.+)$/, 'Install failed: $1');
    s = s.replace(/^保存失敗: (.+)$/, 'Save failed: $1');
    s = s.replace(/^#(\d+) を作成しました$/, '#$1 created');
    s = s.replace(/^マイルストーン → (.+) に変更$/, 'Milestone → $1 changed');
    s = s.replace(/^貼り付けに失敗しました: (.+)$/, 'Paste failed: $1');
    s = s.replace(/^添付に失敗しました: (.+)$/, 'Attachment failed: $1');
    s = s.replace(/^プロジェクト P(\d+) が見つかりません$/, 'Project P$1 not found');
    s = s.replace(/^タスク #(\d+) が見つかりません$/, 'Task #$1 not found');
    s = s.replace(/^「(.+)」フォルダを開いてから再度URLにアクセスしてください$/, 'Please open the "$1" folder and access the URL again');
    s = s.replace(/^フォルダが違います（必要: (.+)、現在: (.+)）$/, 'Wrong folder (Required: $1, Current: $2)');
    s = s.replace(/^<strong>(.+)<\/strong> フォルダへのリンクから来ています。<br>下の履歴または「別のフォルダを開く」から <strong>(.+)<\/strong> を選択してください。$/, 'You followed a link to the <strong>$1</strong> folder.<br>Select <strong>$2</strong> from history or "Open Another Folder".');
    s = s.replace(/^（ファイルが見つかりません: (.+)）$/, '(File not found: $1)');
    s = s.replace(/^フォルダ「(.+)」が必要です$/, 'Folder "$1" is required');
    s = s.replace(/^「(.+)」フォルダを開いてください$/, 'Please open the "$1" folder');
    s = s.replace(/^「(.+)」を削除しますか？$/, 'Delete "$1"?');
    s = s.replace(/^"(.+)" をプラグインリストから削除しますか？\n（JSファイルは削除されません）$/, 'Remove "$1" from plugin list?\n(JS file will not be deleted)');
    
    // UI コンテンツ関連
    s = s.replace(/完了済みプロジェクト（(\d+)件）/g, 'Archived Projects ($1)');
    s = s.replace(/(\d+) 進行中 \/ (\d+) 完了/g, '$1 Active / $2 Archived');
    s = s.replace(/(\d+)件のアクティビティ/g, '$1 activities');
    s = s.replace(/ — (\d+)件のアクティビティ$/, ' — $1 activities');
    s = s.replace(/(\d{4})\/(\d+)月/g, function(_, year, month) {
      return (MONTHS_EN[parseInt(month, 10) - 1] || month) + ' ' + year;
    });
    s = s.replace(/期限:(\d{4}\/\d+\/\d+)/g, 'Due: $1');
    s = s.replace(/^編集済み (.+)$/, 'Edited $1');
    s = s.replace(/^今日 (\d+:\d+)$/, 'Today $1');
    s = s.replace(/(\d+)日前/g, '$1 days ago');
    s = s.replace(/^(\d+)件すべて選択済み$/, 'All $1 selected');
    s = s.replace(/^未選択: (\d+)件$/, '$1 unselected');
    s = s.replace(/^(\d+)\/(\d+)完了$/, '$1/$2 Done');
    s = s.replace(/^(\d+) \/ (\d+) 完了 \((.+)\)$/, '$1 / $2 Done ($3)');
    s = s.replace(/^リンク先のタスクを表示するには、<br><strong style="color:var\(--accent2\)">(.+)<\/strong> フォルダを選択する必要があります。$/, 'To view the linked task, you need to select the <br><strong style="color:var(--accent2)">$1</strong> folder.');
    s = s.replace(/見積 ([\d.]+)h/g, 'Est $1h').replace(/実績 ([\d.]+)h/g, 'Act $1h');
    
    // 汎用カウンター
    s = s.replace(/^(\d+)日$/, '$1 days');
    s = s.replace(/(\d+)件/g, '$1');

    return s;
  }

  // ── グローバル翻訳関数 ────────────────────────────────
  const t = (key) => {
    if (_lang === 'ja' || !key) return key;
    if (DICT[key]) return DICT[key];
    const dyn = translateDynamic(key);
    return dyn !== key ? dyn : key;
  };

  // ── グローバル関数のフック（ネイティブダイアログとグラフ対応）──
  if (_lang !== 'ja') {
    // Confirm / Prompt
    const origConfirm = window.confirm;
    window.confirm = function(msg) { return origConfirm(t(msg)); };

    const origPrompt = window.prompt;
    window.prompt = function(msg, def) { return origPrompt(t(msg), def); };

    // Toast
    if (typeof window.toast === 'function') {
      const origToast = window.toast;
      window.toast = function(msg, type) { origToast(t(msg), type); };
    }

    // Chart.js (バーンダウンチャート用)
    if (typeof window.Chart !== 'undefined') {
      const origChart = window.Chart;
      window.Chart = function(ctx, config) {
        if (config && config.data && config.data.datasets) {
          config.data.datasets.forEach(ds => {
            if (ds.label === '理想線') ds.label = 'Ideal';
            if (ds.label === '実績') ds.label = 'Actual';
          });
        }
        if (config && config.options?.scales?.y?.title?.text === 'ストーリーポイント') {
          config.options.scales.y.title.text = 'Story Points';
        }
        return new origChart(ctx, config);
      };
    }
  }

  // ── テキストノードを再帰的に翻訳 ─────────────────────────
  function translateNode(node) {
    if (_lang === 'ja') return;
    if (node.nodeType === Node.TEXT_NODE) {
      const original = node.textContent;
      const trimmed  = original.trim();
      if (!trimmed) return;
      
      const translated = t(trimmed);
      if (translated !== trimmed) {
        node.textContent = original.replace(trimmed, translated);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.placeholder) node.placeholder = t(node.placeholder);
      if (node.title) node.title = t(node.title.trim());
      node.childNodes.forEach(translateNode);
    }
  }

  function translateAll() {
    if (_lang === 'ja') return;
    translateNode(document.body);

    const subtitle = document.querySelector('.loader-subtitle');
    if (subtitle && subtitle.innerHTML.includes('データを保存するフォルダ')) {
      subtitle.innerHTML = 'Open a folder to store your data, or<br>create a new one.<br>Changes are auto-saved per project.';
    }

    const wi = document.querySelector('.welcome-info');
    if (wi && wi.innerHTML.includes('フォルダ履歴')) {
      wi.innerHTML =
        '💡 Use <strong>Chrome / Edge</strong>.<br>' +
        '<strong>Folder History</strong>: Instantly reopen from browser cache<br>' +
        '<strong>Open Another Folder</strong>: Select your shared folder<br>' +
        '<strong>New</strong>: Create a new file at a shared location';
    }

    injectGanttTodayCss();
  }

  function injectGanttTodayCss() {
    if (document.getElementById('lang-gantt-today-css')) return;
    const style = document.createElement('style');
    style.id = 'lang-gantt-today-css';
    style.textContent = '.today-line::after { content: "Today" !important; }';
    document.head.appendChild(style);
  }

  let _observer = null;
  function startObserver() {
    if (_observer) _observer.disconnect();
    if (_lang === 'ja') return;
    _observer = new MutationObserver((mutations) => {
      mutations.forEach(m => m.addedNodes.forEach(n => translateNode(n)));
    });
    _observer.observe(document.body, { childList: true, subtree: true });
  }

  function setLang(lang) {
    _lang = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    location.reload();
  }

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

    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn && themeBtn.parentNode) {
      themeBtn.parentNode.insertBefore(btn, themeBtn);
    } else {
      btn.style.position = 'fixed';
      btn.style.top = '10px';
      btn.style.right = '10px';
      btn.style.zIndex = '9999';
      document.body.appendChild(btn);
    }
  }

  function earlyInject() {
    const loaderBtns = document.querySelector('.loader-card');
    if (loaderBtns && !document.getElementById('lang-toggle-loader')) {
      const btn = document.createElement('button');
      btn.id = 'lang-toggle-loader';
      btn.style.cssText = [
        'background:var(--surface2);border:1px solid var(--border);',
        'color:var(--muted);padding:5px 14px;border-radius:var(--radius);',
        'font-size:12px;cursor:pointer;font-family:inherit;margin-top:12px'
      ].join('');
      btn.textContent = _lang === 'ja' ? '🌐 Switch to English' : '🌐 日本語に切り替え';
      btn.onclick = () => setLang(_lang === 'ja' ? 'en' : 'ja');
      loaderBtns.appendChild(btn);
    }
  }

  function init() {
    injectLangButton();
    earlyInject();
    if (_lang !== 'ja') {
      translateAll();
      startObserver();
    }
  }

  if (_lang !== 'ja') {
    const ACTIVITY_PATTERNS = [
      [/^ステータスを (<b>.+?<\/b>) → (<b>.+?<\/b>) に変更$/, (_, a, b) => `Changed status from ${a} to ${b}`],
      [/^担当者を (<b>.+?<\/b>) に変更（元: (<b>.+?<\/b>)）$/, (_, a, b) => `Changed assignee to ${a} (was ${b})`],
      [/^担当者を (<b>.+?<\/b>) に変更$/, (_, a) => `Changed assignee to ${a}`],
      [/^担当者を解除（元: (<b>.+?<\/b>)）$/, (_, a) => `Removed assignee (was ${a})`],
      [/^期限を (<b>.+?<\/b>) → (<b>.+?<\/b>) に変更$/, (_, a, b) => `Changed due date from ${a} to ${b}`],
      [/^詳細内容を更新$/, () => 'Updated description'],
      [/^チェックリストに追加: (<b>.+?<\/b>)$/, (_, a) => `Added to checklist: ${a}`],
      [/^チェックリスト削除: (<b>.+?<\/b>)$/, (_, a) => `Removed from checklist: ${a}`],
      [/^(<b>.+?<\/b>) にチェックを付けた$/, (_, a) => `Checked ${a}`],
      [/^(<b>.+?<\/b>) のチェックを外した$/, (_, a) => `Unchecked ${a}`],
    ];

    function translateActivityText(html) {
      for (const [re, fn] of ACTIVITY_PATTERNS) {
        const m = html.match(re);
        if (m) return fn(...m);
      }
      return html;
    }

    function translateActivityNodes() {
      document.querySelectorAll('.activity-text').forEach(el => {
        el.innerHTML = translateActivityText(el.innerHTML);
      });
      const EMPTY_MSGS = {
        'コメントはまだありません':     'No comments yet',
        'アクティビティはまだありません': 'No activity yet',
        'まだ履歴がありません':          'No history yet',
      };
      document.querySelectorAll('#comment-list > div').forEach(el => {
        const text = el.textContent.trim();
        if (EMPTY_MSGS[text]) el.textContent = EMPTY_MSGS[text];
      });
    }

    if (window.TaskFlow) {
      TaskFlow.on('task-open', () => setTimeout(translateActivityNodes, 150));
      TaskFlow.on('task-save', () => setTimeout(translateActivityNodes, 50));
    }

    document.addEventListener('taskflow-ready', function () {
      const target = document.getElementById('comment-list');
      if (target) {
        new MutationObserver(() => {
          if (_lang !== 'ja') translateActivityNodes();
        }).observe(target, { childList: true });
      }
    });
  }

  if (window.TaskFlow) window.TaskFlow.on('ready', init);
  document.addEventListener('taskflow-ready', init);

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

  // 公開API
  window.TaskFlowLang = {
    get: () => _lang,
    set: setLang,
    t: t,
    addDict: (entries) => Object.assign(DICT, entries),
  };

})();
# TaskFlowZero プロジェクトJSON作成ガイド（AI向け）

対象バージョン: TaskFlowZero v1.2.3
本ガイド作成日: 2026-09-10
本ガイド最終更新: 2026-11-05（v1.1.17 → v1.2.3 の変更を反映）
想定読者: ユーザーに代わってプロジェクトデータ（`project_P*.json`）を新規作成・編集するAIアシスタント

このドキュメントは `docs/PLUGIN_DEVELOPER_GUIDE.txt` 5章（データスキーマ）を補完する、AI向けの生成ガイドです。5章は v1.1.17 時点で実装に合わせて改訂済みですが、本ガイドには生成時のチェックリストと失敗例をまとめています。**JSON生成時は本ガイドを優先**し、不明点は5章で確認してください。

---

## 0. 最初に必ず守ること（過去に実際に発生した失敗）

以下は、AIがJSONを生成した際に実際にインポート失敗を起こした原因です。同じ間違いを避けてください。

1. **ファイルのルートは「プロジェクトオブジェクトそのもの」であること**
   `{ "version": ..., "projects": [...] }` のような配列・メタ情報でのラップは**禁止**です。ファイルを開いた瞬間の最上位オブジェクトが、そのまま1つのプロジェクトを表します（下記4章参照）。

2. **`status` の値は4種類のみ**：`todo` / `inprogress` / `review` / `done`
   `doing` や `in_progress` など類似のスペルは存在しません。

3. **`priority` の値は `'high'` / `'low'` / `null` のみ**（`'medium'` は存在しません）

4. **ファイル名は `project_P{number}.json`（ゼロ埋めなし）**
   例: プロジェクト番号が1なら `project_P1.json`。`project_P01.json` は不正（読み込み時の正規表現は `^project_P\d+\.json$`）。

5. **Wikiは `wikiPages` 配列。旧仕様の `wiki`（単一文字列）は使わない**
   （`docs/PLUGIN_DEVELOPER_GUIDE.txt` 5章も v1.1.17 で `wikiPages` に改訂済みです）

6. **taskの `checklist` 項目は `checked` と `done` の両方を入れておくと安全**
   内部的には `checked` が正だが、`done` からの移行コードが残っているため両方あると事故が起きにくい。

7. **`id` 系フィールドに引用符・山括弧・バックスラッシュ・制御文字を入れない**（v1.2.3〜）
   `id` / `milestoneId` など ID を持つフィールドの値に `'` `"` `<` `>` `\` や制御文字が含まれると、読み込み時に別の安全なID（`x_` + 8桁の16進数）へ自動で置き換えられ、画面に通知が出ます。空白・日本語・`&` などは問題ありません。`__proto__` / `constructor` / `prototype` というキーは読み込み時に削除されます。`number`（プロジェクト・タスク）と `no`（コメント）は**数値**で出力してください（数字以外の文字列は数値に直されます）。

8. **不明なフィールドは省略せず、型に合った空値（`[]` / `''` / `null` / `0`）を入れる**
   アプリ側にマイグレーション処理はあるが、AIが生成する時点でなるべく完全な形にしておく方が事故が少ない。

---

## 1. ファイル配置・命名規則

- 1プロジェクト = 1ファイル。ファイル名は `project_P{number}.json`（`number` はプロジェクトの `number` フィールドの値をそのまま文字列化したもの。ゼロ埋め不要）
- 有効なファイル名の正規表現: `^project_P\d+\.json$`
- 複数プロジェクトを渡す場合は、プロジェクトごとに個別のJSONファイルとして出力する（1ファイルに配列でまとめない）

---

## 2. 日付・時刻のフォーマット

- 日付のみのフィールド（`startDate` / `endDate` / `dueDate` / `completedAt` / タスクの `createdAt` 等）: `'YYYY-MM-DD'` 文字列、または未設定時は `''`
- タイムスタンプ（作成日時など秒まで必要なもの: `comments[].createdAt` / `activity[].at` / `task.createdAtTime` / `task.completedAtTime` 等）: ISO 8601形式。例 `"2026-03-14T10:23:45.000Z"`
- 未確定の日付は `null` ではなく `''`（空文字）を使う（`completedAt` のみ `null` 許容）

---

## 3. トップレベル構造（ファイル全体）

ファイルの中身は、そのまま1個の Project オブジェクトです。以下がルート直下に必要な全フィールドです（コメント付きの型説明であり、そのままでは有効なJSONではありません。実データ例は13章参照）。

```jsonc
{
  "id": "string (UID)",
  "number": 1,
  "name": "プロジェクト名",
  "description": "説明文",
  "color": "#4f8eff",
  "members": ["山田 太郎", "佐藤 花子"],
  "archived": false,
  "milestones": [ /* Milestone[] 4章 */ ],
  "tasks": [ /* Task[] 5章 */ ],
  "nextTaskNum": 1,
  "weeklyNotes": [ /* WeeklyNote[] 9章 */ ],
  "startDate": "2026-09-15",
  "endDate": "2027-03-15",
  "projectSettings": {},
  "wikiPages": [ /* WikiPage[] 8章 */ ],
  "deleted": false
}
```

| フィールド | 型 | 必須 | 補足 |
|---|---|---|---|
| `id` | string | ○ | UID。生成方法は7章参照 |
| `number` | number | ○ | プロジェクト番号。ファイル名 `project_P{number}.json` と一致させる |
| `name` | string | ○ | |
| `description` | string | ○ | 空文字可 |
| `color` | string | ○ | `#rrggbb` 形式のカラーコード |
| `members` | string[] | ○ | メンバー名の配列（オブジェクトではなく単なる文字列） |
| `archived` | boolean | ○ | |
| `milestones` | Milestone[] | ○ | 空配列可 |
| `tasks` | Task[] | ○ | 空配列可 |
| `nextTaskNum` | number | ○ | 次に採番されるタスク番号。既存タスクの最大 `number` + 1にしておく |
| `weeklyNotes` | WeeklyNote[] | ○ | 通常は空配列 `[]` でよい |
| `startDate` / `endDate` | string | ○ | `'YYYY-MM-DD'` または `''` |
| `projectSettings` | object | ○ | 空オブジェクト `{}` でよい。プラグイン等が独自キーを書き込む領域 |
| `wikiPages` | WikiPage[] | ○ | 最低1件（`title: "Home"`）は入れておくのが無難 |
| `deleted` | boolean | ○ | 通常 `false` |

---

## 4. Milestone（マイルストーン）

```json
{
  "id": "string (UID)",
  "name": "要件定義完了",
  "description": "説明文",
  "startDate": "2026-09-08",
  "endDate": "2026-11-07",
  "color": "#22c55e"
}
```

全フィールド必須。`color` は任意の `#rrggbb`。

---

## 5. Task（タスク）

型説明（コメント付きのためこのままでは有効なJSONではありません。実データ例は13章参照）：

```jsonc
{
  "id": "string (UID)",
  "number": 1,
  "title": "タスク名",
  "description": "詳細（Markdown可）",
  "status": "todo",
  "assignee": "山田 太郎",
  "startDate": "2026-09-08",
  "dueDate": "2026-09-22",
  "completedAt": null,
  "completedAtTime": null,
  "completedBy": null,
  "storyPoints": 0,
  "milestoneId": "ms-001",
  "labels": ["調査"],
  "priority": null,
  "createdAt": "2026-09-08",
  "createdAtTime": "2026-09-08T09:00:00.000Z",
  "creator": "山田 太郎",
  "estimatedHours": 0,
  "actualHours": 0,
  "baseEstimatedHours": 0,
  "likes": [],
  "bookmarks": [],
  "checklist": [ /* ChecklistItem[] 6章 */ ],
  "comments": [ /* Comment[] 7章 */ ],
  "nextCommentNo": 1,
  "activity": [ /* Activity[] 8章 */ ],
  "_deletedCommentIds": []
}
```

| フィールド | 型 | 必須 | 補足 |
|---|---|---|---|
| `status` | string | ○ | `'todo'` \| `'inprogress'` \| `'review'` \| `'done'` の4値のみ |
| `priority` | string\|null | ○ | `'high'` \| `'low'` \| `null` の3値のみ（`'medium'`は無い） |
| `milestoneId` | string\|null | ○ | 対応するMilestoneの`id`。無ければ`null` |
| `completedAt` | string\|null | ○ | 未完了なら`null`。完了済みなら`'YYYY-MM-DD'` |
| `completedAtTime` | string\|null | 任意 | 完了日時（ISO 8601）。未完了なら`null` |
| `completedBy` | string\|null | 任意 | 完了にした人の名前（v1.1.29〜）。未完了、または不明なら`null`。省略・`null`の完了済みタスクは、マイタスクの実績集計では担当者が完了したものとして扱われる |
| `labels` | string[] | ○ | 自由文字列のラベル配列 |
| `nextCommentNo` | number | ○ | 次に採番されるコメント番号。既存コメントの最大`no` + 1 |
| `_deletedCommentIds` | string[] | ○ | 通常は空配列。削除済みコメントIDの記録用（3-wayマージで使用） |
| `estimatedHours` / `actualHours` / `baseEstimatedHours` | number | ○ | 工数関連。未使用なら`0` |
| `likes` / `bookmarks` | array | ○ | 通常は空配列 |
| `creator` | string | ○ | 作成者名。不明なら`''` |

**status の表示対応**

| 値 | 表示名 |
|---|---|
| `todo` | To Do（未着手） |
| `inprogress` | 進行中 |
| `review` | レビュー |
| `done` | 完了 |

---

## 6. ChecklistItem（チェックリスト項目）

```json
{
  "id": "string (UID)",
  "text": "営業部ヒアリング",
  "checked": false,
  "done": false
}
```

`checked` が正式フィールド。`done` は旧フィールドとの互換用で、両方同じ値を入れておくと安全です。

---

## 7. Comment（コメント）

```json
{
  "id": "string (UID)",
  "no": 1,
  "author": "山田 太郎",
  "text": "本文（Markdown対応）",
  "createdAt": "2026-02-24T10:30:00.000Z",
  "likes": [],
  "bookmarks": []
}
```

- `reads`（任意）は、マイタスクの「メンション」の既読・未読の記録です（v1.2.1〜）。`{ "id": "自分の名前", "at": "ISO 8601", "read": true|false }` の配列で、アプリが自動で書き込みます。AIが生成するときは**省略して構いません**（記録がないメンションは、2026-11-02より前に投稿されたものは既読、それ以降は未読として扱われます）。

- `no` は**そのタスク内で不変・連番の採番**です。配列インデックスではありません（削除しても既存コメントの`no`はズレない）。新規生成時は1から順に採番し、タスクの `nextCommentNo` を「最大の`no` + 1」に設定してください。
- コメントが1件も無いタスクは `comments: []`, `nextCommentNo: 1` にします。

---

## 8. Activity（アクティビティログ）

```json
{
  "type": "status",
  "icon": "🔄",
  "text": "ステータスを <b>To Do</b> → <b>進行中</b> に変更",
  "at": "2026-02-15T09:00:00.000Z",
  "by": "山田 太郎"
}
```

`by`（任意、v1.1.29〜）は操作した人の名前です。アプリは自分の名前が設定されているときだけ記録します。AIが生成するときは省略して構いません（省略時は名前なしで表示されます）。

`type` は自動ログの種類を表す文字列で、主に以下が使われます。AIが新規タスクを作る場合、通常この配列は空 `[]` で問題ありません（実際の操作ログはアプリ側が記録するため）。

| type | 意味 | icon例 |
|---|---|---|
| `status` | ステータス変更 | 🔄 |
| `assignee` | 担当者変更 | 👤 |
| `due` | 期限変更 | 📅 |
| `desc` | 詳細内容の更新 | 📝 |
| `priority` | 優先度変更 | 🚩 |
| `checklist` | チェックリストの追加/完了/削除 | ☑ / 🗑 |
| `create` | タスク作成（マイタスクの集計用） | ➕ |

---

## 9. WeeklyNote（週次コメント）

`project.weeklyNotes` に格納。サマリー系プラグインが使用します。通常、AIが新規プロジェクトを作る際は空配列 `[]` にしておけば問題ありません。

```json
{
  "weekStart": "2026-05-04",
  "text": "コメント本文（プレーンテキスト）",
  "createdAt": "2026-05-09",
  "updatedAt": "2026-05-09"
}
```

- `weekStart` はその週の月曜日の日付
- 同一週は1件のみ保持（キー: `weekStart`）

---

## 10. WikiPage（Wikiページ）

`project.wikiPages` に格納。**旧仕様の `project.wiki`（単一文字列）は廃止済みなので使わないこと。**

```json
{
  "id": "string (UID)",
  "title": "Home",
  "content": "# 見出し\n\nMarkdown本文",
  "order": 0,
  "updatedAt": "2026-08-10T05:52:02.877Z"
}
```

- `order` は表示順（0始まり）
- 最低1ページ（`title: "Home"`）を用意しておくと自然です
- `content` はMarkdown文字列。空文字可

---

## 11. UID（`id`）の生成方法

厳密な形式指定はありませんが、アプリ内部では以下のロジックで生成されています。AIが生成する場合も、**プロジェクト全体でユニークであれば**この形式に厳密に合わせる必要はありません（衝突しない適当な文字列で可）。

```js
function uid(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2,7);
}
```

複数のオブジェクトを同一ミリ秒で大量生成する場合は末尾に連番や乱数を足すなどして重複を避けてください。

---

## 12. 生成後のセルフチェックリスト

JSONを生成したら、渡す前に以下を確認してください。

- [ ] ファイルのルートが配列やラッパーオブジェクトになっていない（プロジェクトオブジェクト直下にいきなり`id`, `number`, `name`...が並んでいる）
- [ ] `status` が `todo` / `inprogress` / `review` / `done` の4値のみ
- [ ] `priority` が `high` / `low` / `null` の3値のみ
- [ ] `wiki`（単一文字列）ではなく `wikiPages`（配列）を使っている
- [ ] 全タスクの `milestoneId` が、実在する `milestones[].id` または `null` になっている
- [ ] `nextTaskNum` が、既存タスクの最大 `number` より大きい
- [ ] 各タスクの `nextCommentNo` が、そのタスク内コメントの最大 `no` より大きい
- [ ] ファイル名が `project_P{number}.json`（ゼロ埋めなし）になっている
- [ ] JSONとして構文エラーがない（`python3 -m json.tool file.json` 等で検証済み）

---

## 13. 最小構成サンプル（空プロジェクト）

そのまま読み込める最小構成です。新規プロジェクトの雛形として使えます。

```json
{
  "id": "sample0001",
  "number": 1,
  "name": "サンプルプロジェクト",
  "description": "",
  "color": "#4f8eff",
  "members": [],
  "archived": false,
  "milestones": [],
  "tasks": [],
  "nextTaskNum": 1,
  "weeklyNotes": [],
  "startDate": "",
  "endDate": "",
  "projectSettings": {},
  "wikiPages": [
    {
      "id": "sample0002",
      "title": "Home",
      "content": "",
      "order": 0,
      "updatedAt": "2026-09-10T00:00:00.000Z"
    }
  ],
  "deleted": false
}
```

---

## 14. 補足：他のJSON形式との違い

- **同期パッケージ**（`TFZ_full_*.json` / 差分パッケージ。スマホ連携で使う）は、プロジェクトファイルとは別の形式です（ルートに `tfzPackage` / `kind` / `projects` などを持ちます）。AIが `project_P*.json` を作るときに、この形式にしてはいけません。
- **エクスポートJSON**（プロジェクト設定の「保存」タブから書き出すもの）は、プロジェクトファイルと同じ形式（ルートがプロジェクトオブジェクト）です。「📥 インポート」で読み込むと、プロジェクトの `id` と `number` はインポート先で新しく振り直され、`#P{旧番号}-…` 形式の参照リンクも新番号に書き換えられます（添付ファイルを含めた場合は `.zip`、中身は `project.json` と `files/`）。
- `PLUGIN_DEVELOPER_GUIDE.txt` 5章の `TaskFlow.getData()`（`{ version, format, projects, nextProjectNum }`）は、アプリ内部の集計ビューであり、ファイル形式ではありません。

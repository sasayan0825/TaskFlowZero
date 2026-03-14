# ⚡ TaskFlowZero

**Single-file project management tool. No server. No installation. Your data stays where you put it.**

[![License: MIT + Commons Clause](https://img.shields.io/badge/license-MIT%20%2B%20Commons%20Clause-blue.svg)](./LICENSE)
[![Chrome / Edge](https://img.shields.io/badge/browser-Chrome%20%2F%20Edge-green.svg)](https://sasayan0825.github.io/TaskFlowZero/taskflowzero.html)
[![Version](https://img.shields.io/badge/version-v1.0.0-orange.svg)](./taskflowzero.html)

🔗 **[Try it now →](https://sasayan0825.github.io/TaskFlowZero/taskflowzero.html)**

🇺🇸 [English README](./README.en.md)

---

## これはどんなツールですか？

客先常駐・社内ネットワーク限定・インターネット接続不可——そんな環境でも、プロジェクト管理をしたい人のために作りました。

JiraもNotionもAsanaも、クラウドにデータを送ります。TaskFlowZeroは違います。**すべてのデータがあなたのPC・あなたのネットワーク上に残ります。**

HTMLファイル1つ。それだけです。

---

## 特徴

### 🔒 データが外に出ない
ファイルはローカルまたは社内共有フォルダに保存されます。クラウドへの通信はありません。セキュリティポリシーが厳しい客先環境でも安心して使えます。

### 📦 インストール不要
`taskflowzero.html` をダブルクリック。それだけで動きます。IT管理者への申請も、セットアップも不要です。

### 👥 チームで共有
共有フォルダを選択するだけで、複数人で同じデータを編集できます。**3-wayマージ**により、同時編集の競合を自動解決（または手動で選択）できます。

### 📊 充実したビュー
| ビュー | 特徴 |
|---|---|
| リスト | マイルストーンでグループ化、GitHub Issues風 |
| カンバン | ステータス別カード管理 |
| ガント | バーのドラッグで日程調整、イナズマ線対応 |
| バーンダウン | スプリントの進捗を可視化 |
| Wiki | Markdownで仕様書・設計書を管理 |

---

## 使い方

### 最小構成（個人利用）

ブラウザ（Chrome / Edge）で `taskflowzero.html` を開き、「📁 新規作成」からフォルダを選択します。

```
任意のフォルダ/
├── taskflowzero.html    ← これだけでOK（htmlは外に置いても可）
└── project_P1.json      ← プロジェクト作成時に自動生成
```

### チーム共有

OneDriveやNASなどの**共有フォルダ**を選択するだけで全員が同じデータを参照・編集できます。

```
共有フォルダ/（OneDrive・NAS・ファイルサーバーなど）
├── project_P1.json      ← プロジェクトごとに自動生成
├── project_P2.json
└── project_P3.json      ← 各ファイルが独立しているため競合しにくい
```

> プロジェクトごとに独立したJSONファイルを持つため、複数人が**別プロジェクトを同時編集しても競合が起きません**。同一プロジェクトを同時編集した場合は3-wayマージで自動・手動解決します。

### オフライン環境（CDN不可の場合）
HTMLと同じフォルダに以下を置くと完全オフラインで動作します。
```
任意のフォルダ/
├── taskflowzero.html
├── marked.min.js        ← Markdownレンダリング
└── chart.min.js         ← バーンダウンチャート
```

> **対応ブラウザ:** Chrome / Edge（File System Access API が必要です）

---

## スクリーンショット

| | |
|---|---|
| ![プロジェクト一覧](.github/screenshots/projects.png) | ![ガントチャート](.github/screenshots/gantt.png) |
| プロジェクト一覧 | ガントチャート |
| ![タスク詳細](.github/screenshots/task.png) | ![Wiki](.github/screenshots/wiki.png) |
| タスク詳細 | Wiki |

---

## プラグイン

機能はプラグインで拡張できます。`plugin/plugins.js` に追記するだけで有効になります。

| プラグイン | 機能 |
|---|---|
| `plugin_lang.js` | 日本語 / 英語 切り替え |
| `plugin_csv_export.js` | タスク一覧をCSVエクスポート |
| `plugin_overdue_badge.js` | 期限切れタスク数をサイドバーに表示 |
| `plugin_summary.js` | プロジェクトのサマリービューを追加 |

### プラグイン管理UI

ヘッダー右端の 🔌 ボタンからGUIでプラグインを管理できます。`plugin/plugins.js` を手動で編集する必要はありません。

- **インストール:** JSファイルをドロップ、またはファイル選択
- **順序変更:** ドラッグ&ドロップで読み込み順を変更
- **削除:** リストから除外（JSファイルは残ります）

> **初回のみ:** 🔌 ボタンを押すと `plugin/` フォルダの選択ダイアログが表示されます（2回目以降は自動認識）

プラグインの作り方は [PLUGIN_DEVELOPER_GUIDE.txt](plugin/PLUGIN_DEVELOPER_GUIDE.txt) を参照してください。

---

## こんな方に

- 👨‍💻 客先常駐でJira等のクラウドツールが使えないエンジニア・PM
- 🏭 社外サービスへのデータ送信が禁止されている現場
- 🔧 Excelでタスク管理していて、もう少しちゃんとしたツールが欲しい方
- 🧑‍🤝‍🧑 小規模チームで、手軽に共有できるツールを探している方

---

## ログイン機能について

TaskFlowZeroにはログイン・認証機能がありません。これは意図的な設計です。

クラウドサービスにおけるログインの主な目的は「誰のデータか」を識別することです。しかしTaskFlowZeroはデータを自分のPCや社内ネットワーク上に置く前提のため、ファイルへのアクセス権限はOSやネットワークの仕組みに委ねています。

アプリ側でIDとパスワードを管理することは、むしろ管理コストの増加とセキュリティリスクになりえます。「使いたい人がフォルダを開くだけ」というシンプルさを守るために、ログイン機能は省いています。

---

## 技術スタック

- **フロントエンド:** Vanilla HTML / CSS / JavaScript（フレームワークなし）
- **ストレージ:** File System Access API（フォルダ選択）+ IndexedDB（最後に開いたフォルダを記憶）
- **データ形式:** プロジェクトごとの独立JSON（`project_P1.json`, `project_P2.json` ...）
- **Markdown:** [marked.js](https://marked.js.org/)
- **チャート:** [Chart.js](https://www.chartjs.org/)
- **外部依存:** 上記2つのみ（CDN or ローカルファイル）

---

## 開発について

このプロジェクトは、[Anthropic](https://www.anthropic.com/) の AI アシスタント **Claude** と一緒に作りました。

設計・実装・デバッグ・ドキュメント作成まで、ほぼ全工程を対話しながら進めています。「こういう機能が欲しい」「ここが使いにくい」という会話の積み重ねで今の形になりました。

> *Built in collaboration with [Claude](https://claude.ai/) by Anthropic.*

---

## ライセンス

[MIT License + Commons Clause](./LICENSE)

- ✅ 個人・チームでの業務利用 — 自由
- ✅ 社内ネットワークへの展開 — 自由
- ✅ コードの改変・カスタマイズ — 自由
- ❌ 本ソフトウェアの販売・有償サービスへの組み込み — 要許諾

商用利用のご相談は [Issues](https://github.com/sasayan0825/TaskFlowZero/issues) からご連絡ください。

---

<div align="center">
  <sub>Made with ⚡ for engineers working on-site</sub>
</div>

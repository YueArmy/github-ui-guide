# CLAUDE.md

## Project Info

**Name**: GitHub UI Guide
**Repository**: https://github.com/YueArmy/github-ui-guide.git
**Type**: Interactive Git/GitHub Learning Tool
**Stack**: HTML/CSS/JavaScript + Google Apps Script + Spreadsheet

## Persona / 話し方

- **テンション高めギャル**（一人称は「うち」か省略）
- **タメ口で話す**（敬語禁止）
- 語尾は「〜じゃん」「〜だし」「〜てか」「〜なんだけど」「〜っしょ」
- 「まじ」「やばい」「えぐい」「神」「最強」「天才」「それな」を多用
- リアクション大きめ
- 絵文字は使わない

---

## Project Overview

GitコマンドとGitHub UIの関係を視覚的に学べるインタラクティブなシミュレーター。

**機能:**
- コマンド入力エリア → `git add`, `git commit` などを打つ
- GitHub UIエリア → コマンドに応じて画面が変化
- データ管理 → スプレッドシートでファイル・コミット履歴を管理

---

## Folder Structure

```
github-ui-guide/
├── CLAUDE.md
├── README.md
├── index.html              # GitHub Pages用リダイレクト
├── .claude/
│   ├── rules/
│   │   ├── coding.md
│   │   ├── workflow.md
│   │   └── safety.md
│   └── commands/
├── src/
│   ├── index.html          # メインページ
│   ├── css/
│   │   ├── style.css       # 基本スタイル
│   │   └── github-theme.css # GitHub UIスタイル
│   └── js/
│       ├── app.js          # 状態管理
│       ├── cli.js          # CLI入出力
│       ├── commands.js     # Gitコマンド処理
│       ├── local-files.js  # ローカルファイルUI
│       ├── github-ui.js    # GitHub UI描画
│       ├── tutorial.js     # チュートリアルガイド
│       ├── scenarios.js    # 学習シナリオ
│       ├── git-status-panel.js # Git状態パネル
│       └── config.example.js
├── gas/
│   └── Code.gs             # Google Apps Script
└── docs/
    ├── api.md              # GAS API仕様
    ├── requirements.md
    ├── user-flow.md
    └── implementation-plan.md
```

---

## Commands

```bash
# ローカルで開発
open src/index.html

# GASデプロイ（clasp使用時）
clasp push

# GitHub Pagesにデプロイ
git add . && git commit -m "Update" && git push
```

---

## Key Dependencies

- **Google Apps Script**: スプレッドシートとの連携API
- **GitHub Pages**: 静的ホスティング
- **No framework**: Vanilla JS で軽量に

---

## Rules

@.claude/rules/coding.md
@.claude/rules/workflow.md
@.claude/rules/safety.md

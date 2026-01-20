# 要件定義: GitHub UI Guide

## 1. プロジェクト概要

### 目的
GitHub完全初心者が、個人でGitHubを使ってコード管理できるようになるためのインタラクティブシミュレーター

### ターゲットユーザー
- Git/GitHub を触ったことがない人
- 「コマンド打つの怖い」「何が起きてるかわからない」人
- 個人開発でバージョン管理したい人

### ゴール
ユーザーが以下の流れを理解・体験できる:
1. GitHubでリポジトリ作成
2. ローカルにclone
3. ファイル編集 → add → commit → push
4. GitHubに反映されることを確認

---

## 2. 対応するGitコマンド（MVP）

| コマンド | 説明 | 優先度 |
|---------|------|--------|
| `git clone <url>` | リポジトリをローカルに複製 | 🔴 必須 |
| `git status` | 現在の状態を確認 | 🔴 必須 |
| `git add <file>` | ファイルをステージング | 🔴 必須 |
| `git add .` | 全ファイルをステージング | 🔴 必須 |
| `git commit -m "msg"` | コミット作成 | 🔴 必須 |
| `git push` | リモートに反映 | 🔴 必須 |
| `git log` | コミット履歴表示 | 🟡 あると良い |
| `git diff` | 差分表示 | 🟢 後で |
| `git branch` | ブランチ操作 | 🟢 後で |
| `git pull` | リモートから取得 | 🟢 後で |
| `help` | コマンド一覧表示 | 🔴 必須 |
| `clear` | CLI画面クリア | 🟡 あると良い |

---

## 3. 再現するGitHub UI

### MVP（最小限）

| 画面 | 説明 | 優先度 |
|------|------|--------|
| リポジトリトップ（空） | Quick setup、clone URL表示 | 🔴 必須 |
| リポジトリトップ（ファイルあり） | ファイル一覧、最終コミット | 🔴 必須 |
| コミット履歴 | コミット一覧 | 🟡 あると良い |

### 後で追加
- Issue一覧
- Pull Request
- Settings

---

## 4. 画面構成

```
┌─────────────────────────────────────────────────────┐
│  GitHub UI Guide                            [設定]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │           GitHub UI エリア                  │   │
│  │         （リポジトリ画面を再現）            │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  $ git status                               │   │
│  │  On branch main                             │   │
│  │  Changes not staged for commit:             │   │
│  │    modified: README.md                      │   │
│  │                                             │   │
│  │  $ _                                        │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│              CLI エリア（コマンド入力）             │
└─────────────────────────────────────────────────────┘
```

- **上部**: GitHub UI（状態に応じて変化）
- **下部**: CLI（ターミナル風、コマンド入力）
- **デスクトップのみ**（レスポンシブは後で）

---

## 5. データ構造

### ファイル状態

```javascript
const fileStates = {
  'README.md': {
    status: 'modified',  // untracked | modified | staged | committed
    content: '# My Project'  // 将来的に使う（今はオプション）
  },
  'index.html': {
    status: 'untracked',
    content: null
  }
};
```

### ステータスの種類

| Status | 説明 | git status での表示 |
|--------|------|-------------------|
| `untracked` | 新規ファイル、未追跡 | Untracked files |
| `modified` | 変更あり、未ステージ | Changes not staged |
| `staged` | ステージング済み | Changes to be committed |
| `committed` | コミット済み、変更なし | (表示なし) |

### コミット履歴

```javascript
const commits = [
  {
    hash: 'abc1234',
    message: 'Initial commit',
    timestamp: '2026-01-20T12:00:00',
    files: ['README.md']
  }
];
```

### リポジトリ状態

```javascript
const repoState = {
  name: 'my-project',
  isCloned: false,       // clone済みか
  currentBranch: 'main',
  remoteUrl: 'https://github.com/user/my-project.git',
  files: fileStates,
  commits: commits,
  staged: []             // ステージング中のファイル
};
```

---

## 6. ユーザーフロー（シナリオ）

### チュートリアル: 初めてのpush

1. **開始状態**: GitHubに空のリポジトリがある
2. ユーザーが `git clone <url>` を入力
3. ローカルにリポジトリができる（CLI に表示）
4. ダミーファイルが追加される（README.md など）
5. `git status` で状態確認
6. `git add README.md` でステージング
7. `git commit -m "first commit"` でコミット
8. `git push` でリモートに反映
9. **GitHub UI が更新**: ファイル一覧が表示される

---

## 7. 技術スタック

- **HTML/CSS/JavaScript** (Vanilla)
- **LocalStorage** でデータ永続化
- **GitHub Pages** でホスティング
- フレームワーク不使用（シンプルに）

---

## 8. MVP スコープ

### Phase 1: 基本動作（まずこれ）
- [ ] CLI UI（コマンド入力・出力表示）
- [ ] GitHub UI（空リポジトリ画面）
- [ ] `git clone` コマンド
- [ ] `git status` コマンド
- [ ] `git add` コマンド
- [ ] `git commit` コマンド
- [ ] `git push` コマンド
- [ ] GitHub UI（ファイルあり画面）

### Phase 2: 体験向上
- [ ] コミット履歴表示
- [ ] `git log` コマンド
- [ ] チュートリアルガイド（次に何をすべきか表示）
- [ ] リセット機能

### Phase 3: 拡張
- [ ] ブランチ操作
- [ ] Pull Request シミュレーション
- [ ] 複数シナリオ

---

## 9. 決定事項

| 項目 | 決定 |
|------|------|
| ファイルの「編集」 | ボタン押したら modified になる |
| ヘルプ機能 | `help` コマンドでコマンド一覧表示 |
| チュートリアルガイド | 一旦なし（後で追加する可能性） |

## 10. 未決定事項

- [ ] エラー表示のデザイン
- [ ] 進捗保存（LocalStorage）のタイミング

---

## 11. 参考

- [GitHub公式ドキュメント](https://docs.github.com/)
- 既存の類似ツール: Learn Git Branching

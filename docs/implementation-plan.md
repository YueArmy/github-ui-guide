# 実装計画

## フェーズ分け

### Phase 1: 基盤構築
**目標:** 画面の枠組みとCLI入力ができる状態

1. **index.html** - 基本構造
   - ヘッダー
   - GitHub UIエリア（プレースホルダー）
   - ローカルファイルエリア（非表示）
   - CLIエリア

2. **css/style.css** - 基本スタイル
   - 全体レイアウト（flexbox）
   - GitHub風のダークテーマ
   - CLIのターミナル風スタイル

3. **js/app.js** - 状態管理
   - 初期状態の定義
   - 状態更新関数
   - LocalStorage保存/読込

---

### Phase 2: CLI実装
**目標:** コマンド入力と出力ができる

1. **js/cli.js** - CLI機能
   - コマンド入力ハンドラ
   - 出力表示
   - コマンド履歴（上下キー）
   - clearコマンド

2. **js/commands.js** - コマンド処理
   - コマンドパーサー
   - helpコマンド
   - 不明コマンドのエラー表示

---

### Phase 3: Gitコマンド実装
**目標:** 各gitコマンドが動作する

1. **git clone**
   - URL検証
   - isCloned = true
   - ローカルファイルエリア表示

2. **git status**
   - ファイル状態に応じた出力

3. **git add**
   - 単一ファイル / 全ファイル対応
   - ファイル状態更新

4. **git commit**
   - -m オプションパース
   - コミットオブジェクト作成
   - ハッシュ生成

5. **git push**
   - pushedCommitCount更新
   - GitHub UI更新トリガー

6. **git log**
   - コミット履歴表示

7. **git reset HEAD**
   - ファイル状態を戻す

---

### Phase 4: ローカルファイルエリア
**目標:** ファイルの追加・編集ができる

1. **js/local-files.js**
   - ファイル一覧表示
   - 状態アイコン表示
   - [編集]ボタン → modified
   - [+ ファイル追加]ボタン

2. **ファイル追加モーダル**
   - ファイル名入力
   - 追加処理

---

### Phase 5: GitHub UI実装
**目標:** GitHub風のUIが表示される

1. **js/github-ui.js**
   - 空リポジトリ画面
   - ファイル一覧画面
   - 状態に応じた切り替え

2. **css/github-theme.css**
   - GitHubのUI再現
   - ファイルアイコン
   - コミットメッセージ表示

---

### Phase 6: 仕上げ
**目標:** 使いやすく整える

1. リセットボタン（最初からやり直し）
2. LocalStorage永続化
3. エラーメッセージ改善
4. レスポンシブ対応（オプション）

---

## ファイル構成

```
src/
├── index.html
├── css/
│   ├── style.css          # 全体レイアウト
│   └── github-theme.css   # GitHub UI用
└── js/
    ├── app.js             # 状態管理、初期化
    ├── cli.js             # CLI入出力
    ├── commands.js        # コマンド処理
    ├── local-files.js     # ローカルファイルUI
    └── github-ui.js       # GitHub UI
```

---

## 実装順序（詳細）

### 1日目: Phase 1-2
- [ ] index.html 作成
- [ ] style.css 作成（レイアウト）
- [ ] app.js 作成（状態管理）
- [ ] cli.js 作成（入出力）
- [ ] help / clear コマンド

### 2日目: Phase 3
- [ ] git clone
- [ ] git status
- [ ] git add
- [ ] git commit
- [ ] git push
- [ ] git log
- [ ] git reset HEAD

### 3日目: Phase 4-5
- [ ] ローカルファイルエリア
- [ ] ファイル追加/編集機能
- [ ] GitHub UI: 空リポジトリ
- [ ] GitHub UI: ファイル一覧

### 4日目: Phase 6
- [ ] リセット機能
- [ ] LocalStorage
- [ ] バグ修正・調整

---

## 次のアクション

**まずPhase 1から始める:**
1. `src/index.html` を作成
2. `src/css/style.css` を作成
3. 基本レイアウトを確認

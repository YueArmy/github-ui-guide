# Coding Rules

## Style

- Vanilla JS のみ使用（フレームワーク禁止）
- 既存コードのスタイルに合わせる
- シンプル優先、過度な抽象化は避ける
- 関数は小さく、単一責任で

## HTML/CSS

- BEM命名規則を使用（`.block__element--modifier`）
- GitHub の UI を忠実に再現
- レスポンシブ対応は後回し（まずデスクトップ）
- CSS変数でテーマカラーを管理

## JavaScript

- ES6+ を使用
- `const` 優先、`let` は必要時のみ、`var` 禁止
- 非同期処理は `async/await` で
- エラーハンドリングは必ず実装

## ファイル管理

- 既存ファイルを編集、新規作成は必要な時のみ
- 未使用コード・インポートは削除
- コメントアウトしたコードは残さない

## コメント

- 複雑なロジックにのみコメント
- 自明なコメントは書かない
- TODO は即座に対応するか Issue 化

## Google Apps Script

- doGet/doPost でJSON API を実装
- スプレッドシートの構造は docs/api.md に記載
- CORS 対応を忘れない

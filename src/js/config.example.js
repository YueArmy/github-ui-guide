// config.example.js
// このファイルをコピーして config.local.js を作成
// config.local.js は .gitignore に入ってるので安全

const CONFIG = {
  // Google Apps Script Web App URL
  GAS_API_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',

  // スプレッドシート ID（GAS側で使用）
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',

  // デバッグモード
  DEBUG: true
};

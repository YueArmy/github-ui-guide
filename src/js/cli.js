/**
 * cli.js - CLI Input/Output
 * ターミナル風UIの入出力処理
 */

// ========================================
// DOM Elements
// ========================================
let cliOutput;
let cliInput;

// ========================================
// Command History
// ========================================
const commandHistory = [];
let historyIndex = -1;

// ========================================
// CLI Functions
// ========================================

/**
 * コマンドをCLI出力に追加
 */
function printCommand(command) {
  const line = document.createElement('div');
  line.className = 'cli__line cli__line--command';
  line.textContent = command;
  cliOutput.appendChild(line);
  scrollToBottom();
}

/**
 * 通常の出力を追加
 */
function printOutput(text) {
  const lines = text.split('\n');
  lines.forEach(lineText => {
    const line = document.createElement('div');
    line.className = 'cli__line cli__line--output';
    line.textContent = lineText;
    cliOutput.appendChild(line);
  });
  scrollToBottom();
}

/**
 * エラー出力を追加
 */
function printError(text) {
  const line = document.createElement('div');
  line.className = 'cli__line cli__line--error';
  line.textContent = text;
  cliOutput.appendChild(line);
  scrollToBottom();
}

/**
 * 成功メッセージを追加
 */
function printSuccess(text) {
  const line = document.createElement('div');
  line.className = 'cli__line cli__line--success';
  line.textContent = text;
  cliOutput.appendChild(line);
  scrollToBottom();
}

/**
 * 空行を追加
 */
function printNewline() {
  const line = document.createElement('div');
  line.className = 'cli__line';
  line.innerHTML = '&nbsp;';
  cliOutput.appendChild(line);
  scrollToBottom();
}

/**
 * CLI出力をクリア
 */
function clearOutput() {
  cliOutput.innerHTML = '';
}

/**
 * 出力エリアを最下部にスクロール
 */
function scrollToBottom() {
  cliOutput.scrollTop = cliOutput.scrollHeight;
}

// ========================================
// Input Handling
// ========================================

/**
 * コマンド入力の処理
 */
function handleInput(e) {
  if (e.key === 'Enter') {
    const command = cliInput.value.trim();

    if (command) {
      // 履歴に追加
      commandHistory.push(command);
      historyIndex = commandHistory.length;

      // コマンドを表示
      printCommand(command);

      // コマンドを実行（commands.jsで定義）
      if (typeof executeCommand === 'function') {
        executeCommand(command);
      }

      // 空行を追加
      printNewline();
    }

    // 入力をクリア
    cliInput.value = '';
  }

  // 上キー: 前の履歴
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      cliInput.value = commandHistory[historyIndex];
    }
  }

  // 下キー: 次の履歴
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      cliInput.value = commandHistory[historyIndex];
    } else {
      historyIndex = commandHistory.length;
      cliInput.value = '';
    }
  }
}

/**
 * CLI エリアクリック時に入力にフォーカス
 */
function handleCliClick(e) {
  // 入力欄にフォーカス
  cliInput.focus();
}

// ========================================
// Initialization
// ========================================

function initCli() {
  cliOutput = document.getElementById('cliOutput');
  cliInput = document.getElementById('cliInput');

  if (!cliOutput || !cliInput) {
    console.error('CLI elements not found');
    return;
  }

  // イベントリスナー設定
  cliInput.addEventListener('keydown', handleInput);

  // CLI全体をクリックで入力にフォーカス
  const cliElement = document.getElementById('cli');
  if (cliElement) {
    cliElement.addEventListener('click', handleCliClick);
  }

  // 初期フォーカス
  cliInput.focus();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initCli);

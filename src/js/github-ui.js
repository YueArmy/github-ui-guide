/**
 * github-ui.js - GitHub UI Rendering
 * GitHub風UIの描画
 */

// ========================================
// DOM Elements
// ========================================
let githubContent;
let githubRepoName;

// ========================================
// Render Functions
// ========================================

/**
 * GitHub UIを更新
 */
function renderGitHubUI() {
  const repo = getRepo();
  const pushedCommits = getPushedCommits();

  // リポジトリ名を更新
  if (githubRepoName) {
    githubRepoName.textContent = `${repo.owner} / ${repo.name}`;
  }

  // Pushされたコミットがない場合は空リポジトリ表示
  if (pushedCommits.length === 0) {
    renderEmptyRepo();
  } else {
    renderFileList();
  }
}

/**
 * 空リポジトリ画面を描画
 */
function renderEmptyRepo() {
  const repo = getRepo();

  githubContent.innerHTML = `
    <div class="github-empty">
      <h2 class="github-empty__title">Quick setup</h2>
      <p class="github-empty__description">
        Get started by creating a new file or uploading an existing file.
      </p>

      <div class="github-empty__setup">
        <div class="github-empty__setup-title">Clone this repository</div>
        <div class="github-empty__clone-box">
          <input type="text" class="github-empty__clone-input" id="cloneUrl" value="${repo.remoteUrl}" readonly>
          <button class="github-empty__copy-btn" id="copyUrlBtn" title="Copy to clipboard">Copy</button>
        </div>
      </div>

      <div class="github-empty__instructions">
        <div class="github-empty__instructions-title">...or create a new repository on the command line</div>
        <pre class="github-empty__code">git clone ${repo.remoteUrl}
cd ${repo.name}
# create some files
git add .
git commit -m "first commit"
git push</pre>
      </div>
    </div>
  `;

  // コピーボタンのイベント設定
  const copyBtn = document.getElementById('copyUrlBtn');
  const cloneInput = document.getElementById('cloneUrl');
  if (copyBtn && cloneInput) {
    copyBtn.addEventListener('click', () => copyToClipboard(cloneInput.value, copyBtn));
  }
}

/**
 * ファイル一覧画面を描画
 */
function renderFileList() {
  const pushedCommits = getPushedCommits();
  const latestPushedCommit = pushedCommits[pushedCommits.length - 1];

  // Pushされたファイルを収集（全コミットから）
  const pushedFiles = new Set();
  pushedCommits.forEach(commit => {
    commit.files.forEach(file => pushedFiles.add(file));
  });

  // ファイルリストのHTML生成
  let fileListHtml = '';
  pushedFiles.forEach(filename => {
    // このファイルの最新コミットを探す
    let lastCommit = null;
    for (let i = pushedCommits.length - 1; i >= 0; i--) {
      if (pushedCommits[i].files.includes(filename)) {
        lastCommit = pushedCommits[i];
        break;
      }
    }

    const commitMessage = lastCommit ? lastCommit.message : '';
    const commitTime = lastCommit ? formatTimeAgo(new Date(lastCommit.timestamp)) : '';

    fileListHtml += `
      <li class="github-files__item">
        <span class="github-files__icon github-files__icon--file"></span>
        <span class="github-files__name">${filename}</span>
        <span class="github-files__message">${escapeHtml(commitMessage)}</span>
        <span class="github-files__time">${commitTime}</span>
      </li>
    `;
  });

  githubContent.innerHTML = `
    <div class="github-files">
      <div class="github-files__header">
        <div class="github-files__commit-info">
          <span class="github-files__commit-hash">${latestPushedCommit.hash}</span>
          <span>${escapeHtml(latestPushedCommit.message)}</span>
        </div>
      </div>
      <ul class="github-files__list">
        ${fileListHtml}
      </ul>
    </div>
  `;
}

// ========================================
// Utility Functions
// ========================================

/**
 * 相対時間をフォーマット
 */
function formatTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) {
    return 'just now';
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  } else {
    return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  }
}

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * クリップボードにコピー
 */
async function copyToClipboard(text, button) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('github-empty__copy-btn--copied');
    setTimeout(() => {
      button.textContent = originalText;
      button.classList.remove('github-empty__copy-btn--copied');
    }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
}

// ========================================
// Initialization
// ========================================

function initGitHubUI() {
  githubContent = document.getElementById('githubContent');
  githubRepoName = document.querySelector('.github-ui__repo-name');

  if (!githubContent) {
    console.error('GitHub UI elements not found');
    return;
  }

  // 状態変更時に再描画
  onStateChange(() => {
    renderGitHubUI();
  });

  // 初期描画
  renderGitHubUI();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGitHubUI);

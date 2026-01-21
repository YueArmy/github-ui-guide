/**
 * github-ui.js - GitHub UI Rendering
 * GitHub風UIの描画
 */

// ========================================
// DOM Elements
// ========================================
let githubContent;
let githubRepoName;
let currentTab = 'code'; // 'code', 'commits', or 'pullrequests'

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
    renderWithTabs();
  }
}

/**
 * タブ付きUIを描画
 */
function renderWithTabs() {
  const pushedCommits = getPushedCommits();
  const pullRequests = getPullRequests();
  const openPRs = pullRequests.filter(pr => pr.status === 'open');

  let contentHtml = '';
  if (currentTab === 'code') {
    contentHtml = renderFileListHtml();
  } else if (currentTab === 'commits') {
    contentHtml = renderCommitListHtml();
  } else if (currentTab === 'pullrequests') {
    contentHtml = renderPullRequestsHtml();
  }

  githubContent.innerHTML = `
    <div class="github-tabs">
      <button class="github-tabs__btn ${currentTab === 'code' ? 'github-tabs__btn--active' : ''}" data-tab="code">
        <span class="github-tabs__icon">&#128193;</span>
        Code
      </button>
      <button class="github-tabs__btn ${currentTab === 'commits' ? 'github-tabs__btn--active' : ''}" data-tab="commits">
        <span class="github-tabs__icon">&#128337;</span>
        Commits
        <span class="github-tabs__count">${pushedCommits.length}</span>
      </button>
      <button class="github-tabs__btn ${currentTab === 'pullrequests' ? 'github-tabs__btn--active' : ''}" data-tab="pullrequests">
        <span class="github-tabs__icon">&#128259;</span>
        Pull requests
        ${openPRs.length > 0 ? `<span class="github-tabs__count">${openPRs.length}</span>` : ''}
      </button>
    </div>
    <div class="github-tabs__content">
      ${contentHtml}
    </div>
  `;

  // タブイベント設定
  const tabBtns = githubContent.querySelectorAll('.github-tabs__btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      renderGitHubUI();
    });
  });

  // PRボタンイベント設定
  setupPREventListeners();
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
 * ファイル一覧画面を描画（従来の関数、互換性のため残す）
 */
function renderFileList() {
  githubContent.innerHTML = renderFileListHtml();
}

/**
 * ファイル一覧のHTMLを生成
 */
function renderFileListHtml() {
  const pushedCommits = getPushedCommits();
  const latestPushedCommit = pushedCommits[pushedCommits.length - 1];
  const repo = getRepo();

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

  return `
    <div class="github-files">
      <div class="github-files__header">
        <div class="github-files__commit-info">
          <span class="github-files__commit-hash">${latestPushedCommit.hash}</span>
          <span>${escapeHtml(latestPushedCommit.message)}</span>
        </div>
        <div class="github-files__branch">
          <span class="github-files__branch-icon">&#9906;</span>
          ${repo.currentBranch}
        </div>
      </div>
      <ul class="github-files__list">
        ${fileListHtml}
      </ul>
    </div>
  `;
}

/**
 * コミット一覧のHTMLを生成
 */
function renderCommitListHtml() {
  const pushedCommits = getPushedCommits();
  const repo = getRepo();

  // 新しい順に表示
  const reversed = [...pushedCommits].reverse();

  let commitListHtml = '';
  reversed.forEach(commit => {
    const timeAgo = formatTimeAgo(new Date(commit.timestamp));
    const filesCount = commit.files.length;

    commitListHtml += `
      <li class="github-commits__item">
        <div class="github-commits__info">
          <div class="github-commits__message">${escapeHtml(commit.message)}</div>
          <div class="github-commits__meta">
            <span class="github-commits__author">${repo.owner}</span>
            committed ${timeAgo}
          </div>
        </div>
        <div class="github-commits__details">
          <span class="github-commits__hash">${commit.hash}</span>
          <span class="github-commits__files" title="${commit.files.join(', ')}">
            ${filesCount} file${filesCount > 1 ? 's' : ''}
          </span>
        </div>
      </li>
    `;
  });

  return `
    <div class="github-commits">
      <div class="github-commits__header">
        <span class="github-commits__title">Commits on ${repo.currentBranch}</span>
      </div>
      <ul class="github-commits__list">
        ${commitListHtml}
      </ul>
    </div>
  `;
}

/**
 * Pull Request一覧のHTMLを生成
 */
function renderPullRequestsHtml() {
  const pullRequests = getPullRequests();
  const repo = getRepo();
  const branches = getBranches();
  const currentBranch = repo.currentBranch;

  // main以外のブランチでpushされたコミットがあればPR作成可能
  const canCreatePR = currentBranch !== 'main' && hasUnpushedCommits() === false && getPushedCommits().length > 0;

  let prListHtml = '';

  if (pullRequests.length === 0) {
    prListHtml = `
      <div class="github-pr__empty">
        <div class="github-pr__empty-icon">&#128259;</div>
        <h3>Welcome to Pull Requests!</h3>
        <p>Pull requests help you collaborate on code with other people.</p>
        <p class="github-pr__empty-hint">
          Create a branch, make changes, and open a pull request to merge them back to main.
        </p>
      </div>
    `;
  } else {
    const openPRs = pullRequests.filter(pr => pr.status === 'open');
    const closedPRs = pullRequests.filter(pr => pr.status !== 'open');

    openPRs.forEach(pr => {
      const timeAgo = formatTimeAgo(new Date(pr.createdAt));
      prListHtml += `
        <li class="github-pr__item">
          <div class="github-pr__icon github-pr__icon--open">&#128259;</div>
          <div class="github-pr__info">
            <div class="github-pr__title">${escapeHtml(pr.title)}</div>
            <div class="github-pr__meta">
              #${pr.id} opened ${timeAgo} by ${repo.owner}
              <span class="github-pr__branch">${pr.sourceBranch} -> ${pr.targetBranch}</span>
            </div>
          </div>
          <div class="github-pr__actions">
            <button class="github-pr__merge-btn" data-pr-id="${pr.id}">Merge</button>
          </div>
        </li>
      `;
    });

    closedPRs.forEach(pr => {
      const timeAgo = pr.mergedAt ? formatTimeAgo(new Date(pr.mergedAt)) : formatTimeAgo(new Date(pr.createdAt));
      const statusIcon = pr.status === 'merged' ? '&#128156;' : '&#10060;';
      const statusClass = pr.status === 'merged' ? 'github-pr__icon--merged' : 'github-pr__icon--closed';
      const statusText = pr.status === 'merged' ? `merged ${timeAgo}` : `closed ${timeAgo}`;

      prListHtml += `
        <li class="github-pr__item github-pr__item--closed">
          <div class="github-pr__icon ${statusClass}">${statusIcon}</div>
          <div class="github-pr__info">
            <div class="github-pr__title">${escapeHtml(pr.title)}</div>
            <div class="github-pr__meta">
              #${pr.id} ${statusText} by ${repo.owner}
            </div>
          </div>
        </li>
      `;
    });
  }

  // ブランチセレクター（PR作成用）
  let branchOptions = '';
  branches.filter(b => b !== 'main').forEach(branch => {
    const selected = branch === currentBranch ? 'selected' : '';
    branchOptions += `<option value="${branch}" ${selected}>${branch}</option>`;
  });

  const createPRSection = branches.length > 1 ? `
    <div class="github-pr__create">
      <div class="github-pr__create-header">
        <span>Compare & pull request</span>
      </div>
      <div class="github-pr__create-form">
        <div class="github-pr__create-branches">
          <span>base: <strong>main</strong></span>
          <span>&#8592;</span>
          <span>compare:
            <select id="prSourceBranch" class="github-pr__branch-select">
              ${branchOptions}
            </select>
          </span>
        </div>
        <input type="text" id="prTitle" class="github-pr__create-input" placeholder="PR title...">
        <textarea id="prDescription" class="github-pr__create-textarea" placeholder="Description (optional)"></textarea>
        <button id="createPRBtn" class="github-pr__create-btn">Create Pull Request</button>
      </div>
    </div>
  ` : '';

  return `
    <div class="github-pr">
      ${createPRSection}
      <div class="github-pr__header">
        <span class="github-pr__header-title">Pull Requests</span>
      </div>
      <ul class="github-pr__list">
        ${prListHtml}
      </ul>
    </div>
  `;
}

/**
 * PRボタンのイベントリスナーをセットアップ
 */
function setupPREventListeners() {
  // Create PR button
  const createPRBtn = document.getElementById('createPRBtn');
  if (createPRBtn) {
    createPRBtn.addEventListener('click', handleCreatePR);
  }

  // Merge buttons
  const mergeBtns = document.querySelectorAll('.github-pr__merge-btn');
  mergeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const prId = parseInt(btn.dataset.prId);
      handleMergePR(prId);
    });
  });
}

/**
 * PR作成処理
 */
function handleCreatePR() {
  const titleInput = document.getElementById('prTitle');
  const descInput = document.getElementById('prDescription');
  const branchSelect = document.getElementById('prSourceBranch');

  const title = titleInput?.value.trim();
  const description = descInput?.value.trim();
  const sourceBranch = branchSelect?.value;

  if (!title) {
    alert('Please enter a PR title.');
    return;
  }

  if (!sourceBranch) {
    alert('Please select a source branch.');
    return;
  }

  const pr = addPullRequest({
    title,
    description,
    sourceBranch,
    targetBranch: 'main'
  });

  // CLI出力
  if (typeof printOutput === 'function') {
    printOutput(`Pull Request #${pr.id} created: "${pr.title}"`);
    printOutput(`${pr.sourceBranch} -> ${pr.targetBranch}`);
    printSuccess('PR is ready for review!');
    printNewline();
  }

  renderGitHubUI();
}

/**
 * PRマージ処理
 */
function handleMergePR(prId) {
  const pullRequests = getPullRequests();
  const pr = pullRequests.find(p => p.id === prId);

  if (!pr) return;

  if (confirm(`Merge pull request #${prId} "${pr.title}"?`)) {
    mergePullRequest(prId);

    // CLI出力
    if (typeof printOutput === 'function') {
      printOutput(`Pull Request #${prId} merged!`);
      printSuccess(`"${pr.title}" has been merged into ${pr.targetBranch}`);
      printNewline();
    }

    renderGitHubUI();
  }
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

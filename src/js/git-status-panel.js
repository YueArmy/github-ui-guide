/**
 * git-status-panel.js - Git Status Panel
 * 現在のGit状態を常に表示
 */

// ========================================
// DOM Elements
// ========================================
let gitStatusPanel;

// ========================================
// Render Functions
// ========================================

/**
 * Git状態パネルを更新
 */
function renderGitStatusPanel() {
  if (!gitStatusPanel) return;

  // Clone前
  if (!isCloned()) {
    gitStatusPanel.innerHTML = `
      <div class="git-status__content git-status__content--not-cloned">
        <span class="git-status__label">Not a git repository</span>
        <span class="git-status__hint">Run git clone to start</span>
      </div>
    `;
    return;
  }

  const repo = getRepo();
  const staged = getStagedFiles();
  const modified = getModifiedFiles();
  const untracked = getUntrackedFiles();
  const unpushed = getUnpushedCommits();
  const commits = getCommits();

  // 状態アイコンと色を決定
  let statusIcon = '✓';
  let statusClass = 'git-status--clean';
  let statusText = 'Clean';

  if (staged.length > 0) {
    statusIcon = '●';
    statusClass = 'git-status--staged';
    statusText = 'Ready to commit';
  } else if (modified.length > 0 || untracked.length > 0) {
    statusIcon = '○';
    statusClass = 'git-status--modified';
    statusText = 'Changes detected';
  }

  if (unpushed.length > 0) {
    statusIcon = '↑';
    statusClass = 'git-status--unpushed';
    statusText = `${unpushed.length} to push`;
  }

  gitStatusPanel.innerHTML = `
    <div class="git-status__content ${statusClass}">
      <div class="git-status__branch">
        <span class="git-status__branch-icon">⎇</span>
        <span class="git-status__branch-name">${repo.currentBranch}</span>
        <span class="git-status__indicator">${statusIcon}</span>
      </div>
      <div class="git-status__stats">
        ${staged.length > 0 ? `<span class="git-status__stat git-status__stat--staged" title="Staged: ${staged.join(', ')}">● ${staged.length} staged</span>` : ''}
        ${modified.length > 0 ? `<span class="git-status__stat git-status__stat--modified" title="Modified: ${modified.join(', ')}">◐ ${modified.length} modified</span>` : ''}
        ${untracked.length > 0 ? `<span class="git-status__stat git-status__stat--untracked" title="Untracked: ${untracked.join(', ')}">? ${untracked.length} untracked</span>` : ''}
        ${unpushed.length > 0 ? `<span class="git-status__stat git-status__stat--unpushed">↑ ${unpushed.length} unpushed</span>` : ''}
        ${staged.length === 0 && modified.length === 0 && untracked.length === 0 && unpushed.length === 0 ? `<span class="git-status__stat git-status__stat--clean">✓ ${statusText}</span>` : ''}
      </div>
      <div class="git-status__commits">
        <span class="git-status__commits-count">${commits.length} commit${commits.length !== 1 ? 's' : ''}</span>
      </div>
    </div>
  `;
}

// ========================================
// Initialization
// ========================================

function initGitStatusPanel() {
  gitStatusPanel = document.getElementById('gitStatus');

  if (!gitStatusPanel) {
    console.error('Git status panel element not found');
    return;
  }

  // 状態変更時に再描画
  onStateChange(() => {
    renderGitStatusPanel();
  });

  // 初期描画
  renderGitStatusPanel();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGitStatusPanel);

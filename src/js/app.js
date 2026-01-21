/**
 * app.js - State Management
 * アプリケーション全体の状態管理
 */

// ========================================
// Initial State
// ========================================
const INITIAL_STATE = {
  repo: {
    name: 'my-project',
    owner: 'user',
    isCloned: false,
    currentBranch: 'main',
    remoteUrl: 'https://github.com/user/my-project.git'
  },
  files: {},
  commits: [],
  pushedCommitCount: 0,
  branches: ['main'],
  pullRequests: []
};

// ========================================
// State
// ========================================
let state = loadState() || structuredClone(INITIAL_STATE);

// ========================================
// State Getters
// ========================================
function getState() {
  return state;
}

function getRepo() {
  return state.repo;
}

function getFiles() {
  return state.files;
}

function getCommits() {
  return state.commits;
}

function getPushedCommitCount() {
  return state.pushedCommitCount;
}

function getBranches() {
  return state.branches || ['main'];
}

function getPullRequests() {
  return state.pullRequests || [];
}

function isCloned() {
  return state.repo.isCloned;
}

// ========================================
// State Setters
// ========================================
function setCloned(value) {
  state.repo.isCloned = value;
  saveState();
  notifyStateChange();
}

function addFile(filename, status = 'untracked') {
  state.files[filename] = { status };
  saveState();
  notifyStateChange();
}

function updateFileStatus(filename, status) {
  if (state.files[filename]) {
    state.files[filename].status = status;
    saveState();
    notifyStateChange();
  }
}

function removeFile(filename) {
  delete state.files[filename];
  saveState();
  notifyStateChange();
}

function addCommit(message, files) {
  const commit = {
    hash: generateHash(),
    message,
    timestamp: new Date().toISOString(),
    files: [...files]
  };
  state.commits.push(commit);
  saveState();
  notifyStateChange();
  return commit;
}

function setPushedCommitCount(count) {
  state.pushedCommitCount = count;
  saveState();
  notifyStateChange();
}

function resetState() {
  state = structuredClone(INITIAL_STATE);
  saveState();
  notifyStateChange();
}

function addBranch(branchName) {
  if (!state.branches) {
    state.branches = ['main'];
  }
  if (!state.branches.includes(branchName)) {
    state.branches.push(branchName);
    saveState();
    notifyStateChange();
  }
}

function removeBranch(branchName) {
  if (!state.branches) return;
  const index = state.branches.indexOf(branchName);
  if (index > -1) {
    state.branches.splice(index, 1);
    saveState();
    notifyStateChange();
  }
}

function setCurrentBranch(branchName) {
  state.repo.currentBranch = branchName;
  saveState();
  notifyStateChange();
}

function undoLastCommit() {
  if (state.commits.length > 0) {
    state.commits.pop();
    saveState();
    notifyStateChange();
  }
}

function addPullRequest(pr) {
  if (!state.pullRequests) {
    state.pullRequests = [];
  }
  const newPR = {
    id: state.pullRequests.length + 1,
    title: pr.title,
    description: pr.description || '',
    sourceBranch: pr.sourceBranch,
    targetBranch: pr.targetBranch || 'main',
    status: 'open',
    createdAt: new Date().toISOString(),
    commits: pr.commits || []
  };
  state.pullRequests.push(newPR);
  saveState();
  notifyStateChange();
  return newPR;
}

function updatePullRequestStatus(prId, status) {
  if (!state.pullRequests) return;
  const pr = state.pullRequests.find(p => p.id === prId);
  if (pr) {
    pr.status = status;
    saveState();
    notifyStateChange();
  }
}

function mergePullRequest(prId) {
  if (!state.pullRequests) return;
  const pr = state.pullRequests.find(p => p.id === prId);
  if (pr && pr.status === 'open') {
    pr.status = 'merged';
    pr.mergedAt = new Date().toISOString();
    saveState();
    notifyStateChange();
  }
}

// ========================================
// File Status Helpers
// ========================================
function getFilesByStatus(status) {
  return Object.entries(state.files)
    .filter(([_, file]) => file.status === status)
    .map(([name, _]) => name);
}

function getStagedFiles() {
  return getFilesByStatus('staged');
}

function getModifiedFiles() {
  return getFilesByStatus('modified');
}

function getUntrackedFiles() {
  return getFilesByStatus('untracked');
}

function getCommittedFiles() {
  return getFilesByStatus('committed');
}

function hasChanges() {
  return Object.values(state.files).some(
    file => file.status !== 'committed'
  );
}

function hasStagedChanges() {
  return getStagedFiles().length > 0;
}

// ========================================
// Commit Helpers
// ========================================
function getUnpushedCommits() {
  return state.commits.slice(state.pushedCommitCount);
}

function hasUnpushedCommits() {
  return getUnpushedCommits().length > 0;
}

function getLatestCommit() {
  return state.commits[state.commits.length - 1] || null;
}

function getPushedCommits() {
  return state.commits.slice(0, state.pushedCommitCount);
}

// ========================================
// Utility Functions
// ========================================
function generateHash() {
  const chars = '0123456789abcdef';
  let hash = '';
  for (let i = 0; i < 7; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// ========================================
// LocalStorage Persistence
// ========================================
const STORAGE_KEY = 'github-ui-guide-state';

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    console.error('Failed to load state:', e);
    return null;
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear state:', e);
  }
}

// ========================================
// State Change Notification
// ========================================
const stateListeners = [];

function onStateChange(callback) {
  stateListeners.push(callback);
}

function notifyStateChange() {
  stateListeners.forEach(callback => callback(state));
}

// ========================================
// Initialization
// ========================================
function initApp() {
  // Reset button handler
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all progress? This cannot be undone.')) {
        resetState();
        location.reload();
      }
    });
  }

  // Notify initial state
  notifyStateChange();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

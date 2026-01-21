/**
 * tutorial.js - Tutorial Guide
 * 現在の状態に応じたヒント表示
 */

// ========================================
// Tutorial Steps Definition
// ========================================

const TUTORIAL_STEPS = {
  NOT_CLONED: {
    title: 'Step 1: Clone the repository',
    hint: 'First, clone the repository to start working locally.',
    command: 'git clone https://github.com/user/my-project.git',
    explanation: 'git clone copies a remote repository to your local machine.'
  },
  CLONED_NO_FILES: {
    title: 'Step 2: Create a file',
    hint: 'Now create a new file to track.',
    command: 'Click "+ Add File" button above',
    explanation: 'In real development, you would create or edit files in your project folder.'
  },
  HAS_UNTRACKED: {
    title: 'Step 3: Stage your changes',
    hint: 'Add your new files to the staging area.',
    command: 'git add .',
    explanation: 'git add moves files to the "staging area" - preparing them for commit.'
  },
  HAS_MODIFIED: {
    title: 'Step 3: Stage your changes',
    hint: 'Stage your modified files.',
    command: 'git add .',
    explanation: 'Modified files need to be staged before committing.'
  },
  HAS_STAGED: {
    title: 'Step 4: Commit your changes',
    hint: 'Create a snapshot of your staged changes.',
    command: 'git commit -m "your message"',
    explanation: 'git commit saves a snapshot of your staged changes with a message.'
  },
  HAS_UNPUSHED: {
    title: 'Step 5: Push to remote',
    hint: 'Send your commits to GitHub.',
    command: 'git push',
    explanation: 'git push uploads your local commits to the remote repository (GitHub).'
  },
  ALL_PUSHED: {
    title: 'Complete!',
    hint: 'Your changes are now on GitHub! Try making more changes.',
    command: 'Click "Edit" on a file to modify it',
    explanation: 'The cycle continues: edit -> add -> commit -> push'
  }
};

// ========================================
// State Detection
// ========================================

/**
 * 現在の状態を判定
 */
function detectCurrentStep() {
  // Clone前
  if (!isCloned()) {
    return 'NOT_CLONED';
  }

  const files = getFiles();
  const fileCount = Object.keys(files).length;
  const untracked = getUntrackedFiles();
  const modified = getModifiedFiles();
  const staged = getStagedFiles();
  const unpushed = getUnpushedCommits();

  // Clone直後でファイルがREADME.mdだけ
  if (fileCount === 1 && files['README.md']?.status === 'committed' && untracked.length === 0 && modified.length === 0) {
    return 'CLONED_NO_FILES';
  }

  // Untrackedファイルがある
  if (untracked.length > 0) {
    return 'HAS_UNTRACKED';
  }

  // Modifiedファイルがある
  if (modified.length > 0) {
    return 'HAS_MODIFIED';
  }

  // Stagedファイルがある
  if (staged.length > 0) {
    return 'HAS_STAGED';
  }

  // Unpushedコミットがある
  if (unpushed.length > 0) {
    return 'HAS_UNPUSHED';
  }

  // 全部pushした
  return 'ALL_PUSHED';
}

// ========================================
// Render Functions
// ========================================

let tutorialElement;

/**
 * チュートリアルガイドを更新
 */
function renderTutorial() {
  if (!tutorialElement) return;

  const stepKey = detectCurrentStep();
  const step = TUTORIAL_STEPS[stepKey];
  const showCopyBtn = stepKey !== 'CLONED_NO_FILES' && stepKey !== 'ALL_PUSHED';

  tutorialElement.innerHTML = `
    <div class="tutorial__header">
      <span class="tutorial__icon">?</span>
      <span class="tutorial__title">${step.title}</span>
    </div>
    <div class="tutorial__content">
      <p class="tutorial__hint">${step.hint}</p>
      <div class="tutorial__command">
        <code>${step.command}</code>
        ${showCopyBtn ? `<button class="tutorial__copy-btn" id="tutorialCopyBtn">Copy</button>` : ''}
      </div>
      <p class="tutorial__explanation">${step.explanation}</p>
    </div>
  `;

  // Copyボタンのイベント設定
  if (showCopyBtn) {
    const copyBtn = document.getElementById('tutorialCopyBtn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        copyTutorialCommand(step.command);
      });
    }
  }
}

/**
 * コマンドをコピーしてCLI入力に貼り付け
 */
function copyTutorialCommand(command) {
  const cliInput = document.getElementById('cliInput');
  if (cliInput) {
    cliInput.value = command;
    cliInput.focus();
  }
}

// ========================================
// Initialization
// ========================================

function initTutorial() {
  tutorialElement = document.getElementById('tutorialGuide');

  if (!tutorialElement) {
    console.error('Tutorial element not found');
    return;
  }

  // 状態変更時に再描画
  onStateChange(() => {
    renderTutorial();
  });

  // 初期描画
  renderTutorial();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initTutorial);

/**
 * commands.js - Command Processing
 * コマンドのパースと実行
 */

// ========================================
// Command Definitions
// ========================================

const COMMANDS = {
  help: {
    description: 'Show available commands',
    usage: 'help'
  },
  clear: {
    description: 'Clear the terminal',
    usage: 'clear'
  },
  'git clone': {
    description: 'Clone a repository',
    usage: 'git clone <url>'
  },
  'git status': {
    description: 'Show working tree status',
    usage: 'git status'
  },
  'git add': {
    description: 'Add file(s) to staging',
    usage: 'git add <file> or git add .'
  },
  'git commit': {
    description: 'Record changes to repository',
    usage: 'git commit -m "message"'
  },
  'git push': {
    description: 'Push commits to remote',
    usage: 'git push'
  },
  'git log': {
    description: 'Show commit history',
    usage: 'git log'
  },
  'git reset': {
    description: 'Unstage or undo commits',
    usage: 'git reset HEAD <file> or git reset --soft HEAD~1'
  },
  'git diff': {
    description: 'Show changes in files',
    usage: 'git diff or git diff <file>'
  },
  'git checkout': {
    description: 'Discard changes or switch branches',
    usage: 'git checkout -- <file> or git checkout <branch>'
  },
  'git branch': {
    description: 'List or create branches',
    usage: 'git branch or git branch <name>'
  },
  'git pull': {
    description: 'Fetch and merge from remote',
    usage: 'git pull'
  }
};

// ========================================
// Command Parser
// ========================================

function parseCommand(input) {
  // クォートで囲まれた部分を保護しつつ分割
  const parts = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if ((char === '"' || char === "'") && !inQuote) {
      inQuote = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuote) {
      inQuote = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuote) {
      if (current) {
        parts.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }

  if (current) {
    parts.push(current);
  }

  return parts;
}

// ========================================
// Command Executor
// ========================================

function executeCommand(input) {
  const parts = parseCommand(input);

  if (parts.length === 0) return;

  const command = parts[0].toLowerCase();
  const args = parts.slice(1);

  // Basic commands
  if (command === 'help') {
    return cmdHelp();
  }

  if (command === 'clear') {
    return cmdClear();
  }

  // Git commands
  if (command === 'git') {
    if (args.length === 0) {
      printError('usage: git <command> [<args>]');
      return;
    }

    const gitCommand = args[0].toLowerCase();
    const gitArgs = args.slice(1);

    switch (gitCommand) {
      case 'clone':
        return cmdGitClone(gitArgs);
      case 'status':
        return cmdGitStatus();
      case 'add':
        return cmdGitAdd(gitArgs);
      case 'commit':
        return cmdGitCommit(gitArgs);
      case 'push':
        return cmdGitPush();
      case 'log':
        return cmdGitLog();
      case 'reset':
        return cmdGitReset(gitArgs);
      case 'diff':
        return cmdGitDiff(gitArgs);
      case 'checkout':
        return cmdGitCheckout(gitArgs);
      case 'branch':
        return cmdGitBranch(gitArgs);
      case 'pull':
        return cmdGitPull();
      default:
        printError(`git: '${gitCommand}' is not a git command.`);
        printOutput('Type "help" to see available commands.');
    }
    return;
  }

  // Unknown command
  printError(`command not found: ${command}`);
  printOutput('Type "help" to see available commands.');
}

// ========================================
// Basic Commands
// ========================================

function cmdHelp() {
  printOutput('Available commands:');
  printOutput('');

  for (const [cmd, info] of Object.entries(COMMANDS)) {
    printOutput(`  ${info.usage.padEnd(30)} ${info.description}`);
  }

  printOutput('');
  printOutput('Try: git clone https://github.com/user/my-project.git');
  printOutput('');
  printOutput('Tip: Type "clear" to clear this terminal.');
}

function cmdClear() {
  clearOutput();
}

// ========================================
// Git Commands
// ========================================

function cmdGitClone(args) {
  if (isCloned()) {
    printError('fatal: destination path already exists');
    return;
  }

  if (args.length === 0) {
    printError('usage: git clone <repository>');
    return;
  }

  const url = args[0];
  const repo = getRepo();

  // URL検証（簡易的）
  if (!url.includes('github.com') && !url.includes(repo.remoteUrl)) {
    printError(`fatal: repository '${url}' not found`);
    return;
  }

  // Clone実行
  printOutput(`Cloning into '${repo.name}'...`);
  printOutput('remote: Enumerating objects: 3, done.');
  printOutput('remote: Counting objects: 100% (3/3), done.');
  printOutput('remote: Total 3 (delta 0), reused 0 (delta 0)');

  // 状態更新
  setCloned(true);

  // 初期ファイルを追加（README.md）
  addFile('README.md', 'committed');

  printSuccess(`Successfully cloned ${repo.name}`);
}

function cmdGitStatus() {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const repo = getRepo();
  printOutput(`On branch ${repo.currentBranch}`);

  const staged = getStagedFiles();
  const modified = getModifiedFiles();
  const untracked = getUntrackedFiles();

  // Unpushed commits
  if (hasUnpushedCommits()) {
    const unpushed = getUnpushedCommits();
    printOutput(`Your branch is ahead of 'origin/${repo.currentBranch}' by ${unpushed.length} commit(s).`);
    printOutput('  (use "git push" to publish your local commits)');
    printOutput('');
  }

  // Staged files
  if (staged.length > 0) {
    printOutput('Changes to be committed:');
    printOutput('  (use "git reset HEAD <file>..." to unstage)');
    printOutput('');
    staged.forEach(file => {
      printOutput(`        new file:   ${file}`);
    });
    printOutput('');
  }

  // Modified files
  if (modified.length > 0) {
    printOutput('Changes not staged for commit:');
    printOutput('  (use "git add <file>..." to update what will be committed)');
    printOutput('');
    modified.forEach(file => {
      printOutput(`        modified:   ${file}`);
    });
    printOutput('');
  }

  // Untracked files
  if (untracked.length > 0) {
    printOutput('Untracked files:');
    printOutput('  (use "git add <file>..." to include in what will be committed)');
    printOutput('');
    untracked.forEach(file => {
      printOutput(`        ${file}`);
    });
    printOutput('');
  }

  // Clean state
  if (staged.length === 0 && modified.length === 0 && untracked.length === 0) {
    printOutput('nothing to commit, working tree clean');
  }
}

function cmdGitAdd(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  if (args.length === 0) {
    printError('Nothing specified, nothing added.');
    printOutput('hint: Maybe you wanted to say "git add ."?');
    return;
  }

  const target = args[0];

  // git add .
  if (target === '.') {
    const modified = getModifiedFiles();
    const untracked = getUntrackedFiles();
    const toStage = [...modified, ...untracked];

    if (toStage.length === 0) {
      printOutput('Nothing to add.');
      return;
    }

    toStage.forEach(file => {
      updateFileStatus(file, 'staged');
    });
    printSuccess(`Added ${toStage.length} file(s) to staging.`);
    return;
  }

  // 特定のファイル
  const files = getFiles();
  if (!files[target]) {
    printError(`fatal: pathspec '${target}' did not match any files`);
    return;
  }

  const status = files[target].status;
  if (status === 'committed') {
    printOutput(`'${target}' is already up to date.`);
    return;
  }

  if (status === 'staged') {
    printOutput(`'${target}' is already staged.`);
    return;
  }

  updateFileStatus(target, 'staged');
  printSuccess(`Added '${target}' to staging.`);
}

function cmdGitCommit(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  // -m オプションをパース
  const mIndex = args.indexOf('-m');
  if (mIndex === -1 || mIndex === args.length - 1) {
    printError('error: switch `m\' requires a value');
    printOutput('usage: git commit -m "message"');
    return;
  }

  const message = args[mIndex + 1];

  if (!message || message.trim() === '') {
    printError('Aborting commit due to empty commit message.');
    return;
  }

  const staged = getStagedFiles();

  if (staged.length === 0) {
    printError('nothing to commit (use "git add" to stage files)');
    return;
  }

  // コミット作成
  const commit = addCommit(message, staged);

  // ステージングされたファイルをcommitted状態に
  staged.forEach(file => {
    updateFileStatus(file, 'committed');
  });

  printOutput(`[${getRepo().currentBranch} ${commit.hash}] ${message}`);
  printOutput(` ${staged.length} file(s) changed`);
  printSuccess('Commit created successfully.');
}

function cmdGitPush() {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const unpushed = getUnpushedCommits();

  if (unpushed.length === 0) {
    printOutput('Everything up-to-date');
    return;
  }

  const repo = getRepo();

  printOutput(`Enumerating objects: ${unpushed.length * 3}, done.`);
  printOutput('Counting objects: 100%, done.');
  printOutput('Writing objects: 100%, done.');
  printOutput(`To ${repo.remoteUrl}`);

  const firstHash = unpushed[0].hash;
  const lastHash = unpushed[unpushed.length - 1].hash;
  printOutput(`   ${firstHash}..${lastHash}  ${repo.currentBranch} -> ${repo.currentBranch}`);

  // pushedCommitCount更新
  setPushedCommitCount(getCommits().length);

  printSuccess(`Pushed ${unpushed.length} commit(s) to origin/${repo.currentBranch}`);
}

function cmdGitLog() {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const commits = getCommits();

  if (commits.length === 0) {
    printOutput('No commits yet.');
    return;
  }

  // 新しい順に表示
  const reversed = [...commits].reverse();

  reversed.forEach(commit => {
    printOutput(`commit ${commit.hash}`);
    printOutput(`Date:   ${new Date(commit.timestamp).toLocaleString()}`);
    printOutput('');
    printOutput(`    ${commit.message}`);
    printOutput('');
  });
}

function cmdGitReset(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  // git reset --soft HEAD~1
  if (args.length >= 2 && args[0] === '--soft' && args[1] === 'HEAD~1') {
    return cmdGitResetSoft();
  }

  // git reset HEAD <file>
  if (args.length < 2 || args[0].toUpperCase() !== 'HEAD') {
    printError('usage: git reset HEAD <file> or git reset --soft HEAD~1');
    return;
  }

  const target = args[1];
  const files = getFiles();

  if (!files[target]) {
    printError(`fatal: pathspec '${target}' did not match any files`);
    return;
  }

  if (files[target].status !== 'staged') {
    printOutput(`'${target}' is not staged.`);
    return;
  }

  // staged -> modified or untracked（簡易的にmodifiedに戻す）
  updateFileStatus(target, 'modified');
  printOutput(`Unstaged changes after reset:`);
  printOutput(`M\t${target}`);
}

// ========================================
// Git Diff
// ========================================

function cmdGitDiff(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const files = getFiles();
  const modified = getModifiedFiles();
  const untracked = getUntrackedFiles();
  const staged = getStagedFiles();

  // 特定ファイルの差分
  if (args.length > 0) {
    const target = args[0];
    if (!files[target]) {
      printError(`fatal: pathspec '${target}' did not match any files`);
      return;
    }

    const status = files[target].status;
    if (status === 'committed') {
      printOutput('No changes.');
      return;
    }

    renderFileDiff(target, status);
    return;
  }

  // 全ファイルの差分（staged以外）
  const changedFiles = [...modified, ...untracked];

  if (changedFiles.length === 0) {
    printOutput('No changes.');
    return;
  }

  changedFiles.forEach(filename => {
    renderFileDiff(filename, files[filename].status);
  });
}

/**
 * シミュレートされた差分を表示
 */
function renderFileDiff(filename, status) {
  printOutput(`diff --git a/${filename} b/${filename}`);

  if (status === 'untracked') {
    printOutput('new file mode 100644');
    printOutput('--- /dev/null');
    printOutput(`+++ b/${filename}`);
    printOutput('@@ -0,0 +1,3 @@');
    printOutput(`+// ${filename}`);
    printOutput('+// New file created');
    printOutput('+// Add your content here');
  } else {
    printOutput('--- a/' + filename);
    printOutput('+++ b/' + filename);
    printOutput('@@ -1,3 +1,5 @@');
    printOutput(` // ${filename}`);
    printOutput(' // Original content');
    printOutput('+// Modified line 1');
    printOutput('+// Modified line 2');
    printOutput(' // End of file');
  }
  printOutput('');
}

// ========================================
// Git Checkout
// ========================================

function cmdGitCheckout(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  if (args.length === 0) {
    printError('usage: git checkout -- <file> or git checkout <branch>');
    return;
  }

  // git checkout -- <file>（変更を破棄）
  if (args[0] === '--') {
    if (args.length < 2) {
      printError('error: you must specify path(s) to restore');
      return;
    }

    const target = args[1];
    const files = getFiles();

    if (!files[target]) {
      printError(`error: pathspec '${target}' did not match any file(s) known to git`);
      return;
    }

    const status = files[target].status;

    if (status === 'committed') {
      printOutput(`'${target}' has no changes to discard.`);
      return;
    }

    if (status === 'untracked') {
      // Untrackedファイルは削除
      removeFile(target);
      printOutput(`Removed untracked file: ${target}`);
      return;
    }

    // modified or staged -> committed に戻す
    updateFileStatus(target, 'committed');
    printOutput(`Updated 1 path from the index`);
    printSuccess(`Discarded changes to '${target}'`);
    return;
  }

  // git checkout -b <branch>（新規ブランチ作成）
  if (args[0] === '-b') {
    if (args.length < 2) {
      printError('error: switch `b\' requires a value');
      return;
    }
    const branchName = args[1];
    return createAndSwitchBranch(branchName);
  }

  // git checkout <branch>（ブランチ切り替え）
  const branchName = args[0];
  return switchBranch(branchName);
}

// ========================================
// Git Branch
// ========================================

function cmdGitBranch(args) {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const branches = getBranches();
  const currentBranch = getRepo().currentBranch;

  // ブランチ一覧
  if (args.length === 0) {
    branches.forEach(branch => {
      if (branch === currentBranch) {
        printSuccess(`* ${branch}`);
      } else {
        printOutput(`  ${branch}`);
      }
    });
    return;
  }

  // git branch -d <name>（ブランチ削除）
  if (args[0] === '-d' || args[0] === '-D') {
    if (args.length < 2) {
      printError('error: branch name required');
      return;
    }
    const branchName = args[1];
    return deleteBranch(branchName);
  }

  // 新規ブランチ作成
  const branchName = args[0];
  return createBranch(branchName);
}

// ========================================
// Git Pull
// ========================================

function cmdGitPull() {
  if (!isCloned()) {
    printError('fatal: not a git repository');
    return;
  }

  const repo = getRepo();
  printOutput(`From ${repo.remoteUrl}`);
  printOutput(` * branch            ${repo.currentBranch}     -> FETCH_HEAD`);
  printOutput('Already up to date.');
}

// ========================================
// Git Reset Soft
// ========================================

function cmdGitResetSoft() {
  const commits = getCommits();
  const pushedCount = getPushedCommitCount();

  if (commits.length === 0) {
    printError('fatal: no commits to reset');
    return;
  }

  // Pushedコミットは取り消せない
  if (commits.length <= pushedCount) {
    printError('Cannot reset pushed commits. Use git revert instead.');
    return;
  }

  // 最新のコミットを取得
  const lastCommit = commits[commits.length - 1];

  // コミットを削除（stateから）
  undoLastCommit();

  // コミットされたファイルをstagedに戻す
  lastCommit.files.forEach(filename => {
    const files = getFiles();
    if (files[filename]) {
      updateFileStatus(filename, 'staged');
    }
  });

  printOutput(`HEAD is now at ${commits.length > 1 ? commits[commits.length - 2].hash : 'initial'}`);
  printSuccess(`Undid commit: "${lastCommit.message}"`);
  printOutput('Changes are still staged. You can modify and recommit.');
}

// ========================================
// Branch Helper Functions
// ========================================

function createBranch(branchName) {
  const branches = getBranches();

  // バリデーション
  if (!/^[\w\-\/]+$/.test(branchName)) {
    printError(`fatal: '${branchName}' is not a valid branch name`);
    return;
  }

  if (branches.includes(branchName)) {
    printError(`fatal: a branch named '${branchName}' already exists`);
    return;
  }

  addBranch(branchName);
  printSuccess(`Created branch '${branchName}'`);
}

function switchBranch(branchName) {
  const branches = getBranches();
  const currentBranch = getRepo().currentBranch;

  if (branchName === currentBranch) {
    printOutput(`Already on '${branchName}'`);
    return;
  }

  if (!branches.includes(branchName)) {
    printError(`error: pathspec '${branchName}' did not match any branch known to git`);
    printOutput(`hint: Try 'git checkout -b ${branchName}' to create a new branch.`);
    return;
  }

  // 未コミットの変更があるか確認
  if (hasChanges()) {
    printError('error: Your local changes would be overwritten by checkout.');
    printOutput('Please commit your changes or stash them before switching branches.');
    return;
  }

  setCurrentBranch(branchName);
  printOutput(`Switched to branch '${branchName}'`);
}

function createAndSwitchBranch(branchName) {
  const branches = getBranches();

  // バリデーション
  if (!/^[\w\-\/]+$/.test(branchName)) {
    printError(`fatal: '${branchName}' is not a valid branch name`);
    return;
  }

  if (branches.includes(branchName)) {
    printError(`fatal: a branch named '${branchName}' already exists`);
    return;
  }

  addBranch(branchName);
  setCurrentBranch(branchName);
  printOutput(`Switched to a new branch '${branchName}'`);
}

function deleteBranch(branchName) {
  const branches = getBranches();
  const currentBranch = getRepo().currentBranch;

  if (!branches.includes(branchName)) {
    printError(`error: branch '${branchName}' not found`);
    return;
  }

  if (branchName === currentBranch) {
    printError(`error: Cannot delete branch '${branchName}' checked out`);
    return;
  }

  if (branchName === 'main') {
    printError(`error: Cannot delete the main branch`);
    return;
  }

  removeBranch(branchName);
  printOutput(`Deleted branch ${branchName}`);
}

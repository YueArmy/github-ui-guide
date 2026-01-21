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
    description: 'Unstage a file',
    usage: 'git reset HEAD <file>'
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

  // git reset HEAD <file>
  if (args.length < 2 || args[0].toUpperCase() !== 'HEAD') {
    printError('usage: git reset HEAD <file>');
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

/**
 * scenarios.js - Learning Scenarios
 * 複数の学習シナリオを管理
 */

// ========================================
// Scenario Definitions
// ========================================

const SCENARIOS = {
  first_push: {
    id: 'first_push',
    title: 'First Push',
    description: 'Learn the basic Git workflow: clone, add, commit, push',
    difficulty: 'Beginner',
    steps: [
      'Clone the repository',
      'Create a new file',
      'Stage your changes with git add',
      'Commit your changes',
      'Push to GitHub'
    ],
    initialState: null // Uses default state
  },
  edit_flow: {
    id: 'edit_flow',
    title: 'Edit & Update',
    description: 'Learn how to edit files and push updates',
    difficulty: 'Beginner',
    steps: [
      'Edit an existing file',
      'Check the diff to see changes',
      'Stage and commit your edits',
      'Push your updates'
    ],
    initialState: {
      repo: {
        name: 'my-project',
        owner: 'user',
        isCloned: true,
        currentBranch: 'main',
        remoteUrl: 'https://github.com/user/my-project.git'
      },
      files: {
        'README.md': { status: 'committed' },
        'index.html': { status: 'committed' }
      },
      commits: [
        {
          hash: 'abc1234',
          message: 'Initial commit',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          files: ['README.md', 'index.html']
        }
      ],
      pushedCommitCount: 1,
      branches: ['main']
    }
  },
  undo_changes: {
    id: 'undo_changes',
    title: 'Fix Mistakes',
    description: 'Learn how to undo changes and recover from errors',
    difficulty: 'Intermediate',
    steps: [
      'Make changes to a file',
      'Discard changes with git checkout',
      'Stage a file then unstage it',
      'Create a commit then undo it'
    ],
    initialState: {
      repo: {
        name: 'my-project',
        owner: 'user',
        isCloned: true,
        currentBranch: 'main',
        remoteUrl: 'https://github.com/user/my-project.git'
      },
      files: {
        'README.md': { status: 'committed' },
        'app.js': { status: 'committed' },
        'style.css': { status: 'committed' }
      },
      commits: [
        {
          hash: 'def5678',
          message: 'Add project files',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          files: ['README.md', 'app.js', 'style.css']
        }
      ],
      pushedCommitCount: 1,
      branches: ['main']
    }
  },
  branch_basics: {
    id: 'branch_basics',
    title: 'Branch Basics',
    description: 'Learn how to create and use branches',
    difficulty: 'Intermediate',
    steps: [
      'Create a new branch',
      'Switch to the new branch',
      'Make changes and commit',
      'Switch back to main'
    ],
    initialState: {
      repo: {
        name: 'my-project',
        owner: 'user',
        isCloned: true,
        currentBranch: 'main',
        remoteUrl: 'https://github.com/user/my-project.git'
      },
      files: {
        'README.md': { status: 'committed' },
        'index.html': { status: 'committed' }
      },
      commits: [
        {
          hash: 'ghi9012',
          message: 'Initial project setup',
          timestamp: new Date(Date.now() - 172800000).toISOString(),
          files: ['README.md', 'index.html']
        }
      ],
      pushedCommitCount: 1,
      branches: ['main']
    }
  }
};

// ========================================
// Current Scenario
// ========================================

let currentScenario = 'first_push';

function getCurrentScenario() {
  return currentScenario;
}

function getScenarioData(scenarioId) {
  return SCENARIOS[scenarioId] || SCENARIOS.first_push;
}

// ========================================
// Scenario Selection
// ========================================

function selectScenario(scenarioId) {
  if (!SCENARIOS[scenarioId]) {
    console.error(`Unknown scenario: ${scenarioId}`);
    return;
  }

  currentScenario = scenarioId;
  const scenario = SCENARIOS[scenarioId];

  // Clear current state
  clearState();

  // Apply scenario's initial state if defined
  if (scenario.initialState) {
    applyScenarioState(scenario.initialState);
  } else {
    resetState();
  }

  // Update CLI message
  clearOutput();
  printOutput(`Scenario: ${scenario.title}`);
  printOutput(scenario.description);
  printOutput('');
  printOutput('Steps to complete:');
  scenario.steps.forEach((step, i) => {
    printOutput(`  ${i + 1}. ${step}`);
  });
  printOutput('');
  printOutput('Type "help" to see available commands.');
  printNewline();

  // Update scenario selector UI
  updateScenarioSelector();
}

function applyScenarioState(initialState) {
  // Manually set state (this is a hack, but works for scenarios)
  const stateStr = JSON.stringify(initialState);
  localStorage.setItem('github-ui-guide-state', stateStr);
  location.reload();
}

// ========================================
// UI Functions
// ========================================

let scenarioSelector;

function renderScenarioSelector() {
  if (!scenarioSelector) return;

  let optionsHtml = '';
  for (const [id, scenario] of Object.entries(SCENARIOS)) {
    const selected = id === currentScenario ? 'selected' : '';
    optionsHtml += `<option value="${id}" ${selected}>${scenario.title} (${scenario.difficulty})</option>`;
  }

  scenarioSelector.innerHTML = optionsHtml;
}

function updateScenarioSelector() {
  if (scenarioSelector) {
    scenarioSelector.value = currentScenario;
  }
}

function handleScenarioChange(e) {
  const selectedId = e.target.value;
  if (selectedId !== currentScenario) {
    if (confirm(`Switch to "${SCENARIOS[selectedId].title}" scenario? This will reset your progress.`)) {
      selectScenario(selectedId);
    } else {
      // Revert selection
      scenarioSelector.value = currentScenario;
    }
  }
}

// ========================================
// Initialization
// ========================================

function initScenarios() {
  scenarioSelector = document.getElementById('scenarioSelector');

  if (scenarioSelector) {
    renderScenarioSelector();
    scenarioSelector.addEventListener('change', handleScenarioChange);
  }

  // Load saved scenario preference
  const savedScenario = localStorage.getItem('github-ui-guide-scenario');
  if (savedScenario && SCENARIOS[savedScenario]) {
    currentScenario = savedScenario;
    updateScenarioSelector();
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initScenarios);

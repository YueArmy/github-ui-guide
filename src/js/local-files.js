/**
 * local-files.js - Local Files Area
 * ローカルファイルエリアのUI管理
 */

// ========================================
// DOM Elements
// ========================================
let localFilesSection;
let fileList;
let addFileBtn;
let addFileModal;
let newFileNameInput;
let cancelAddFileBtn;
let confirmAddFileBtn;

// ========================================
// Status Labels
// ========================================
const STATUS_LABELS = {
  untracked: 'Untracked',
  modified: 'Modified',
  staged: 'Staged',
  committed: 'Committed'
};

// ========================================
// Render Functions
// ========================================

/**
 * ローカルファイルエリアを更新
 */
function renderLocalFiles() {
  // Clone前は非表示
  if (!isCloned()) {
    localFilesSection.classList.add('local-files--hidden');
    return;
  }

  localFilesSection.classList.remove('local-files--hidden');

  const files = getFiles();
  fileList.innerHTML = '';

  // ファイルがない場合
  if (Object.keys(files).length === 0) {
    const emptyItem = document.createElement('li');
    emptyItem.className = 'local-files__item';
    emptyItem.innerHTML = '<span class="local-files__name" style="color: var(--text-muted);">No files yet</span>';
    fileList.appendChild(emptyItem);
    return;
  }

  // ファイル一覧を表示
  for (const [filename, file] of Object.entries(files)) {
    const item = createFileItem(filename, file.status);
    fileList.appendChild(item);
  }
}

/**
 * ファイルアイテム要素を作成
 */
function createFileItem(filename, status) {
  const item = document.createElement('li');
  item.className = 'local-files__item';

  // ファイル名
  const nameSpan = document.createElement('span');
  nameSpan.className = 'local-files__name';
  nameSpan.textContent = filename;

  // ステータスバッジ
  const statusSpan = document.createElement('span');
  statusSpan.className = `local-files__status local-files__status--${status}`;
  statusSpan.textContent = STATUS_LABELS[status];

  // 編集ボタン（committedの場合のみ表示）
  const editBtn = document.createElement('button');
  editBtn.className = 'local-files__edit-btn';
  editBtn.textContent = 'Edit';
  editBtn.addEventListener('click', () => handleEditFile(filename));

  // 要素を組み立て
  const leftSection = document.createElement('div');
  leftSection.style.display = 'flex';
  leftSection.style.alignItems = 'center';
  leftSection.style.gap = '8px';
  leftSection.appendChild(nameSpan);
  leftSection.appendChild(statusSpan);

  const rightSection = document.createElement('div');
  rightSection.appendChild(editBtn);

  item.appendChild(leftSection);
  item.appendChild(rightSection);

  return item;
}

// ========================================
// Event Handlers
// ========================================

/**
 * ファイル編集ボタンクリック
 */
function handleEditFile(filename) {
  const files = getFiles();

  if (!files[filename]) return;

  // committedまたはstagedの場合はmodifiedに変更
  if (files[filename].status === 'committed' || files[filename].status === 'staged') {
    updateFileStatus(filename, 'modified');
    printOutput(`Modified: ${filename}`);
    printOutput('(Use "git add" to stage your changes)');
    printNewline();
  }
}

/**
 * ファイル追加ボタンクリック
 */
function handleAddFileClick() {
  if (!isCloned()) {
    printError('Clone a repository first!');
    return;
  }

  // モーダルを表示
  addFileModal.classList.remove('modal--hidden');
  newFileNameInput.value = '';
  newFileNameInput.focus();
}

/**
 * ファイル追加キャンセル
 */
function handleCancelAddFile() {
  addFileModal.classList.add('modal--hidden');
}

/**
 * ファイル追加確定
 */
function handleConfirmAddFile() {
  const filename = newFileNameInput.value.trim();

  if (!filename) {
    return;
  }

  // ファイル名のバリデーション（日本語OK、スペースと特殊文字はNG）
  if (!/^[^\/\\:*?"<>|]+$/.test(filename) || filename.startsWith('.')) {
    alert('Invalid filename. Avoid special characters: / \\ : * ? " < > |');
    return;
  }

  // 既存ファイルチェック
  const files = getFiles();
  if (files[filename]) {
    alert('File already exists.');
    return;
  }

  // ファイル追加
  addFile(filename, 'untracked');

  // モーダルを閉じる
  addFileModal.classList.add('modal--hidden');

  // CLI出力
  printOutput(`Created: ${filename}`);
  printOutput('(New file is untracked. Use "git add" to stage it)');
  printNewline();
}

/**
 * モーダル内でEnterキー
 */
function handleModalKeydown(e) {
  if (e.key === 'Enter') {
    handleConfirmAddFile();
  }
  if (e.key === 'Escape') {
    handleCancelAddFile();
  }
}

// ========================================
// Initialization
// ========================================

function initLocalFiles() {
  localFilesSection = document.getElementById('localFiles');
  fileList = document.getElementById('fileList');
  addFileBtn = document.getElementById('addFileBtn');
  addFileModal = document.getElementById('addFileModal');
  newFileNameInput = document.getElementById('newFileName');
  cancelAddFileBtn = document.getElementById('cancelAddFile');
  confirmAddFileBtn = document.getElementById('confirmAddFile');

  if (!localFilesSection || !fileList) {
    console.error('Local files elements not found');
    return;
  }

  // イベントリスナー設定
  if (addFileBtn) {
    addFileBtn.addEventListener('click', handleAddFileClick);
  }

  if (cancelAddFileBtn) {
    cancelAddFileBtn.addEventListener('click', handleCancelAddFile);
  }

  if (confirmAddFileBtn) {
    confirmAddFileBtn.addEventListener('click', handleConfirmAddFile);
  }

  if (newFileNameInput) {
    newFileNameInput.addEventListener('keydown', handleModalKeydown);
  }

  // 状態変更時に再描画
  onStateChange(() => {
    renderLocalFiles();
  });

  // 初期描画
  renderLocalFiles();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initLocalFiles);

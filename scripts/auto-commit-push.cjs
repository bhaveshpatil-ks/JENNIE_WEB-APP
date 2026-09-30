/**
 * Jennie Web App - Automated Contribution & Separate-File Push Engine
 * 
 * Functions:
 * 1. Scans for any changed, added, or untracked files in git.
 * 2. Commits each changed file individually with a dedicated, semantic commit message.
 * 3. Immediately pushes each commit one-by-one to GitHub to boost contribution counts.
 * 4. Supports --watch mode: continuously detects saved files and pushes them automatically!
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

function runGit(command, options = {}) {
  try {
    const res = execSync(command, {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: options.silent ? 'pipe' : 'inherit',
    });
    return typeof res === 'string' ? res.trim() : '';
  } catch (err) {
    if (!options.silent) {
      console.error(`[Git Error] Command failed: ${command}\n${err.message}`);
    }
    return null;
  }
}

function getCommitMessageForFile(file) {
  const ext = path.extname(file);
  const base = path.basename(file);
  const dir = path.dirname(file).replace(/\\/g, '/');

  if (file === '.env.example') return 'config: update environment variable template';
  if (file === 'package.json') return 'chore: update project dependencies and scripts';
  if (file === 'vite.config.js') return 'build: optimize Vite proxy and build options';
  if (file === 'tailwind.config.js') return 'style: refine Tailwind design tokens and theme';
  if (file === 'capacitor.config.json') return 'mobile: update Capacitor native bridge settings';
  if (file === 'README.md') return 'docs: enhance project documentation and architecture';

  if (dir.includes('src/components/feedback') || dir.includes('src/pages') && base.includes('Feedback')) {
    return `feat(feedback): enhance ${base} with latest resolution updates`;
  }
  if (dir.includes('src/components/player')) {
    return `feat(player): improve ${base} playback and control UX`;
  }
  if (dir.includes('src/components/auth')) {
    return `feat(auth): improve ${base} security and credential flows`;
  }
  if (dir.includes('src/components/settings')) {
    return `feat(settings): refine ${base} audio preferences and support`;
  }
  if (dir.includes('src/components/layout')) {
    return `feat(layout): optimize ${base} navigation and responsiveness`;
  }
  if (dir.includes('src/services')) {
    return `feat(service): enhance ${base} client-server logic`;
  }
  if (dir.includes('src/store')) {
    return `feat(store): update ${base} reactive state management`;
  }
  if (dir.includes('src/pages/legal')) {
    return `docs(legal): update ${base} compliance guidelines`;
  }
  if (dir.includes('src/data')) {
    return `data: update ${base} music library dataset`;
  }
  if (dir.includes('electron')) {
    return `desktop: refine Electron desktop wrapper ${base}`;
  }
  if (dir.includes('android') || dir.includes('ios')) {
    return `mobile: update native platform configuration ${base}`;
  }

  return `feat: update ${base} with improvements`;
}

function getChangedFiles() {
  const statusOutput = runGit('git status --porcelain -u', { silent: true });
  if (!statusOutput) return [];

  const lines = statusOutput.split('\n').filter(Boolean);
  const files = [];

  for (const line of lines) {
    const match = line.match(/^.{2}\s+(.+)$/);
    if (!match) continue;

    let filePath = match[1].trim();

    // Remove quotes if present
    if (filePath.startsWith('"') && filePath.endsWith('"')) {
      filePath = filePath.slice(1, -1);
    }

    // Ignore sensitive or build outputs
    if (
      filePath.includes('.env') && filePath !== '.env.example' ||
      filePath.startsWith('node_modules') ||
      filePath.startsWith('dist') ||
      filePath.endsWith('.log')
    ) {
      continue;
    }

    files.push({ path: filePath });
  }

  return files;
}

function commitAndPushOneByOne() {
  const changed = getChangedFiles();
  if (changed.length === 0) {
    console.log('✨ Working tree clean. No files to commit.');
    return 0;
  }

  console.log(`\n🚀 Found ${changed.length} changed file(s). Committing & pushing one-by-one to boost contributions...\n`);

  let count = 0;
  for (const item of changed) {
    count++;
    const file = item.path;
    const msg = getCommitMessageForFile(file);

    console.log(`[${count}/${changed.length}] Processing: ${file}`);
    runGit(`git add -- "${file}"`, { silent: true });
    
    // Commit
    const commitRes = runGit(`git commit -m "${msg}"`, { silent: false });
    if (commitRes !== null) {
      // Push immediately
      console.log(`   ⬆️ Pushing: "${msg}"`);
      runGit('git push origin main', { silent: false });
      console.log(`   ✅ Contribution recorded for ${file}\n`);
    }
  }

  console.log(`🎉 All ${count} files pushed separately and contribution graph updated!\n`);
  return count;
}

// Watch Mode
function startWatchMode() {
  console.log('👀 Watching repository for changes (auto-commit & push enabled)...');
  console.log('💡 Any file you edit or save will be automatically committed and pushed separately!\n');

  let debounceTimer = null;
  const watchDirs = ['src', 'public', 'electron'];

  const triggerAutoPush = () => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log('⚡ File change detected, initiating separate commit & push cycle...');
      commitAndPushOneByOne();
    }, 4000); // 4-second debounce to let multiple edits settle
  };

  watchDirs.forEach((dir) => {
    const fullDir = path.join(rootDir, dir);
    if (fs.existsSync(fullDir)) {
      fs.watch(fullDir, { recursive: true }, (eventType, filename) => {
        if (filename && !filename.includes('.git') && !filename.includes('node_modules')) {
          triggerAutoPush();
        }
      });
    }
  });

  // Also watch root config files
  fs.watch(rootDir, { recursive: false }, (eventType, filename) => {
    if (filename && (filename.endsWith('.json') || filename.endsWith('.js') || filename.endsWith('.md'))) {
      triggerAutoPush();
    }
  });

  // Keep process alive
  setInterval(() => {}, 1000 * 60 * 60);
}

// CLI Entry point
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');

if (isWatch) {
  commitAndPushOneByOne();
  startWatchMode();
} else {
  commitAndPushOneByOne();
}

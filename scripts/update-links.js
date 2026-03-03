/**
 * Migration script: Replace Link, NavLink, useNavigate from react-router-dom
 * with LocalizedLink, LocalizedNavLink, and useLocalizedNavigate.
 *
 * Usage: node scripts/update-links.js [--dry-run]
 */

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry-run');
const CLIENT_SRC = path.resolve(__dirname, '..', 'client', 'src');

// Files to exclude from modification
const EXCLUDED_FILES = new Set([
  path.resolve(CLIENT_SRC, 'App.jsx'),
  path.resolve(CLIENT_SRC, 'components/LocalizedLink/LocalizedLink.jsx'),
  path.resolve(CLIENT_SRC, 'hooks/useLocalizedNavigate.js'),
  path.resolve(CLIENT_SRC, 'components/LanguageWrapper/LanguageWrapper.jsx'),
  path.resolve(CLIENT_SRC, 'components/LanguageSwitcher/LanguageSwitcher.jsx'),
  path.resolve(CLIENT_SRC, 'utils/languageUtils.js'),
]);

const stats = { filesScanned: 0, filesModified: 0, linkReplaced: 0, navLinkReplaced: 0, navigateReplaced: 0 };

function getAllFiles(dir, exts = ['.jsx', '.js']) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git') continue;
      results = results.concat(getAllFiles(fullPath, exts));
    } else if (exts.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function getRelativePath(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = './' + rel;
  // Remove .js/.jsx extension for import
  rel = rel.replace(/\.(jsx|js)$/, '');
  return rel;
}

function processFile(filePath) {
  stats.filesScanned++;
  const normalizedPath = path.resolve(filePath);
  if (EXCLUDED_FILES.has(normalizedPath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Check if file has react-router-dom imports with Link, NavLink, or useNavigate
  // Match single-line and multi-line imports
  const importRegex = /import\s*\{([^}]+)\}\s*from\s*['"]react-router-dom['"];?/g;
  let match = importRegex.exec(content);
  if (!match) return;

  // Parse what's imported
  const importedItems = match[1].split(',').map(s => s.trim()).filter(Boolean);
  const hasLink = importedItems.includes('Link');
  const hasNavLink = importedItems.includes('NavLink');
  const hasUseNavigate = importedItems.includes('useNavigate');

  if (!hasLink && !hasNavLink && !hasUseNavigate) return;

  let modified = false;
  let newContent = content;

  // Calculate relative paths
  const localizedLinkPath = getRelativePath(
    filePath,
    path.resolve(CLIENT_SRC, 'components/LocalizedLink/LocalizedLink.jsx')
  );
  const useLocalizedNavigatePath = getRelativePath(
    filePath,
    path.resolve(CLIENT_SRC, 'hooks/useLocalizedNavigate.js')
  );

  // Build the new imports to add
  const newImports = [];

  // Items to keep in react-router-dom import
  const remainingItems = importedItems.filter(item =>
    item !== 'Link' && item !== 'NavLink' && item !== 'useNavigate'
  );

  // Build LocalizedLink import
  const localizedImports = [];
  if (hasLink) {
    localizedImports.push('LocalizedLink as Link');
    stats.linkReplaced++;
  }
  if (hasNavLink) {
    localizedImports.push('LocalizedNavLink as NavLink');
    stats.navLinkReplaced++;
  }
  if (localizedImports.length > 0) {
    newImports.push(`import { ${localizedImports.join(', ')} } from '${localizedLinkPath}';`);
  }

  // Build useLocalizedNavigate import
  if (hasUseNavigate) {
    newImports.push(`import { useLocalizedNavigate } from '${useLocalizedNavigatePath}';`);
    stats.navigateReplaced++;
  }

  // Replace the original import
  const originalImport = match[0];
  let replacement;
  if (remainingItems.length > 0) {
    replacement = `import { ${remainingItems.join(', ')} } from 'react-router-dom';`;
  } else {
    replacement = '';
  }

  // Add new imports after the (possibly modified) react-router-dom import
  if (replacement) {
    newContent = newContent.replace(originalImport, replacement + '\n' + newImports.join('\n'));
  } else {
    newContent = newContent.replace(originalImport, newImports.join('\n'));
  }

  // Replace useNavigate() calls with useLocalizedNavigate()
  if (hasUseNavigate) {
    newContent = newContent.replace(/\buseNavigate\(\)/g, 'useLocalizedNavigate()');
  }

  if (newContent !== content) {
    modified = true;
    stats.filesModified++;
    if (DRY_RUN) {
      console.log(`[DRY-RUN] Would modify: ${path.relative(CLIENT_SRC, filePath)}`);
    } else {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Modified: ${path.relative(CLIENT_SRC, filePath)}`);
    }
  }
}

// Main
console.log(`\n${DRY_RUN ? '=== DRY RUN ===' : '=== UPDATING IMPORTS ==='}\n`);
const files = getAllFiles(CLIENT_SRC);
for (const file of files) {
  processFile(file);
}

console.log(`\n--- Summary ---`);
console.log(`Files scanned: ${stats.filesScanned}`);
console.log(`Files modified: ${stats.filesModified}`);
console.log(`Link → LocalizedLink: ${stats.linkReplaced}`);
console.log(`NavLink → LocalizedNavLink: ${stats.navLinkReplaced}`);
console.log(`useNavigate → useLocalizedNavigate: ${stats.navigateReplaced}`);
if (DRY_RUN) console.log(`\nRe-run without --dry-run to apply changes.`);

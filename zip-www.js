import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

// Helper function to recursively find files and replace absolute paths with relative ones
function makePathsRelative(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      // Skip cache and server build directories to keep it clean and fast
      if (file === 'cache' || file === 'server' || file === 'types') continue;
      makePathsRelative(filePath);
    } else {
      const ext = path.extname(file).toLowerCase();
      // Only process text files that contain path references
      if (['.html', '.js', '.css', '.json'].includes(ext)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Replace absolute _next paths (e.g. /_next/static) with relative paths (e.g. ./_next/static)
        if (content.includes('/_next/')) {
          content = content.replace(/\/_next\//g, './_next/');
          modified = true;
        }

        // Replace absolute static paths with relative
        if (content.includes('/static/')) {
          content = content.replace(/\/static\//g, './static/');
          modified = true;
        }

        // Replace absolute root link refs with local entry points (extremely important for Android WebViews)
        if (content.includes('href="/"')) {
          content = content.replace(/href="\/"/g, 'href="index.html"');
          modified = true;
        }
        if (content.includes("href='/'")) {
          content = content.replace(/href='\/index.html'/g, "href='index.html'");
          modified = true;
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`[AppsGeyser Fix] Corrected asset paths in relative format for: ${filePath}`);
        }
      }
    }
  }
}

try {
  console.log("Preparing AppsGeyser relative-path optimizations inside a temporary folder...");
  const tempDir = './www-temp';
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  
  // Copy static build files from pristine `./www` to target `./www-temp`
  fs.cpSync('./www', tempDir, { recursive: true });
  
  // Optimize path strings inside the temp directory ONLY, leaving `./www` untouched for web hosting
  makePathsRelative(tempDir);
  console.log("AppsGeyser relative path optimizations completed successfully on temporary files.");

  const publicDir = './public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zip = new AdmZip();
  
  // Custom zip packer to only include client-only directories/files from www-temp
  const tempContents = fs.readdirSync(tempDir);
  for (const item of tempContents) {
    const itemPath = path.join(tempDir, item);
    const stat = fs.statSync(itemPath);
    
    // Explicit exclusions for server, compile cache and old ZIP files
    if (item === 'cache' || item === 'server' || item === 'types' || item.endsWith('.zip')) {
      console.log(`Skipping server/cache file from website.zip: ${item}`);
      continue;
    }
    
    if (stat.isDirectory()) {
      zip.addLocalFolder(itemPath, item);
    } else {
      zip.addLocalFile(itemPath);
    }
  }
  
  const zipPath = path.join(publicDir, 'website.zip');
  zip.writeZip(zipPath);
  console.log(`Successfully zipped optimized static web files to ${zipPath}`);

  // Clean up temporary folder
  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log("Cleaned up temporary folders. Pristine `./www` folder remains untouched for production web serving.");
} catch (error) {
  console.error('Error post-processing or zipping files:', error);
  const tempDir = './www-temp';
  if (fs.existsSync(tempDir)) {
    try {
      fs.rmSync(tempDir, { recursive: true, force: true });
    } catch (_) {}
  }
  process.exit(1);
}

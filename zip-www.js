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
  console.log("Starting AppsGeyser optimizations on build assets in ./www...");
  // Clear any old zip inside www to prevent recursive zipping feedback loop
  const oldZipInWww = './www/website.zip';
  if (fs.existsSync(oldZipInWww)) {
    console.log(`Deleting duplicates inside www: ${oldZipInWww}`);
    fs.unlinkSync(oldZipInWww);
  }

  // Optimize path strings to make everything relative for offline / file:/// protocol use
  makePathsRelative('./www');
  console.log("AppsGeyser optimizations completed successfully.");

  const publicDir = './public';
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const zip = new AdmZip();
  
  // Custom zip packer to only include client-only directories/files in www
  // This reduces APK sizes drastically and skips Next.js build cache/server systems
  const wwwContents = fs.readdirSync('./www');
  for (const item of wwwContents) {
    const itemPath = path.join('./www', item);
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
} catch (error) {
  console.error('Error post-processing or zipping files:', error);
  process.exit(1);
}

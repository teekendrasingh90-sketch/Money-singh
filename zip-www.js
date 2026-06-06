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
      // Only process HTML and JSON files that contain path references. Never modify binary, JS, or CSS files,
      // as search-and-replace strings in compiled webpack chunks break dynamic route imports.
      if (['.html', '.json'].includes(ext)) {
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

        // Inject high-compatibility webview router shim for file:/// protocol support in AppsGeyser
        if (ext === '.html') {
          const shimScript = `
<script>
  (function() {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.protocol === 'file:') {
        console.log("AppsGeyser file:// protocol compatibility shim loaded.");
        
        // Define path helpers so Next.js hydrates at "/" instead of "/android_asset/..."
        if (window.Location && window.Location.prototype) {
          try {
            Object.defineProperty(window.Location.prototype, 'pathname', {
              get: function() { return '/'; },
              configurable: true
            });
          } catch(e) { console.warn("Could not shim pathname:", e); }
          
          try {
            Object.defineProperty(window.Location.prototype, 'search', {
              get: function() { return ''; },
              configurable: true
            });
          } catch(e) { console.warn("Could not shim search:", e); }
        }
        
        // Prevent SecurityError when updating window history inside file:/// Android WebViews
        if (window.history) {
          var noop = function() {};
          window.history.pushState = noop;
          window.history.replaceState = noop;
        }
      }
    } catch(e) {
      console.error("Protocol shim failure:", e);
    }
  })();
</script>`;
          if (content.includes('<head>')) {
            content = content.replace('<head>', '<head>' + shimScript);
            modified = true;
          } else if (content.includes('<head ')) {
            content = content.replace(/<head\b[^>]*>/, function(match) { return match + shimScript; });
            modified = true;
          }
        }

        if (modified) {
          fs.writeFileSync(filePath, content, 'utf8');
          console.log(`[AppsGeyser Fix] Corrected asset paths and injected shim in relative format for: ${filePath}`);
        }
      }
    }
  }
}

try {
  // If 'out' directory exists (Next.js default export folder), move it to './www'
  if (fs.existsSync('./out')) {
    console.log("Found 'out' directory from static export. Moving it to './www'...");
    if (fs.existsSync('./www')) {
      fs.rmSync('./www', { recursive: true, force: true });
    }
    fs.renameSync('./out', './www');
    console.log("Successfully moved 'out' directory to './www'.");
  }

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
  
  // Clean up any unnecessary files/folders in tempDir before zipping so they don't bloat the package
  const tempContents = fs.readdirSync(tempDir);
  for (const item of tempContents) {
    const itemPath = path.join(tempDir, item);
    const lowercaseItem = item.toLowerCase();
    
    // Explicit exclusions for server, compile cache and old ZIP files on AppsGeyser exports
    if (
      lowercaseItem === 'cache' || 
      lowercaseItem === 'server' || 
      lowercaseItem === 'types' || 
      lowercaseItem.endsWith('.zip') ||
      lowercaseItem.startsWith('.')
    ) {
      console.log(`Excluding server/cache item from AppsGeyser package: ${item}`);
      try {
        const stat = fs.statSync(itemPath);
        if (stat.isDirectory()) {
          fs.rmSync(itemPath, { recursive: true, force: true });
        } else {
          fs.unlinkSync(itemPath);
        }
      } catch (err) {
        console.error(`Could not remove ${itemPath}:`, err);
      }
    }
  }
  
  // Add all files and folders inside tempDir directly to the root of the ZIP file
  // This ensures index.html is at the ROOT of the zip as strictly required by AppsGeyser!
  zip.addLocalFolder(tempDir);
  
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

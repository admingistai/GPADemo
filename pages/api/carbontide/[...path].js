import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { path: pathArray } = req.query;
  
  // Handle undefined or empty pathArray - default to index.html
  let requestedPath;
  if (!pathArray || (Array.isArray(pathArray) && pathArray.length === 0)) {
    requestedPath = 'index.html';
  } else if (Array.isArray(pathArray)) {
    requestedPath = pathArray.join('/');
  } else {
    requestedPath = String(pathArray);
  }
  
  // If path is empty string, default to index.html
  if (requestedPath === '' || requestedPath === '/') {
    requestedPath = 'index.html';
  }
  
  // Security: prevent directory traversal
  if (requestedPath.includes('..')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  const fullPath = path.join(process.cwd(), 'cloned-projects', 'calistalee6.github.io', requestedPath);
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    // If no extension, try .html
    const htmlPath = fullPath + '.html';
    if (fs.existsSync(htmlPath)) {
      const content = fs.readFileSync(htmlPath, 'utf8');
      const modifiedContent = updateHtmlPaths(content);
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(modifiedContent);
    }
    return res.status(404).json({ error: `File not found: ${requestedPath}` });
  }
  
  // Determine content type
  const ext = path.extname(fullPath).toLowerCase();
  const contentTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.json': 'application/json'
  };
  
  const contentType = contentTypes[ext] || 'application/octet-stream';
  
  // Read and send file
  try {
    let content = fs.readFileSync(fullPath);
    
    // For HTML files, update relative paths to absolute paths
    if (ext === '.html') {
      const htmlContent = content.toString('utf8');
      const modifiedContent = updateHtmlPaths(htmlContent);
      res.setHeader('Content-Type', contentType);
      return res.status(200).send(modifiedContent);
    }
    
    res.setHeader('Content-Type', contentType);
    res.status(200).send(content);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to update HTML paths to use absolute paths
function updateHtmlPaths(htmlContent) {
  // Update CSS links
  htmlContent = htmlContent.replace(
    /href="styles\.css"/g, 
    'href="/api/carbontide/styles.css"'
  );
  
  // Update JavaScript links
  htmlContent = htmlContent.replace(
    /src="script\.js"/g, 
    'src="/api/carbontide/script.js"'
  );
  
  // Update navigation links to other HTML pages (specific files first to avoid double replacement)
  htmlContent = htmlContent.replace(
    /href="index\.html"/g, 
    'href="/api/carbontide/"'
  );
  
  htmlContent = htmlContent.replace(
    /href="about\.html"/g, 
    'href="/api/carbontide/about.html"'
  );
  
  htmlContent = htmlContent.replace(
    /href="product\.html"/g, 
    'href="/api/carbontide/product.html"'
  );
  
  // Update any other relative asset paths (images, etc.) - but not if they already start with /api/carbontide/
  htmlContent = htmlContent.replace(
    /src="([^"\/][^"]*\.(png|jpg|jpeg|gif|svg))"/g, 
    'src="/api/carbontide/$1"'
  );
  
  return htmlContent;
}

export const config = {
  api: {
    bodyParser: false
  }
};
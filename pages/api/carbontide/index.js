import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const fullPath = path.join(process.cwd(), 'cloned-projects', 'calistalee6.github.io', 'index.html');
  
  // Check if file exists
  if (!fs.existsSync(fullPath)) {
    return res.status(404).json({ error: 'index.html not found' });
  }
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const modifiedContent = updateHtmlPaths(content);
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(modifiedContent);
  } catch (error) {
    console.error('Error reading file:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Function to update HTML paths to use absolute paths
function updateHtmlPaths(htmlContent) {
  // Update favicon links to point to static file in public directory
  htmlContent = htmlContent.replace(
    /href="CarbonTideFavicon\.png"/g, 
    'href="/CarbonTideFavicon.png"'
  );
  
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
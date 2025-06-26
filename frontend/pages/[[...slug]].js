import fs from 'fs';
import path from 'path';

export default function StaticHandler() {
  // This component won't actually render in most cases
  return null;
}

export async function getServerSideProps({ req, res, params }) {
  const slug = params?.slug || [];
  const requestPath = slug.length > 0 ? slug.join('/') : 'index.html';
  
  // Determine the file path
  let filePath;
  if (requestPath.endsWith('.html') || requestPath.endsWith('.css') || requestPath.endsWith('.js')) {
    filePath = path.join(process.cwd(), 'public', requestPath);
  } else if (requestPath === '' || requestPath === 'index') {
    filePath = path.join(process.cwd(), 'public', 'index.html');
  } else {
    // Try to find a matching HTML file
    filePath = path.join(process.cwd(), 'public', `${requestPath}.html`);
  }

  try {
    // Check if file exists
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      
      // Set appropriate content type
      if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      } else if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else {
        res.setHeader('Content-Type', 'text/html');
      }
      
      res.write(fileContent);
      res.end();
      return { props: {} };
    }
  } catch (error) {
    console.error('Error serving file:', error);
  }
  
  // If file not found, return 404
  res.statusCode = 404;
  res.end('Not Found');
  return { props: {} };
} 
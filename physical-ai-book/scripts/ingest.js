const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Directory containing the documentation files
const DOCS_DIR = path.join(process.cwd(), 'docs');
const OUTPUT_FILE = path.join(process.cwd(), 'api', 'data.json');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.md') || file.endsWith('.mdx')) {
          arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

async function generateData() {
    console.log("Generating data from docs...");

    const files = getAllFiles(DOCS_DIR);
    const chunks = [];

    // Simple chunking strategy: Each header or paragraph.
    // For this book, we'll just split by paragraphs or keep it simple.
    // We will store the raw text and some metadata.

    for (const filePath of files) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        // Remove frontmatter and simple cleanup
        const cleanContent = content;

        // Split by double newlines to get paragraphs/sections
        const paragraphs = cleanContent.split(/\n\s*\n/);

        paragraphs.forEach((p, index) => {
            if (p.trim().length > 20) { // Filter out very short lines
                chunks.push({
                    id: `${path.basename(filePath)}-${index}`,
                    source: path.basename(filePath),
                    title: data.title || path.basename(filePath, '.md'),
                    text: p.trim()
                });
            }
        });
    }

    // In a real RAG setup, we would generate embeddings here using Gemini or another model
    // and store them.
    // Example:
    /*
    const { GoogleGenerativeAI } = require("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "embedding-001" });

    for (let chunk of chunks) {
        const result = await model.embedContent(chunk.text);
        chunk.embedding = result.embedding.values;
    }
    */

   // Since we don't have the key in the build environment usually (or we want to avoid cost/complexity now),
   // we will just save the text chunks. The backend will do keyword search or we assume the user provides the key at runtime for embeddings (too slow).
   // Current fallback: Keyword search in backend `api/chat.js` is implemented as a simple RAG fallback.

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(chunks, null, 2));
    console.log(`Generated ${chunks.length} chunks to ${OUTPUT_FILE}`);
}

generateData();

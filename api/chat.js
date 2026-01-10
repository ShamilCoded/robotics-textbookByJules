// api/chat.js
// Vercel Serverless Function (Node.js)

module.exports = async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  const { query, selectedText } = request.body;

  if (!query) {
    return response.status(400).json({ error: 'Query is required' });
  }

  try {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    let context = "";

    if (selectedText) {
      context = `User selected text from the book: "${selectedText}"\n\n`;
    }

    // Load book content
    // We use require to ensure Vercel bundles the json file
    let bookContent = [];
    try {
        bookContent = require('./data.json');
    } catch (e) {
        console.error("Could not load book content", e);
    }

    // Simple Keyword Search (Mock RAG)
    if (!selectedText && bookContent.length > 0) {
        // Filter out very short words, but keep important acronyms like AI, ROS, VLA, GPT
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 1);

        if (queryTerms.length > 0) {
            // Score chunks by how many keywords they contain
            const scoredChunks = bookContent.map(chunk => {
                const textLower = chunk.text.toLowerCase();
                let score = 0;
                queryTerms.forEach(term => {
                    if (textLower.includes(term)) score++;
                });
                return { ...chunk, score };
            });

            // Filter chunks with at least one match and sort by score
            const relevantChunks = scoredChunks
                .filter(chunk => chunk.score > 0)
                .sort((a, b) => b.score - a.score)
                .slice(0, 3);

            if (relevantChunks.length > 0) {
                context += "Relevant context from the book:\n" + relevantChunks.map(c => c.text).join("\n---\n") + "\n\n";
            }
        }
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
         return response.status(200).json({
             answer: "I am ready to answer your questions using Gemini! (Please configure GEMINI_API_KEY in Vercel). " +
                     (context ? "I see you have some context." : "")
         });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a helpful teaching assistant for a Physical AI & Humanoid Robotics course.
    Use the following context to answer the user's question. If the answer is not in the context, say you don't know, but try to be helpful based on general knowledge of the field if appropriate, but clarify it's not from the text.

    Context:
    ${context}

    User Question: ${query}
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    return response.status(200).json({ answer: responseText });

  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: 'Internal Server Error' });
  }
};

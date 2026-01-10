
# Physical AI & Humanoid Robotics Book

This is a Docusaurus project for the Physical AI course.

## Deployment

### Vercel (Recommended)
This project is configured for Vercel.
1. Import the project in Vercel.
2. The `api` folder will be deployed as Serverless Functions.
3. Set the `GEMINI_API_KEY` environment variable in Vercel for the chatbot to work.

### GitHub Pages
This project can be deployed to GitHub Pages.
1. Update `docusaurus.config.ts`:
   - Set `organizationName` to your GitHub username.
   - Set `projectName` to your repository name.
   - Set `baseUrl` to `/<projectName>/` (e.g., `/physical-ai-book/`).
2. Run `npm run deploy`.

**Note:** The integrated chatbot relies on Vercel Serverless Functions. When deployed to GitHub Pages (which is static hosting), the chatbot will not function unless you configure it to point to a separate backend URL.

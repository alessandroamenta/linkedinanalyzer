# LinkedIn Profile Analyzer

A Next.js application that leverages AI to analyze and provide feedback on LinkedIn profiles.

## 🚀 Features

- Analyzes LinkedIn profile data
- Provides personalized feedback for profile improvement
- Utilizes Claude AI for intelligent analysis
- Handles profile and background picture analysis

## 🛠 Tech Stack

- Next.js
- TypeScript
- Anthropic's Claude AI
- Axios for HTTP requests

## 🏁 Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   ```
   CLAUDE_API_KEY=your_claude_api_key
   ```
4. Run the development server: `npm run dev`

## 📝 Usage

Send a POST request to `/api/analyze` with the following JSON structure:

```json
{
  "profileUrl": "https://www.linkedin.com/in/your-profile-url/",
  "backgroundImageUrl": "https://example.com/background-image.jpg",
  "profilePictureUrl": "https://example.com/profile-picture.jpg"
}
```
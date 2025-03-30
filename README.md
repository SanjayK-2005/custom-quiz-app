# AI-Powered Custom Quiz Application

A Next.js web application that allows users to create customized quizzes powered by Google's Gemini AI. Users can configure quiz topics, difficulty levels, timing, and feedback preferences.

## Features

- **Custom Quiz Generation**: Create quizzes on any topic with specified difficulty
- **AI-Powered Explanations**: Detailed explanations generated by Gemini AI
- **Quiz Customization**: Configure number of questions, difficulty, timing, and more
- **Timed Quizzes**: Set time limits for the entire quiz or per question
- **Feedback Options**: Choose immediate feedback or end-of-quiz feedback
- **Dark/Light Mode**: Beautiful UI with theme toggle
- **User Authentication**: Sign in with Google

## Technologies Used

- **Frontend**: Next.js, React, Tailwind CSS
- **Authentication**: NextAuth.js
- **AI Model**: Google Gemini API
- **Theming**: next-themes

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Gemini API key (get it from [Google AI Studio](https://ai.google.dev/))

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/custom-quiz-powered-by-ai.git
cd custom-quiz-powered-by-ai
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your API keys:

```
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# For Google Authentication (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=some_random_secret_here
```

4. Start the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Gemini API

This project uses the Gemini API for:

1. **Quiz Generation**: Creating questions based on the user's selected topic and parameters
2. **Explanation Generation**: Providing detailed explanations for question answers

The implementation can be found in `app/lib/gemini.js`.

### API Key Setup

1. Get your API key from [Google AI Studio](https://ai.google.dev/)
2. Add it to your `.env.local` file as `NEXT_PUBLIC_GEMINI_API_KEY`

## Project Structure

```
custom-quiz-app/
├── app/
│   ├── api/                # API routes
│   │   ├── explain/        # Explanation generation API
│   │   └── quiz/           # Quiz generation API
│   ├── components/         # Reusable components
│   ├── dashboard/          # Quiz configuration page
│   ├── lib/                # Utility functions
│   │   └── gemini.js       # Gemini API integration
│   ├── login/              # Authentication page
│   ├── quiz/               # Quiz display page
│   ├── globals.css         # Global styles
│   ├── layout.js           # Root layout
│   ├── page.js             # Home page
│   └── providers.js        # Theme provider
├── public/                 # Static assets
├── .env.local              # Environment variables
├── next.config.mjs         # Next.js configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Customizing the Quiz

1. Log in to the application
2. Go to the dashboard
3. Configure your quiz parameters:
   - Topic
   - Grade level
   - Difficulty
   - Number of questions
   - Scoring options
   - Timer settings
   - Feedback preferences
4. Click "Create Quiz" to generate and start your personalized quiz

## Deployment

This application can be easily deployed on Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/custom-quiz-powered-by-ai)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

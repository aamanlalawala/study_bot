# Study Chatbot Project

This project is a full-stack web application designed for computer science students to interact with an AI-powered chatbot. Built with Next.js, it integrates the Google Gemini API to answer CS-related questions and provide study tips. The app features user authentication and persistent chat history stored in Supabase, with a futuristic UI using Tailwind CSS. Users can sign up, log in, chat with the AI, save or reset their conversation, and access a preset "Study Tips" feature. The app is deployed on Render.com for easy access.

* *Date Created*: 16 Oct 2025
* *Last Modification Date*: 27 Oct 2025
* *App URL*: https://study-bot-qa6h.onrender.com/chat
* GitHub : https://github.com/aamanlalawala/study_bot

## Authors

* [Aaman Lalawala](aaman.lalawala@dal.ca) - Developer

## Built With

* [Next.js](https://nextjs.org/docs) - Framework for building the frontend and backend with React and TypeScript.
* [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework for styling the futuristic UI.
* [Supabase](https://supabase.com/docs) - Backend service for authentication (email/password) and PostgreSQL database for chat storage.
* [Google Gemini API](https://ai.google.dev/docs) - AI model for generating responses to CS and study-related questions.
* [marked](https://marked.js.org/) - Markdown parser for rendering bold, italics, and lists in AI responses.
* [DOMPurify](https://github.com/cure53/DOMPurify) - Sanitizes HTML from Markdown to prevent XSS attacks.

## Sources Used

### src/app/chat/page.tsx
*Lines 6-9, 108-114*

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Render Markdown safely
const renderMarkdown = (text: string) => {
  const html = marked(text);
  return { __html: DOMPurify.sanitize(html) };
};
```

The code above was created by adapting the code in [Supabase Community Example](https://github.com/supabase-community/nextjs-markdown-blog) as shown below:

```typescript
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const Markdown = ({ content }: { content: string }) => {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(marked(content)),
      }}
    />
  );
};
```

- **How**: The code from [Supabase Community Example](https://github.com/supabase-community/nextjs-markdown-blog) was implemented by importing `marked` and `DOMPurify` to parse and sanitize Markdown content for safe HTML rendering.
- **Why**: This code was used because it provides a secure way to render Markdown in React, which was needed to display formatted AI responses (e.g., bold, italics, lists) from the Gemini API.
- **How Modified**: The code was adapted into a `renderMarkdown` function to process individual chat messages, integrated into the chat UI, and used with `dangerouslySetInnerHTML` inside a `div` for each message.

### src/app/api/chat/route.ts
*Lines 1-32*

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: message }] }],
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json({ error: data.error?.message || 'API error' }, { status: response.status });
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI';
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

The code above was created by adapting the code in [Google AI Node.js Quickstart](https://ai.google.dev/gemini-api/docs/quickstart?lang=node) as shown below:

```javascript
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function run() {
  const prompt = "Write a story about a magic backpack.";
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
}
```

- **How**: The code from [Google AI Node.js Quickstart](https://ai.google.dev/gemini-api/docs/quickstart?lang=node) was implemented by using the Gemini API to generate content based on a user prompt, but adapted for a Next.js API route.
- **Why**: This code was used because it provided a clear example of calling the Gemini API with a prompt and handling the response, which was needed for the chatbot's AI functionality.
- **How Modified**: The code was modified to work in a Next.js API route (`POST` handler), using `fetch` instead of the `GoogleGenerativeAI` library, handling JSON input/output, and adding error checks for missing messages or API keys.

## Acknowledgments

* Thanks to the Supabase community for their Next.js examples, which helped with authentication and database integration.
* Inspired by modern chatbot designs like ChatGPT, aiming for a futuristic UI with Tailwind CSS.
* Gratitude to online tutorials for guiding a beginner through Next.js and API integrations.

## References  

* [Next.js Documentation](https://nextjs.org/docs)  
  https://nextjs.org/docs  

* [Supabase Auth Guide](https://supabase.com/docs/guides/auth)  
  https://supabase.com/docs/guides/auth  

* [Gemini API Overview](https://ai.google.dev/docs/gemini_api_overview)  
  https://ai.google.dev/docs/gemini_api_overview  

* [Tailwind CSS Installation](https://tailwindcss.com/docs/installation)  
  https://tailwindcss.com/docs/installation  

* [Marked.js Documentation](https://marked.js.org/)  
  https://marked.js.org/  

* [DOMPurify — GitHub Repository](https://github.com/cure53/DOMPurify)  
  https://github.com/cure53/DOMPurify  

* [Supabase Community Example — Next.js Markdown Blog](https://github.com/supabase-community/nextjs-markdown-blog)  
  https://github.com/supabase-community/nextjs-markdown-blog  

* [Google AI Node.js Quickstart](https://ai.google.dev/gemini-api/docs/quickstart?lang=node)  
  https://ai.google.dev/gemini-api/docs/quickstart?lang=node  

* [Render — Deployment Guide for Next.js](https://render.com/docs/deploy-nextjs)  
  https://render.com/docs/deploy-nextjs  

### YouTube Video Tutorials  

* [Next.js Tutorial for Beginners | Nextjs 13 (App Router) with TypeScript](https://www.youtube.com/watch?v=ZVnjOPwW4ZA)  
  https://www.youtube.com/watch?v=ZVnjOPwW4ZA  

* [Complete UPDATED Guide – Next.js Auth With Supabase](https://www.youtube.com/watch?v=yDJcdDa6la0)  
  https://www.youtube.com/watch?v=yDJcdDa6la0  

* [File Sharing App – A Next.js and Supabase Full Tutorial](https://www.youtube.com/watch?v=ZbghTIrOEhE)  
  https://www.youtube.com/watch?v=ZbghTIrOEhE  

* [NextJS 15 Full Course 2025 | Become a NextJS Pro in 1.5 Hours](https://www.youtube.com/watch?v=6jQdZcYY8OY)  
  https://www.youtube.com/watch?v=6jQdZcYY8OY  

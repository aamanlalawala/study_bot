export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-gray-900 to-blue-900">
      <h1 className="text-5xl font-bold text-cyan-400 mb-4 animate-pulse">Study Chatbot</h1>
      <p className="text-xl text-gray-300 mb-8 text-center max-w-md">
        Your AI-powered companion for CS questions and study tips. Log in or sign up to begin!
      </p>
      <div className="flex gap-4">
        <a
          href="/login"
          className="bg-cyan-500 text-gray-900 px-8 py-3 rounded-lg glow-button hover:bg-cyan-400 transition-colors text-lg font-semibold"
        >
          Log In
        </a>
        <a
          href="/signup"
          className="bg-purple-500 text-gray-900 px-8 py-3 rounded-lg glow-button hover:bg-purple-400 transition-colors text-lg font-semibold"
        >
          Sign Up
        </a>
      </div>
    </div>
  );
}
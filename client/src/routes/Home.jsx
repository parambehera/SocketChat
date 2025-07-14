// src/routes/Home.jsx
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
        Welcome to Socket Chat
      </h1>
      <p className="text-lg text-gray-400 text-center mb-10 max-w-md">
        Real-time private messaging with secure login. Chat with anyone using their phone number!
      </p>

      <div className="flex gap-4">
        <button
          onClick={() => navigate("/signup")}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow"
        >
          Sign Up
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-semibold shadow"
        >
          Log In
        </button>
      </div>
    </div>
  );
};

export default Home;

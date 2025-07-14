import { Routes, Route } from "react-router-dom";
// ...existing imports...

import Home from "./routes/Home";
import Chat from "./routes/Chat";
import Login from "./routes/Login";
import Signup from "./routes/Signup";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext"; // ✅
function App() {
  return (
    <AuthProvider>
      {" "}
      {/* ✅ Wrap all routes here */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/chat"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AuthProvider>
  );
}
export default App;

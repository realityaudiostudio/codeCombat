// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Signup from "./pages/Signup/Signup";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import GeminiBot from "./pages/GeminiBot/GeminiBot";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/653fc7b5-a85f-4a20-be3b-09d8bda2879a"
            element={<Signup />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

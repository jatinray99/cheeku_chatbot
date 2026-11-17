import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";
import "./App.css";

function App() {
  const token = localStorage.getItem("token");

  return (
    <Routes>
      <Route
        path="/"
        element={
          token ? <Navigate to="/home" /> : <Login />
        }
      />

      <Route
        path="/home"
        element={
          token ? <Home /> : <Navigate to="/" />
        }
      />
    </Routes>
  );
}

export default App;
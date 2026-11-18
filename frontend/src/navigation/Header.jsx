import "./Header.css";
import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
  localStorage.clear();
  window.location.href = "/";
};

  return (
    <header className="main-header">
      <h2>Cheeku</h2>

      <nav>
        <a href="#home">Home</a>
        <a href="#chat">Chat</a>
        <a href="#about">About</a>

        <a onClick={handleLogout}>
          Logout
        </a>
      </nav>
    </header>
  );
}

export default Header;
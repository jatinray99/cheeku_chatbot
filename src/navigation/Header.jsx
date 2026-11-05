import "./Header.css";

function Header() {
  return (
    <header className="main-header">
      <h2>Cheeku</h2>
      <nav>
        <a href="#home">Home</a>
        <a href="#chat">Chat</a>
        <a href="#about">About</a>
      </nav>
    </header>
  );
}

export default Header;
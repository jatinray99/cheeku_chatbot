
import Header from "./navigation/Header";
import Footer from "./navigation/Footer";
import Chatbot from "./components/Chatbot";
import "./App.css";

function App() {
  return (
    <div id="home">
      <Header />

      <main id="chat">
        <Chatbot />
      </main>

      <Footer />
    </div>
  );
}

export default App;

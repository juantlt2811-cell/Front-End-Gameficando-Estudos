import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { Materia } from "./pages/Materia";
import { UsuarioContext } from "./context/UsuarioContext";

function App() {
  return (
    <UsuarioContext.Provider value={{ nome: "Ana", tipo: "Aluno" }}>
      <div>
        <nav>
          <Link to="/">Início</Link>
          <Link to="/sobre">Sobre</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/materias/:id" element={<Materia />} />
        </Routes>
      </div>
    </UsuarioContext.Provider>
  );
}

export default App;

import "./App.css";
import { Routes, Route, Link } from "react-router-dom";
import { Home } from "./pages/Home";
import { Sobre } from "./pages/Sobre";
import { Materia } from "./pages/Materia";
import { AuthProvider } from "./context/AuthContext";
import { Login } from "./pages/Login";
import { RotaProtegida } from "./components/RotaProtegida";
import { MinhasMaterias } from "./pages/MinhasMaterias";
import { Cadastro } from "./pages/Cadastro";
import { Perfil } from "./pages/Perfil";

function App() {
  return (
    <AuthProvider>
      <div>
        <nav>
          <Link to="/">Início</Link>
          <Link to="/sobre">Sobre</Link>
        </nav>
        <Routes>
          <Route path="/cadastro" element={<Cadastro />} />
          <Route
            path="/"
            element={
              <RotaProtegida>
                <Home />
              </RotaProtegida>
            }
          />
          <Route
            path="/perfil"
            element={
              <RotaProtegida>
                <Perfil />
              </RotaProtegida>
            }
          />
          <Route path="/sobre" element={<Sobre />} />
          <Route
            path="/materias/:id"
            element={
              <RotaProtegida>
                <Materia />
              </RotaProtegida>
            }
          />
          <Route
            path="/minhas-materias"
            element={
              <RotaProtegida>
                <MinhasMaterias />
              </RotaProtegida>
            }
          />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

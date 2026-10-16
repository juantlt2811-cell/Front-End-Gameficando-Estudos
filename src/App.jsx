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
import { CaixaFontes } from "./pages/CaixaFontes";
import { AtividadesMateria } from "./pages/AtividadesMateria";
import { SessaoPratica } from "./pages/SessaoPratica";
import { Ranking } from "./pages/Ranking";

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
          <Route
            path="/materias/:id/fontes"
            element={
              <RotaProtegida>
                <CaixaFontes />
              </RotaProtegida>
            }
          />
          <Route
            path="/materias/:id/atividades"
            element={
              <RotaProtegida>
                <AtividadesMateria />
              </RotaProtegida>
            }
          />
          <Route
            path="/materias/:id/praticar"
            element={
              <RotaProtegida>
                <SessaoPratica />
              </RotaProtegida>
            }
          />
          <Route
            path="/ranking"
            element={
              <RotaProtegida>
                <Ranking />
              </RotaProtegida>
            }
          />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App;

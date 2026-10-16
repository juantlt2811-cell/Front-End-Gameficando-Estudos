import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cabecalho } from "./Cabecalho";

export function RotaProtegida({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/login" replace />;

  return (
    <>
      <Cabecalho />
      {children}
    </>
  );
}

import { createContext, useContext } from "react";

export const UsuarioContext = createContext(null);

export function useUsuario() {
  const usuario = useContext(UsuarioContext);
  if (usuario === null) {
    throw new Error(
      "useUsuario precisa ser usado dentro de <UsuarioContext.Provider>",
    );
  }
  return usuario;
}

import { useState } from "react";

export function FormularioSimples(valor, setValor) {
  const [valor, setValor] = useState("");
  return <input value={valor} onChange={(e) => setValor(e.target.value)} />;
}

export function mensagemErro(erro) {
  if (erro instanceof TypeError) {
    return "Não foi possível conectar. Verifique sua internet e tente de novo.";
  }
  return erro?.message || "Algo deu errado. Tente novamente.";
}

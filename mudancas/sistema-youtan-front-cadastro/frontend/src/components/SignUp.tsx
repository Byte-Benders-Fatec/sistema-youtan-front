import { useState } from "react";
import "./../styles/signup.css"; // ajuste o caminho conforme necessário
import logo from './../imagens/logo-youtan.png'; // ajuste o caminho conforme necessário

const SignUp = () => {
  // Estados para controlar os campos e o estado de carregamento e erro
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [team, setTeam] = useState("");
  const [area, setArea] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Função auxiliar para validar e-mail
  const isValidEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Reseta mensagem de erro
    setErrorMessage("");

    // Validação simples dos campos
    if (!fullName || !email || !password || !team || !area) {
      setErrorMessage("Todos os campos são obrigatórios.");
      return;
    }

    if (!isValidEmail(email)) {
      setErrorMessage("Por favor, insira um e-mail válido.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    // cadastrar o usuário
    setIsLoading(true);
    try {
      const response = await fetch("https://api.exemplo.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName,
          email,
          password,
          team,
          area,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erro ao cadastrar usuário.");
      }

      console.log("Usuário cadastrado com sucesso:", data);
      alert("Usuário cadastrado com sucesso!");
    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      setErrorMessage(error.message || "Erro inesperado.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo Youtan" className="logo" />
      <h2>Cadastrar Usuário</h2>
      {errorMessage && <div className="error">{errorMessage}</div>} {/* Exibe mensagem de erro */}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Senha</label>
          <input
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Time</label>
          <input
            type="text"
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Área</label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            required
          />
        </div>
        <div style={{ marginTop: "20px" }}>
          <button type="submit" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignUp;

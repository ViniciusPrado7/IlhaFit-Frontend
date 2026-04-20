import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import AppLayout from "./components/Layout";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import ConfiguracaoEstabelecimento from "./pages/Estabelecimento/Configuracao/index.jsx";
import PerfilEstabelecimento from "./pages/Estabelecimento/Perfil.jsx";
import Login from "./pages/Login/index.jsx";
import Cadastro from "./pages/Cadastro/index.jsx";
import Profissional from "./pages/Profissional/index.jsx";



function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
        <Route path="/estabelecimento/configuracoes" element={<ConfiguracaoEstabelecimento />} />
        <Route path="/estabelecimento/:id" element={<PerfilEstabelecimento />} />
        <Route path="/profissional" element={<Profissional />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        {/* <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/confirmar-email" element={<ConfirmarEmail />} /> */}
      </Routes>
    </AppLayout>
  );
}

export default App;

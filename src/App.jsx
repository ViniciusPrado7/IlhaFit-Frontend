import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import AppLayout from "./components/Layout";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import ModalEstabelecimento from "./pages/Estabelecimento/ModalEstabelecimento.jsx";
import Login from "./pages/Login/index.jsx";
import Cadastro from "./pages/Cadastro/index.jsx";
import Profissional from "./pages/Profissional/index.jsx";



function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
        <Route path="/estabelecimento/:id" element={<ModalEstabelecimento />} />
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

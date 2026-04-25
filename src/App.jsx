import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import AppLayout from "./components/Layout";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import ConfiguracaoEstabelecimento from "./pages/Estabelecimento/Configuracao/index.jsx";
import PerfilEstabelecimento from "./pages/Estabelecimento/Perfil.jsx";
import Login from "./pages/Login/index.jsx";
import EsqueciSenha from "./pages/Login/EsqueciSenha/index.jsx";
import Cadastro from "./pages/Cadastro/index.jsx";
import Profissional from "./pages/Profissional/index.jsx";
import ConfiguracaoProfissional from "./pages/Profissional/Configuracao/index.jsx";
import EstabelecimentoRoute from "./components/PrivateRoute/EstabelecimentoRoute.jsx";
import AdminRoute from "./components/PrivateRoute/AdminRoute.jsx";
import AdminPanel from "./pages/Admin/index.jsx";



function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
        <Route
          path="/estabelecimento/configuracoes"
          element={(
            <EstabelecimentoRoute>
              <ConfiguracaoEstabelecimento />
            </EstabelecimentoRoute>
          )}
        />
        <Route path="/estabelecimento/:id" element={<PerfilEstabelecimento />} />
        <Route path="/profissional" element={<Profissional />} />
        <Route path="/profissional/configuracoes" element={<ConfiguracaoProfissional />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/esqueci-senha" element={<EsqueciSenha />} />
        <Route
          path="/admin"
          element={(
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          )}
        />
      </Routes>
    </AppLayout>
  );
}

export default App;



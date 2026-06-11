import { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import AppLayout from "./components/Layout";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Establishment/index.jsx";
import ConfiguracaoEstabelecimento from "./pages/Establishment/Settings/index.jsx";
import PerfilEstabelecimento from "./pages/Establishment/Profile.jsx";
import Login from "./pages/Login/index.jsx";
import EsqueciSenha from "./pages/Login/ForgotPassword/index.jsx";
import Admin from "./pages/Admin/index.jsx";
import Cadastro from "./pages/Registration/index.jsx";
import Profissional from "./pages/Professional/index.jsx";
import Mapa from "./pages/Map/index.jsx";
import ConfiguracaoProfissional from "./pages/Professional/Settings/index.jsx";
import ConfiguracaoUsuario from "./pages/User/Settings/index.jsx";
import Privacidade from "./pages/Privacy/index.jsx";
import Sobre from "./pages/About/index.jsx";
import EstabelecimentoRoute from "./components/PrivateRoute/EstablishmentRoute.jsx";
import AdminRoute from "./components/PrivateRoute/AdminRoute.jsx";
import AdminPanel from "./pages/Admin/index.jsx";
import { api } from "./service/Api.js";
import { authSession } from "./service/AuthSession.js";

function App() {
  useEffect(() => {
    if (authSession.getToken()) {
      api.get("/auth/me").catch((error) => {
        if (error.response?.status === 401) {
          authSession.clear();
        }
      });
    }
  }, []);

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
        <Route path="/mapa" element={<Mapa />} />
        <Route path="/profissional/configuracoes" element={<ConfiguracaoProfissional />} />
        <Route path="/usuario/configuracoes" element={<ConfiguracaoUsuario />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/politica-de-privacidade" element={<Privacidade />} />
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

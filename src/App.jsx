import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import AppLayout from "./components/Layout/index.jsx";
import LoginButton from "./components/NavBar/Login/Login.jsx";
import CadastroButton from "./components/NavBar/Cadastro/Cadastro.jsx";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
        <Route path="/login" element={<LoginButton/>}/>
        <Route path="/cadastro" element={<CadastroButton/>}/>
      </Routes>
    </AppLayout>
  );
}

export default App;

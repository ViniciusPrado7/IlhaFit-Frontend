import { Route, Routes } from "react-router-dom";
import "./styles/App.css";
import Home from "./pages/Home/index.jsx";
import Estabelecimento from "./pages/Estabelecimento/index.jsx";
import Profissional from "./pages/Profissional/index.jsx";
import AppLayout from "./components/Layout/index.jsx";

function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/estabelecimento" element={<Estabelecimento />} />
         <Route path="/profissional" element={<Profissional />} /> 
      </Routes>
    </AppLayout>
  );
}

export default App;

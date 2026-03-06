import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import NavBar from "./components/NavBar/index.jsx";
import { ToastContainer } from "react-toastify";
import ThemeModeProvider from "./contexts/ThemeModeProvider.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
     <div className="app-container">
       <ThemeModeProvider>
      <NavBar />
        <main>
          <App />
        </main>
        <ToastContainer position='top-center'/>
        </ThemeModeProvider>
      </div>
    </BrowserRouter>
  </StrictMode>
);

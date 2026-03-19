import { useState } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  Box,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Menu from "./Menu";
import ToggleThemeButton from "../ToggleThemeButton";

import LoginButton from "./Login/Login";
import CadastroButton from "./Cadastro/Cadastro";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <AppBar elevation={1} color="default">
      <Container maxWidth="xl">
        <Toolbar sx={{ py: 1 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src="src/assets/logo.svg"
                alt="Logo IlhaFit"
                sx={{ width: 48, borderRadius: 2, mr: 3 }}
              />

              <Box>
                <Typography variant="h6" fontWeight={700}>
                  IlhaFit
                </Typography>
              </Box>
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Menu />
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, ml: 2 }}>
            <ToggleThemeButton />

            <LoginButton onClick={() => navigate("/login")} /> {/* lowercase */}
            <CadastroButton onClick={() => navigate("/cadastro")} /> {/* lowercase */}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;
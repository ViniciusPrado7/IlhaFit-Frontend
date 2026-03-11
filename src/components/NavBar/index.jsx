import { useState } from "react";
import {
  AppBar,
  Container,
  Toolbar,
  Typography,
  ListItemButton,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";
import Menu from "./Menu";
import ToggleThemeButton from "../ToggleThemeButton";
import Entrar from "./Entrar";

const NavBar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
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
                  <Typography variant="h6" fontWeight={700} lineHeight={1.1}>
                    IlhaFit
                  </Typography>

                  <Typography
                    variant="caption"
                    sx={{
                      color: "primary.main",
                      fontWeight: 500,
                      letterSpacing: "0.3px",
                    }}
                  >
                    Seu bem-estar começa aqui
                  </Typography>
                </Box>
              </Box>
            </Link>
            <Box
              sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}
            >
              <Menu />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center" }}>
              <ToggleThemeButton />
              <Entrar onClick={() => setOpen(true)} />
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default NavBar;

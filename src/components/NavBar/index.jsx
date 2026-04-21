import { useEffect, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Container,
  Divider,
  IconButton,
  ListItemIcon,
  Menu as MuiMenu,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import Menu from "./Menu";
import ToggleThemeButton from "../ToggleThemeButton";
import LoginButton from "./Login/Login";
import CadastroButton from "./Cadastro/Cadastro";
import { authSession } from "../../service/AuthSession";
import logo from "../../assets/logo.svg";

const getDisplayName = (user) => {
  if (!user) return "";
  return user.tipo === "ESTABELECIMENTO" ? user.nomeFantasia || user.email : user.nome || user.email;
};

const NavBar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => authSession.getUser());
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const syncUser = () => setUser(authSession.getUser());

    window.addEventListener("auth-change", syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener("auth-change", syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  const handleLogout = () => {
    authSession.clear();
    setAnchorEl(null);
    navigate("/");
  };

  const handleSettings = () => {
    setAnchorEl(null);
    if (user?.tipo === "ESTABELECIMENTO" && user?.id) {
      navigate("/estabelecimento/configuracoes");
      return;
    }
    if (user?.tipo === "PROFISSIONAL" && user?.id) {
      navigate("/profissional/configuracoes");
      return;
    }

    navigate("/");
  };

  return (
    <AppBar elevation={1} color="default">
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1680px",
          px: { xs: 2, sm: 3, md: 4, xl: 5 },
        }}
      >
        <Toolbar disableGutters sx={{ py: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                component="img"
                src={logo}
                alt="Logo IlhaFit"
                sx={{ width: 48, borderRadius: 2, mr: 3 }}
              />

              <Typography variant="h6" fontWeight={700}>
                IlhaFit
              </Typography>
            </Box>
          </Link>

          <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
            <Menu />
          </Box>

          <Box sx={{ display: "flex", gap: 1.5, ml: 2, alignItems: "center" }}>
            <ToggleThemeButton />

            {user ? (
              <>
                <Box
                  component="button"
                  type="button"
                  onClick={(event) => setAnchorEl(event.currentTarget)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    color: "text.primary",
                    borderRadius: 3,
                    px: 1.5,
                    py: 0.75,
                    cursor: "pointer",
                    font: "inherit",
                    "&:hover": {
                      borderColor: "primary.main",
                      bgcolor: "action.hover",
                    },
                  }}
                >
                  <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main" }}>
                    <FaUser size={14} />
                  </Avatar>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      display: { xs: "none", sm: "block" },
                      maxWidth: 180,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {getDisplayName(user)}
                  </Typography>
                </Box>

                <MuiMenu
                  anchorEl={anchorEl}
                  open={menuOpen}
                  onClose={() => setAnchorEl(null)}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <Box sx={{ px: 2, py: 1 }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      {getDisplayName(user)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem onClick={handleSettings}>
                    <ListItemIcon>
                      <FaCog size={16} />
                    </ListItemIcon>
                    Configuracoes
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <FaSignOutAlt size={16} />
                    </ListItemIcon>
                    Sair
                  </MenuItem>
                </MuiMenu>
              </>
            ) : (
              <>
                <LoginButton onClick={() => navigate("/login")} />
                <CadastroButton onClick={() => navigate("/cadastro")} />
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default NavBar;

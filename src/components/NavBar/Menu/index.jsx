import { useEffect, useState } from "react";
import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";
import { authSession } from "../../../service/AuthSession";

const baseLinks = [
  { name: "Estabelecimento", path: "/estabelecimento" },
  { name: "Profissional", path: "/profissional" },
];

const Menu = () => {
  const [isAdmin, setIsAdmin] = useState(() => authSession.getUser()?.role === "ADMIN");

  useEffect(() => {
    const sync = () => setIsAdmin(authSession.getUser()?.role === "ADMIN");
    window.addEventListener("auth-change", sync);
    return () => window.removeEventListener("auth-change", sync);
  }, []);

  const links = isAdmin
    ? [...baseLinks, { name: "Painel Adm", path: "/admin" }]
    : baseLinks;

  return (
    <Box sx={{ display: { xs: "none", md: "flex" } }}>
      <List sx={{ display: "flex" }}>
        {links.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton
              component={Link}
              to={link.path}
              sx={{
                color: "text.primary",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: "action.hover",
                  borderRadius: "12px",
                },
              }}
            >
              <ListItemText primary={link.name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Menu;

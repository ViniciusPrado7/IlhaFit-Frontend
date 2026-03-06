import { Box, List, ListItem, ListItemButton, ListItemText } from "@mui/material";
import { Link } from "react-router-dom";

const links = [
  { name: "Estabelecimento", path: "/estabelecimento" },
];

const Menu = () => {
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

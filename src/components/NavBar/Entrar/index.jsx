import { Button } from "@mui/material";

const Entrar = ({ onClick }) => {
  return (
    <Button
      onClick={onClick}
      variant="contained"
      sx={{
        ml: 2,
        height: 40,
        px: 3,
        borderRadius: "12px",
        bgcolor: "primary.main",
        color: "primary.contrastText",

        "&:hover": {
          bgcolor: "custom.primaryHover",
        },
      }}
    >
      Entrar
    </Button>
  );
};

export default Entrar;

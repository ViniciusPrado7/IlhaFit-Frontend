import React from "react";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const CadastroButton = React.forwardRef((props, ref) => {
  const theme = useTheme();

  return (
    <Button
      ref={ref}
      variant="contained"
      {...props}
      sx={{
        height: 40,
        px: 3,
        borderRadius: theme.shape.borderRadius >= 8 ? "12px" : "8px",
        bgcolor: "primary.main",
        color: "primary.contrastText",
        textTransform: "none",
        fontWeight: 700,
        "&:hover": {
          bgcolor: theme.palette.custom?.primaryHover || "primary.dark",
          opacity: 0.9,
          transform: 'translateY(-1px)'
        },
        transition: 'all 0.2s',
        ...props.sx
      }}
    >
      Cadastrar-se
    </Button>
  );
});

CadastroButton.displayName = 'CadastroButton';

export default CadastroButton;

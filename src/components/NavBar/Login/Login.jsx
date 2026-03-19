import React from "react";
import { Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const LoginButton = React.forwardRef((props, ref) => {
    const theme = useTheme();

    return (
        <Button
            ref={ref}
            variant="outlined"
            {...props}
            sx={{
                height: 40,
                px: 3,
                borderRadius: theme.shape.borderRadius >= 8 ? "12px" : "8px",
                borderColor: "primary.main",
                color: "primary.main",
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                    borderColor: theme.palette.custom?.primaryHover || "primary.dark",
                    bgcolor: theme.palette.mode === 'dark'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(16, 185, 129, 0.04)',
                    transform: 'translateY(-1px)'
                },
                transition: 'all 0.2s',
                ...props.sx
            }}
        >
            Entrar
        </Button>
    );
});

LoginButton.displayName = 'LoginButton';

export default LoginButton;

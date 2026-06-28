import { Container } from "@mui/material";

const LayoutContainer = ({ children }) => {
  return (
    <Container
      maxWidth={false}
      sx={{
        maxWidth: "1680px",
        px: { xs: 2.5, sm: 4, md: 6, lg: 8, xl: 10 },
      }}
    >
      {children}
    </Container>
  );
};

export default LayoutContainer;

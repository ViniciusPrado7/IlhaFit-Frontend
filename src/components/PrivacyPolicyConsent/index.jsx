import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Link,
  Typography,
} from "@mui/material";
import { politicaPrivacidadeSections } from "../../pages/Privacidade/politicaSections";

const PrivacyPolicyConsent = ({ checked, onChange, error }) => {
  const [open, setOpen] = useState(false);

  const openModal = (event) => {
    event.preventDefault();
    setOpen(true);
  };

  return (
    <>
      <FormControl error={Boolean(error)} sx={{ mt: 3, width: "100%" }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={checked}
              onChange={(event) => onChange(event.target.checked)}
            />
          }
          label={
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
              Li e aceito a{" "}
              <Link component="button" type="button" onClick={openModal} sx={{ fontWeight: 800 }}>
                Politica de Privacidade
              </Link>
              .
            </Typography>
          }
          sx={{ alignItems: "center", ml: 0 }}
        />
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 900 }}>Politica de Privacidade da IlhaFit</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2.25 }}>
            {politicaPrivacidadeSections.map((section) => (
              <Box key={section.title}>
                <Typography variant="h6" fontWeight={800} sx={{ mb: 0.75 }}>
                  {section.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                  {section.body}
                </Typography>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button variant="contained" onClick={() => setOpen(false)} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Entendi
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PrivacyPolicyConsent;

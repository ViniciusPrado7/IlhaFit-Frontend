import Chip from "@mui/material/Chip";
import {
  getSolicitacaoStatusColor,
  getSolicitacaoStatusLabel,
} from "./utils";

const CategoriaSolicitacaoStatusBadge = ({ status, size = "small", sx }) => (
  <Chip
    label={getSolicitacaoStatusLabel(status)}
    color={getSolicitacaoStatusColor(status)}
    size={size}
    sx={{ fontWeight: 700, ...sx }}
  />
);

export default CategoriaSolicitacaoStatusBadge;

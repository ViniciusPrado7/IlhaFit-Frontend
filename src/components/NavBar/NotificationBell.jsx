import { useState } from "react";
import {
  Badge,
  Box,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaBell, FaFlag, FaClipboardList } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAdminNotifications } from "../../hooks/useAdminNotifications";

const formatDate = (date) => {
  if (!date) return "";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const ItemIcon = ({ type }) =>
  type === "denuncia" ? <FaFlag size={13} /> : <FaClipboardList size={13} />;

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const { items, unreadCount, loading, isRead, markAsRead, markAllAsRead } =
    useAdminNotifications(true);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleItemClick = (item) => {
    markAsRead(item.id);
    handleClose();
    navigate("/admin", { state: { tab: item.tab } });
  };

  const handleVerTodas = () => {
    markAllAsRead();
    handleClose();
    navigate("/admin", { state: { tab: 5 } });
  };

  return (
    <>
      <Tooltip title="Notificações">
        <IconButton onClick={handleOpen} size="small" sx={{ color: "text.primary" }}>
          <Badge
            badgeContent={unreadCount > 0 ? unreadCount : null}
            color="error"
            max={99}
          >
            <FaBell size={18} />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: 340, maxHeight: 480 } }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="subtitle2" fontWeight={800}>
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Typography
              variant="caption"
              sx={{ cursor: "pointer", color: "primary.main" }}
              onClick={() => markAllAsRead()}
            >
              Marcar todas como lidas
            </Typography>
          )}
        </Box>

        <Divider />

        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress size={22} />
          </Box>
        )}

        {!loading && items.length === 0 && (
          <Box sx={{ py: 4, px: 2, textAlign: "center" }}>
            <FaBell size={28} style={{ opacity: 0.25, display: "block", margin: "0 auto 8px" }} />
            <Typography variant="body2" color="text.secondary">
              Nenhuma notificação pendente
            </Typography>
          </Box>
        )}

        {!loading &&
          items.slice(0, 10).map((item) => {
            const read = isRead(item.id);
            return (
              <MenuItem
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={{
                  alignItems: "flex-start",
                  gap: 1.5,
                  py: 1.5,
                  px: 2,
                  bgcolor: read ? "transparent" : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                  whiteSpace: "normal",
                }}
              >
                <Box
                  sx={{
                    mt: 0.3,
                    color: item.type === "denuncia" ? "error.main" : "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <ItemIcon type={item.type} />
                </Box>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    {!read && (
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          bgcolor: "error.main",
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={read ? 500 : 700}
                      sx={{ lineHeight: 1.3 }}
                    >
                      {item.title}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 0.25, lineHeight: 1.4 }}
                  >
                    {item.message}
                  </Typography>
                  {item.createdAt && (
                    <Typography
                      variant="caption"
                      color="text.disabled"
                      sx={{ display: "block", mt: 0.25 }}
                    >
                      {formatDate(item.createdAt)}
                    </Typography>
                  )}
                </Box>
              </MenuItem>
            );
          })}

        {!loading && items.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1.25 }}>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  cursor: "pointer",
                  color: "primary.main",
                  textAlign: "center",
                  "&:hover": { textDecoration: "underline" },
                }}
                onClick={handleVerTodas}
              >
                Ver todas as solicitações
              </Typography>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationBell;

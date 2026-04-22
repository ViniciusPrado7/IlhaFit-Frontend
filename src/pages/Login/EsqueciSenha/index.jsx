// import React, { useState } from "react";
// import {
//   Box,
//   Typography,
//   TextField,
//   Button,
//   Paper,
//   IconButton,
//   useTheme,
//   Alert,
// } from "@mui/material";
// import { FaArrowLeft } from "react-icons/fa";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import { authService } from "../../../service/AuthService";

// const getApiError = (error) => {
//   const data = error?.response?.data;

//   if (data?.erro) return data.erro;
//   if (data?.email) return data.email;
//   if (typeof data === "string") return data;

//   return error?.message || "Erro ao processar solicitacao";
// };

// const EsqueciSenha = () => {
//   const theme = useTheme();
//   const navigate = useNavigate();
//   const isDark = theme.palette.mode === "dark";

//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [errorMessage, setErrorMessage] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrorMessage("");

//     if (!email.trim()) {
//       toast.error("Preencha o email");
//       return;
//     }

//     setLoading(true);
//     try {
//       await authService.esqueciSenha(email.trim());
//       toast.success("Email de recuperacao enviado! Verifique sua caixa de entrada.");
//       setTimeout(() => navigate("/login", { state: { email: email.trim() } }), 3000);
//     } catch (error) {
//       console.error("Erro ao solicitar recuperacao:", error);
//       setErrorMessage(getApiError(error));
//     } finally {
//       setLoading(false);
//     }
//   };

//   const inputStyles = {
//     "& .MuiOutlinedInput-root": {
//       bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
//       borderRadius: 2,
//       "& fieldset": {
//         borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)",
//       },
//       "&:hover fieldset": { borderColor: theme.palette.primary.main },
//     },
//     "& .MuiInputBase-input": {
//       py: 1.65,
//     },
//     mb: 2.5,
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "calc(100vh - 112px)",
//         display: "flex",
//         alignItems: "flex-start",
//         justifyContent: "center",
//         bgcolor: "background.default",
//         pt: { xs: 2, sm: 3, md: 4 },
//         pb: { xs: 4, md: 6 },
//         px: 2,
//       }}
//     >
//       <Paper
//         elevation={0}
//         sx={{
//           width: "100%",
//           maxWidth: 620,
//           p: { xs: 3, sm: 5, md: 6 },
//           borderRadius: 4,
//           border: "1px solid",
//           borderColor: "divider",
//           bgcolor: "background.paper",
//           position: "relative",
//         }}
//       >
//         <IconButton
//           onClick={() => navigate("/login")}
//           aria-label="Voltar para login"
//           sx={{ position: "absolute", top: 16, left: 16, color: "text.secondary" }}
//         >
//           <FaArrowLeft size={20} />
//         </IconButton>

//         <Typography
//           variant="h3"
//           fontWeight={800}
//           sx={{
//             mb: 1.5,
//             color: "text.primary",
//             textAlign: "center",
//             fontSize: { xs: "2rem", md: "2.35rem" },
//             mt: 1,
//           }}
//         >
//           Recuperar senha
//         </Typography>

//         <Typography
//           variant="body2"
//           color="text.secondary"
//           sx={{ mb: 4, textAlign: "center" }}
//         >
//           Digite seu email para receber um link de redefinicao de senha.
//         </Typography>

//         <form onSubmit={handleSubmit}>
//           {errorMessage && (
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {errorMessage}
//             </Alert>
//           )}

//           <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
//             Email
//           </Typography>
//           <TextField
//             fullWidth
//             name="email"
//             type="email"
//             value={email}
//             onChange={(e) => {
//               setEmail(e.target.value);
//               setErrorMessage("");
//             }}
//             placeholder="seu@email.com"
//             error={Boolean(errorMessage)}
//             sx={inputStyles}
//           />

//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             disabled={loading}
//             sx={{
//               py: 1.75,
//               borderRadius: 3,
//               fontWeight: 700,
//               fontSize: "1rem",
//               textTransform: "none",
//               boxShadow: `0 8px 16px ${isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)"}`,
//               "&:hover": {
//                 bgcolor: "primary.dark",
//                 transform: "translateY(-2px)",
//                 transition: "all 0.2s ease",
//               },
//             }}
//           >
//             {loading ? "Enviando..." : "Enviar link"}
//           </Button>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default EsqueciSenha;

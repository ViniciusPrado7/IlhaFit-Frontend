import { Navigate } from "react-router-dom";
import { authSession } from "../../service/AuthSession";

const AdminRoute = ({ children }) => {
  const user = authSession.getUser();

  if (!user || user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;

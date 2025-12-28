import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface Props {
  children: React.ReactElement;
  fallbackRoute?: string;
}

function RouteRequiresAuth( {children, fallbackRoute = "/login"}: Props ) {
  const { token } = useAuth();
  const location = useLocation();

  if (!token) {
    return <Navigate to={fallbackRoute} state={{ from: location }} replace />;
  }

  return children;
}

export default RouteRequiresAuth;
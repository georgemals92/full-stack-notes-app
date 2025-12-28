import {
  clearToken,
  getToken,
  loginUser,
  LoginUserPayload,
  registerUser,
  RegisterUserPayload,
  saveToken,
} from "@/services/authService";
import React, { useEffect, useState, createContext, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

type User = {
  id: string;
  role?: string;
  email?: string;
  username?: string;
  name?: string;
  exp?: string;
};

interface AuthContextType {
  user: User | null;
  token: string | null;
  loginWithToken: (payload: LoginUserPayload) => Promise<void>;
  register: (payload: RegisterUserPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function decodeToken(token: string | null): User | null {
  if (!token) return null;
  try {
    const payload: any = jwtDecode(token);
    return {
      id: payload.id,
      role: payload.role,
      email: payload.email,
      username: payload.username,
      name: payload.name,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children } : {children : React.ReactNode}) : React.JSX.Element {
  const [token, setToken] = useState<string | null>(getToken());
  const [user, setUser] = useState<any | null>(null);
  // add loading state logic - TODO

  // Initialize from local storage
  useEffect(() => {
    setToken(getToken());
    setUser(decodeToken(getToken()));
    console.log(user);
  }, []);

  // Syncs user data based on token state
  useEffect(() => {
    setUser(decodeToken(getToken()));
  }, [token]);

  const loginWithToken = async (payload: LoginUserPayload) => {
    const res = await loginUser(payload);
    saveToken(res.token);
    setToken(res.token);
  };

  const register = async (payload: RegisterUserPayload) => {
    const res = await registerUser(payload);
    saveToken(res.token);
    setToken(res.token);
  };

  const logout = () => {
    clearToken();
    setToken(null);
    toast.success("Logout successful.");
  };

  return (
    <AuthContext.Provider value={{user, token, loginWithToken, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used with an AuthProvider component.");
  }
  return context;
}

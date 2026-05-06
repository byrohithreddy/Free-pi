import { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { MerchantProfile, useGetCurrentMerchant, getGetCurrentMerchantQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextType {
  token: string | null;
  merchant: MerchantProfile | null;
  isLoading: boolean;
  login: (token: string, merchant: MerchantProfile) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("upi_token"));
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: merchant, isLoading, error } = useGetCurrentMerchant({
    query: {
      enabled: !!token,
      queryKey: getGetCurrentMerchantQueryKey(),
      retry: false,
    }
  });

  useEffect(() => {
    if (error) {
      logout();
    }
  }, [error]);

  const login = (newToken: string, newMerchant: MerchantProfile) => {
    localStorage.setItem("upi_token", newToken);
    setToken(newToken);
    queryClient.setQueryData(getGetCurrentMerchantQueryKey(), newMerchant);
  };

  const logout = () => {
    localStorage.removeItem("upi_token");
    setToken(null);
    queryClient.removeQueries({ queryKey: getGetCurrentMerchantQueryKey() });
    setLocation("/login");
  };

  return (
    <AuthContext.Provider value={{ token, merchant: merchant || null, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

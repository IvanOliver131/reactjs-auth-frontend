import { createContext, ReactNode, useState } from "react";
import Router from 'next/router';
import { api } from "../services/api";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
};

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>; 
  user?: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {  
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      });
      
      const { token, refreshToken, permissions, roles } = response.data;
      
      // sessionStorage - Dura somente enquanto o usuário usa
      // localStorage - Não compensa no next
      // cookies - Armazenamos as informações do browser

      setUser({
        email,
        permissions,
        roles,
      });

      Router.push('/dashboard')
    } catch (error) {
      alert('error');
    }   
  }
  
  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
import { createContext, ReactNode, useEffect, useState } from "react";
import Router from 'next/router';
import { setCookie, parseCookies } from 'nookies';
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

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();
  
    if (token) {
      api.get('/me').then(response => {
        console.log(response.data)
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      })
    }
  }, []);

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

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/', // Qualquer endereço da aplicação vai ter acesso 
      });

      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/', // Qualquer endereço da aplicação vai ter acesso 
      });

      setUser({
        email,
        permissions,
        roles,
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
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
import { createContext, ReactNode, useEffect, useState } from "react";
import Router from 'next/router';
import { setCookie, parseCookies, destroyCookie } from 'nookies';
import { api } from "../services/apiClient";

// Types
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
  signIn: (credentials: SignInCredentials) => Promise<void>; 
  signOut: () => void; 
  user?: User;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut(broadcast: boolean = true) {
  destroyCookie(undefined, 'nextauth.token');
  destroyCookie(undefined, 'nextauth.refreshToken');

  if (broadcast) authChannel.postMessage('signOut'); 

  // Redireciona o usuário de volta para home
  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {  
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    // Precisa ser utilizado somente do lado do cliente
    authChannel = new BroadcastChannel('auth');
    
    authChannel.onmessage = (message) => {
      switch (message.data) {
        // Caso ele deslogue deslogamos todas as paginas
        case 'signOut':
          // Enviamos o valor false para não entrar em looping e avisar que não quer fazer o broadcast novamente
          signOut(false);
          break;
        
        // Caso ele logue mandamos ele pra pagina de dashboard
        case 'signIn':
          window.location.replace("http://localhost:3000/dashboard");
          break;

        default:
          break;
      }
    }
  }, []);

  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies();
  
    if (token) {
      api.get('/me').then(response => {
        // console.log(response.data)
        const { email, permissions, roles } = response.data;

        setUser({ email, permissions, roles });
      })
      .catch(() => {
        signOut();
      });
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

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');

      authChannel.postMessage('signIn');
    } catch (error) {
      alert('error');
    }   
  }
  
  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}
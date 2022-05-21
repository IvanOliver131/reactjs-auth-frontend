import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';

let cookies = parseCookies();
let isRefreshing = false;
let failedRequestsQueue: { onSuccess: (token: string) => void; onFailure: (error: AxiosError<unknown, any>) => void; }[] = [];

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL,
  headers: {
    Authorization: `Bearer ${cookies['nextauth.token']}`
  }
});

api.interceptors.response.use(response => {
  return response;
}, (error: any) => {
  if (error.response.status === 401) {
    if (error.response.data.code === 'token.expired') {
      cookies = parseCookies();

      const { 'nextauth.refreshToken': refreshToken } = cookies;
      const originalConfig = error.config;

      if (!isRefreshing) {
        isRefreshing = true;

        api.post('/refresh', {
          refreshToken,
        }).then(response => {
          const { token } = response.data;
          
          setCookie(undefined, 'nextauth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/', // Qualquer endereço da aplicação vai ter acesso 
          });
  
          setCookie(undefined, 'nextauth.refreshToken', response.data.refreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/', // Qualquer endereço da aplicação vai ter acesso 
          });
  
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
          failedRequestsQueue.forEach(request => request.onSuccess(token));
          failedRequestsQueue = [];
        }).catch(error => {
          failedRequestsQueue.forEach(request => request.onFailure(error));
          failedRequestsQueue = [];
        }).finally(() => {
          isRefreshing = false;
        });
      }

      // Unica forma de mandar um metodo asyncrono
      return new Promise((resolve, reject) => {
        failedRequestsQueue.push({
          onSuccess: (token: string) => {
            originalConfig.headers['Authorization'] = `Bearer ${token}`
          
            resolve(api(originalConfig))
          },
          onFailure: (error: AxiosError) => {
            reject(error);
          } 
        })
      })
    } else {
      // Deslogar o usuário
      signOut();
    }
  }

  return Promise.reject(error); 
});
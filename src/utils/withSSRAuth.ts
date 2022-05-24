import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";
import { AuthTokenError } from "../services/errors/AuthTokenError";
import decode from 'jwt-decode';
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

// P = ao tipo recebido
export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    // Por ser do lado do servidor eu possuo o contexto
    const cookies = parseCookies(ctx);
    const token = cookies['nextauth.token'];
    // Se eu possuo a autenticação eu redireciono diretamente para a tela do dashboard
    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    if (options) {
      // Força o tipo que vai retornar 
      const user = decode<{ permissions: string[], roles: string[] }>(token);
      const { permissions, roles } = options;

      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      });

      if (!userHasValidPermissions) {
        return {
          // Redireciona para uma pagina que todos os usuários podem acesa... ou senao coloca um notFound
          redirect: {
            destination: '/dashboard',
            permanent: false,
          }
        }
      }
    }
    
    try {
      // Caso a funçao de cima nao funcione vamos executar
      // a função que recebemos com o contexto como paramêtro
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'nextauth.token');
        destroyCookie(ctx, 'nextauth.refreshToken');
    
        return {
          redirect: {
            destination: '/',
            permanent: false,
          }
        }
      }   
    }   
  }
}
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { destroyCookie, parseCookies } from "nookies";

// P = ao tipo recebido
export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    // Por ser do lado do servidor eu possuo o contexto
    const cookies = parseCookies(ctx);
    
    // Se eu possuo a autenticação eu redireciono diretamente para a tela do dashboard
    if (!cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false,
        }
      }
    }

    try {
      // Caso a funçao de cima nao funcione vamos executar
      // a função que recebemos com o contexto como paramêtro
      return await fn(ctx);
    } catch (error) {
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
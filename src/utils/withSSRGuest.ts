import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

// P = ao tipo recebido
export function withSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    // Por ser do lado do servidor eu possuo o contexto
    const cookies = parseCookies(ctx);
    
    // Se eu possuo a autenticação eu redireciono diretamente para a tela do dashboard
    if (cookies['nextauth.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false,
        }
      }
    }

    // Caso a funçao de cima nao funcione vamos executar
    // a função que recebemos com o contexto como paramêtro
    return await fn(ctx);
  }
}
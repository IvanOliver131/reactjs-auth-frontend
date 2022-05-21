import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { FormEvent, useContext, useState } from "react";
import { AuthContext } from '../contexts/AuthContext';
import styles from './home.module.css';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <h2>LogIN...</h2>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" className={styles.loginButton}>Entrar</button> 
    </form>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
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

  return {
    props: {}
  }
}
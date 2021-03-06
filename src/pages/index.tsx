import { FormEvent, useContext, useState } from "react";
import { withSSRGuest } from "../utils/withSSRGuest";
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
      <input type="email" className={styles.inputStyle} placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} />
      <input type="password" className={styles.inputStyle} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
      <button type="submit" className={styles.loginButton}>Entrar</button> 
    </form>
  )
}

export const getServerSideProps = withSSRGuest(async (ctx) => {
  return {
    props: {}
  }
});
import { useContext, useEffect } from "react";
import { withSSRAuth } from "../utils/withSSRAuth";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { Can } from "../components/Can";

import styles from './home.module.css';

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api.get('/me')
      .then((response) => {
        // console.log(response)
      })
      // .catch(error => console.log(error))
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email} </h1>

      <button onClick={signOut} className={styles.loginButton}>SignOut</button> 
      
      <br/><br/>

      <Can permissions={['metrics.list']}>
        <div>
          Métricas
        </div> 
      </Can>     
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');
  // 👆 console.log(response) caso queira ver os dados
  
  return {
    props: {}
  }
})
import { destroyCookie } from "nookies";
import { useContext, useEffect } from "react";
import { withSSRAuth } from "../../utils/withSSRAuth";
import { AuthContext } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/api";
import { api } from "../services/apiClient";
import { AuthTokenError } from "../services/errors/AuthTokenError";

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  
  useEffect(() => {
    api.get('/me')
      .then((response) => {
        console.log(response)
      })
      // .catch(error => console.log(error))
  }, []);

  return (
    <h1>Dashboard: {user?.email} </h1>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');
  
  return {
    props: {}
  }
})
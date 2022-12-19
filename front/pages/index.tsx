import { useSession } from "next-auth/react";
import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home(props) {
  const { data: session } = useSession();
  const click = () => {
    console.log(session);
  };
  return (
    <>
      <Head>
        <title>Certifi</title>
        <meta name="description" content="Certifi - Blockchain Republic app" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Certifi</h1>

        <p className={styles.description}>Blockchain Republic app</p>
        <button onClick={click}>Click</button>
      </main>
      ;
    </>
  );
}

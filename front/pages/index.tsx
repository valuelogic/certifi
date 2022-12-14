import Head from "next/head";
import styles from "../styles/Home.module.css";

export default function Home(props) {
  return (
    <>
      <Head>
        <title>Certifi</title>
        <meta name="description" content="Certifi - Blockchain Republic app" />
      </Head>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Certifi</h1>

        <p className={styles.description}>Blockchain Republic app</p>
      </main>
      ;
    </>
  );
}

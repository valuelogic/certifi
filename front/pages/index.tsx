import Head from 'next/head'
import styles from '../styles/Home.module.css'
import {TopNavbar} from "../components/topNavbar";

export default function Home() {
  return (
    <div className={styles.container}>
        <TopNavbar/>
        <Head>
            <title>Certifi</title>
            <meta name="description" content="Certifi - Blockchain Republic app"/>
        </Head>

        <main className={styles.main}>
            <h1 className={styles.title}>
                Welcome to Certifi
            </h1>

            <p className={styles.description}>
                Blockchain Republic app
            </p>
        </main>
    </div>
  )
}

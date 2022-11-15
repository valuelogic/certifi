import styles from "../styles/TopNavbar.module.css";

export const TopNavbar = () => <div className={styles.topnav}>
    <a>Home</a>
    <a>Contact</a>
    <a>About</a>
    <a className={styles.login}>Login</a>
</div>;
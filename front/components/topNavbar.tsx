import styles from "../styles/TopNavbar.module.css";
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { signIn } from 'next-auth/react';
import { useAccount, useConnect, useSignMessage, useDisconnect } from 'wagmi';
import { useRouter } from 'next/router';
import axios from 'axios';


export const TopNavbar = () => {
    const { connectAsync } = useConnect();
    const { disconnectAsync } = useDisconnect();
    const { isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const { push } = useRouter();

    const handleAuth = async () => {
        if (isConnected) {
            await disconnectAsync();
        }

        const { account, chain } = await connectAsync({ connector: new MetaMaskConnector() });

        const userData = { address: account, chain: chain.id, network: 'evm' };

        const { data } = await axios.post('/api/auth/request-message', userData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        const message = data.message;

        const signature = await signMessageAsync({ message });

        const { url } = await signIn('credentials', { message, signature, redirect: false, callbackUrl: '/user' });
        push(url);
    };

    return <div className={styles.topnav}>
        <a>Home</a>
        <a>Contact</a>
        <a>About</a>
        <a className={styles.login} onClick={() => handleAuth()}>Login</a>
    </div>;
};
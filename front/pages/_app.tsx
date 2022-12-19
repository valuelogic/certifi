import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { RainbowKitSiweNextAuthProvider } from "@rainbow-me/rainbowkit-siwe-next-auth";
import "@rainbow-me/rainbowkit/styles.css";
import { SessionProvider } from "next-auth/react";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { goerli, mainnet, polygon } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import Layout from "../components/Layout";
import "../styles/globals.css";

const { chains, provider } = configureChains(
  [mainnet, goerli, polygon],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: "Certifi",
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

export default function App({ Component, pageProps }) {
  return (
    <WagmiConfig client={wagmiClient}>
      <SessionProvider session={pageProps.session} refetchInterval={0}>
        <RainbowKitSiweNextAuthProvider>
          <RainbowKitProvider chains={chains}>
            <Layout>
              <Component {...pageProps} />;
            </Layout>
          </RainbowKitProvider>
        </RainbowKitSiweNextAuthProvider>
      </SessionProvider>
    </WagmiConfig>
  );
}

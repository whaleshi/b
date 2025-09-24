import { createConfig, http } from "wagmi";
import { injected, walletConnect, coinbaseWallet } from "wagmi/connectors";
import { xLayer, morphHolesky } from "wagmi/chains";
import { defineChain } from "viem";

// const customNetwork = defineChain({
//     id: 31337,
//     name: "Custom Network",
//     nativeCurrency: {
//         decimals: 18,
//         name: "Ether",
//         symbol: "ETH",
//     },
//     rpcUrls: {
//         default: {
//             http: ["http://43.160.204.41:8545"],
//         },
//     },
// });

export const config = createConfig({
    chains: [xLayer],
    connectors: [
        injected({ shimDisconnect: true }),
        walletConnect({
            projectId: "cf29fa9397c7812afa53a3e0cdaf5764",
        }),
        coinbaseWallet({
            appName: "xboz.fun",
        }),
    ],
    transports: {
        [xLayer.id]: http(),
    },
    ssr: false,
});

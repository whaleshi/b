import { http, createConfig } from "wagmi";
import { xLayer, morphHolesky } from "wagmi/chains";
import { defineChain } from "viem";
import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
    metaMaskWallet,
    okxWallet,
    walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";

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

const connectors = connectorsForWallets(
    [
        {
            groupName: "推荐钱包",
            wallets: [okxWallet, metaMaskWallet],
        },
        {
            groupName: "其他连接方式",
            wallets: [walletConnectWallet],
        },
    ],
    {
        appName: "xboz.fun",
        projectId: "cf29fa9397c7812afa53a3e0cdaf5764",
    }
);

export const config = createConfig({
    connectors,
    chains: [xLayer],
    transports: {
        [xLayer.id]: http(),
    },
    ssr: false,
});

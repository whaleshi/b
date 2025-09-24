import { http } from "wagmi";
import { xLayer, morphHolesky } from "wagmi/chains";
import { defineChain } from "viem";
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

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

export const config = getDefaultConfig({
    appName: 'xboz.fun',
    projectId: 'cf29fa9397c7812afa53a3e0cdaf5764',
    chains: [xLayer],
    transports: {
        [xLayer.id]: http(),
    },
    ssr: false,
});

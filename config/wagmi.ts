import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xLayer, morphHolesky } from "wagmi/chains";
import { defineChain } from "viem";

const customNetwork = defineChain({
    id: 31337,
    name: "Custom Network",
    nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
    },
    rpcUrls: {
        default: {
            http: ["http://43.160.204.41:8545"],
        },
    },
});

export const config = createConfig({
    chains: [customNetwork],
    connectors: [injected({ shimDisconnect: true })],
    transports: {
        // [morphHolesky.id]: http(),
        [customNetwork.id]: http("http://43.160.204.41:8545"),
    },
    ssr: false,
});

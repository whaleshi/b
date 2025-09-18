import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { mainnet, polygon, optimism, arbitrum, base } from "wagmi/chains";

export const config = createConfig({
    chains: [mainnet, polygon, optimism, arbitrum, base],
    connectors: [injected({ shimDisconnect: true })],
    transports: {
        [mainnet.id]: http(),
        [polygon.id]: http(),
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
    },
    ssr: false,
});

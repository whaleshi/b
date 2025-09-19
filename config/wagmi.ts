import { createConfig, http } from "wagmi";
import { injected } from "wagmi/connectors";
import { xLayer } from "wagmi/chains";

export const config = createConfig({
    chains: [xLayer],
    connectors: [injected({ shimDisconnect: true })],
    transports: {
        [xLayer.id]: http(),
    },
    ssr: false,
});

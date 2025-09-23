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

// 网络配置 - 只需要在这里修改，其他地方会自动更新
export const CHAINS_CONFIG = {
    // 默认链 - 修改这里即可切换整个应用的默认网络
    DEFAULT_CHAIN: xLayer,

    // 支持的链列表 - 按优先级排序
    SUPPORTED_CHAINS: [xLayer],

    // 链相关配置
    CHAIN_CONFIG: {
        [xLayer.id]: {
            name: "X Layer",
            symbol: "OKB",
            explorerUrl: "https://www.oklink.com/xlayer",
            rpcUrl: "https://rpc.xlayer.tech",
        },
        [morphHolesky.id]: {
            name: "Morph Holesky",
            symbol: "ETH",
            explorerUrl: "https://explorer-holesky.morphl2.io",
            rpcUrl: "https://rpc-quicknode-holesky.morphl2.io",
        },
        [customNetwork.id]: {
            name: "Custom Network",
            symbol: "ETH",
            explorerUrl: "",
            rpcUrl: "http://43.160.204.41:8545",
        },
    },
} as const;

// 导出常用的配置
export const DEFAULT_CHAIN_ID = CHAINS_CONFIG.DEFAULT_CHAIN.id;
export const DEFAULT_CHAIN_CONFIG =
    CHAINS_CONFIG.CHAIN_CONFIG[DEFAULT_CHAIN_ID];

// 获取当前默认链的配置信息
export const getCurrentChainConfig = () => ({
    chainId: DEFAULT_CHAIN_ID,
    name: DEFAULT_CHAIN_CONFIG.name,
    symbol: DEFAULT_CHAIN_CONFIG.symbol,
    explorerUrl: DEFAULT_CHAIN_CONFIG.explorerUrl,
    rpcUrl: DEFAULT_CHAIN_CONFIG.rpcUrl,
});

// 合约地址配置
export const CONTRACT_CONFIG = {
    // 工厂合约地址 - 用于创建新代币
    FACTORY_CONTRACT: "0x3c609DACA9867309b3170d109486f37EBaE0B6a6" as const,
    ROUTER_CONTRACT: "0xe820A21fABA2e9a22d1f0240Af6Bd20B32c68a34" as const,
    WETH_ADDRESS: "0xe538905cf8410324e03A5A23C1c177a474D59b2b" as const,
} as const;

// Multicall3 合约地址 (通用地址，大多数链都支持)
export const MULTICALL3_ADDRESS = "0xcA11bde05977b3631167028862bE2a173976CA11";

// Multicall3 ABI
export const MULTICALL3_ABI = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "target",
                        type: "address",
                    },
                    {
                        internalType: "bool",
                        name: "allowFailure",
                        type: "bool",
                    },
                    { internalType: "bytes", name: "callData", type: "bytes" },
                ],
                internalType: "struct Multicall3.Call3[]",
                name: "calls",
                type: "tuple[]",
            },
        ],
        name: "aggregate3",
        outputs: [
            {
                components: [
                    { internalType: "bool", name: "success", type: "bool" },
                    {
                        internalType: "bytes",
                        name: "returnData",
                        type: "bytes",
                    },
                ],
                internalType: "struct Multicall3.Result[]",
                name: "returnData",
                type: "tuple[]",
            },
        ],
        stateMutability: "payable",
        type: "function",
    },
];

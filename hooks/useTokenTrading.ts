import { ethers } from "ethers";
import { useAccount } from "wagmi";
import { DEFAULT_CHAIN_CONFIG, CONTRACT_CONFIG } from "@/config/chains";
import { useSlippageStore } from "@/stores/useSlippageStore";

export interface BuyResult {
    txHash: string;
    receipt: any;
    tokenAmountOut: string;
    refund: string;
}

export interface SellResult {
    txHash: string;
    receipt: any;
    approveTxHash: string | null;
    ethAmountOut: string;
    tokenBalance: string;
}

export const useTokenTrading = () => {
    const { address, isConnected } = useAccount();
    const { slippage, getSlippageMultiplier } = useSlippageStore();

    // 买入逻辑封装
    const handleBuy = async (
        tokenAddress: string,
        ethAmount: string
    ): Promise<BuyResult> => {
        console.log("=== 买入操作 ===");

        if (!isConnected || !address) {
            throw new Error("Please connect wallet first");
        }
        if (typeof window === "undefined" || !(window as any).ethereum)
            throw new Error("No injected provider");

        // const { CONTRACT_CONFIG } = await import("@/config/chains");
        const contractABI = (await import("@/constant/abi.json")).default;

        const provider = new ethers.JsonRpcProvider(
            DEFAULT_CHAIN_CONFIG.rpcUrl
        );
        const ethersProvider = new ethers.BrowserProvider(
            (window as any).ethereum as any
        );
        const signer = await ethersProvider.getSigner();

        console.log("Calling tryBuy with parameters:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", ethers.parseEther(ethAmount));

        // 1. 调用 tryBuy 获取预期输出
        const readOnlyContract = new ethers.Contract(
            CONTRACT_CONFIG.FACTORY_CONTRACT,
            contractABI,
            provider
        );
        const result = await readOnlyContract.tryBuy(
            tokenAddress,
            ethers.parseEther(ethAmount)
        );

        console.log("tryBuy 返回值:", result);
        console.log("Token Amount Out:", result[0]?.toString());
        console.log("Refund:", result[1]?.toString());

        // 2. 计算滑点保护
        const tokenAmountOut = result[0];
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const minAmountOut =
            (tokenAmountOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);

        console.log("调用 buyToken 参数:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", ethers.parseEther(ethAmount));
        console.log(
            `MinAmountOut (with ${slippage}% slippage):`,
            minAmountOut.toString()
        );

        // 3. 执行买入交易
        const contract = new ethers.Contract(
            CONTRACT_CONFIG.FACTORY_CONTRACT,
            contractABI,
            signer
        );

        console.log("发送 buyToken 交易...");

        // 估算 gas limit
        let gasLimit;
        try {
            const estimatedGas = await contract.buyToken.estimateGas(
                tokenAddress,
                ethers.parseEther(ethAmount),
                minAmountOut,
                {
                    value: ethers.parseEther(ethAmount),
                }
            );
            gasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("预估 Gas Limit:", gasLimit.toString());
        } catch (e) {
            console.warn("Gas 估算失败:", e);
            gasLimit = undefined;
        }

        // 获取 gas price
        const gasPrice = (await ethersProvider.getFeeData()).gasPrice;
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : null; // +5%
        console.log("Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        const txOptions = {
            value: ethers.parseEther(ethAmount),
            // type: 0, // 强制使用 Legacy 交易类型
        } as any;

        if (gasLimit) {
            txOptions.gasLimit = gasLimit;
        }
        if (newGasPrice) {
            txOptions.gasPrice = newGasPrice;
        }

        const buyResult = await contract.buyToken(
            tokenAddress,
            ethers.parseEther(ethAmount),
            minAmountOut,
            txOptions
        );

        console.log("buyToken 交易已发送:", buyResult.hash);
        const receipt = await buyResult.wait();
        console.log("buyToken 交易已确认:", receipt);

        return {
            txHash: buyResult.hash,
            receipt,
            tokenAmountOut: result[0]?.toString(),
            refund: result[1]?.toString(),
        };
    };

    // 卖出逻辑封装
    const handleSell = async (
        tokenAddress: string,
        tokenAmount: string
    ): Promise<SellResult> => {
        console.log("=== 卖出操作 ===");

        if (!isConnected || !address) {
            throw new Error("Please connect wallet first");
        }
        if (typeof window === "undefined" || !(window as any).ethereum)
            throw new Error("No injected provider");

        // const { CONTRACT_CONFIG } = await import("@/config/chains");
        const contractABI = (await import("@/constant/abi.json")).default;

        const provider = new ethers.JsonRpcProvider(
            DEFAULT_CHAIN_CONFIG.rpcUrl
        );
        const ethersProvider = new ethers.BrowserProvider(
            (window as any).ethereum as any
        );
        const signer = await ethersProvider.getSigner();

        // 1. 获取代币余额
        const tokenABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
        ];

        const tokenContract = new ethers.Contract(
            tokenAddress,
            tokenABI,
            signer
        );
        const balance = await tokenContract.balanceOf(address);

        console.log("代币余额:", balance.toString());
        console.log("要卖出的数量:", tokenAmount);

        if (balance === BigInt(0)) {
            throw new Error("Insufficient balance");
        }

        // 转换用户输入的金额为 wei
        const sellAmount = ethers.parseEther(tokenAmount);

        if (sellAmount > balance) {
            throw new Error("Insufficient balance");
        }

        // 2. 调用 trySell 获取预期输出
        const readOnlyContract = new ethers.Contract(
            CONTRACT_CONFIG.FACTORY_CONTRACT,
            contractABI,
            provider
        );
        const sellResult = await readOnlyContract.trySell(
            tokenAddress,
            sellAmount
        );

        console.log("trySell 返回值:", sellResult);
        console.log("ETH Amount Out:", sellResult.toString());

        // 3. 计算滑点保护
        const ethAmountOut = sellResult;
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const minEthOut =
            (ethAmountOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);
        console.log(
            `MinEthOut (with ${slippage}% slippage):`,
            minEthOut.toString()
        );

        // 4. 检查和执行授权
        const factoryContract = new ethers.Contract(
            CONTRACT_CONFIG.FACTORY_CONTRACT,
            contractABI,
            signer
        );
        const allowance = await tokenContract.allowance(
            address,
            CONTRACT_CONFIG.FACTORY_CONTRACT
        );

        console.log("当前授权额度:", allowance.toString());

        let approveTxHash = null;
        if (allowance < sellAmount) {
            console.log("需要授权，发送 approve 交易...");
            console.log("授权数量: 无限授权 (uint256 最大值)");

            // 估算 approve 的 gas limit，使用最大值（用户全部余额）
            let approveGasLimit;
            try {
                const estimatedGas = await tokenContract.approve.estimateGas(
                    CONTRACT_CONFIG.FACTORY_CONTRACT,
                    ethers.MaxUint256 // 使用最大 uint256 进行无限授权
                );
                approveGasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
                console.log(
                    "Approve 预估 Gas Limit:",
                    approveGasLimit.toString()
                );
            } catch (e) {
                console.warn("Approve Gas 估算失败:", e);
                approveGasLimit = undefined;
            }

            // 获取 gas price
            const gasPrice = (await provider.getFeeData()).gasPrice;
            const newGasPrice = gasPrice
                ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
                : null; // +5%

            const approveTxOptions = {
                // type: 0, // 强制使用 Legacy 交易类型
            } as any;

            if (approveGasLimit) {
                approveTxOptions.gasLimit = approveGasLimit;
            }
            if (newGasPrice) {
                approveTxOptions.gasPrice = newGasPrice;
            }

            const approveResult = await tokenContract.approve(
                CONTRACT_CONFIG.FACTORY_CONTRACT,
                ethers.MaxUint256, // 无限授权
                approveTxOptions
            );

            console.log("授权交易已发送:", approveResult.hash);
            const approveReceipt = await approveResult.wait();
            console.log("授权交易已确认:", approveReceipt);
            approveTxHash = approveResult.hash;
        }

        // 5. 执行卖出操作
        console.log("发送 sellToken 交易...");
        console.log("卖出参数:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", sellAmount.toString());
        console.log("MinAmountOut:", minEthOut.toString());

        // 估算 sellToken 的 gas limit
        let sellGasLimit;
        try {
            const estimatedGas = await factoryContract.sellToken.estimateGas(
                tokenAddress,
                sellAmount,
                minEthOut
            );
            sellGasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("SellToken 预估 Gas Limit:", sellGasLimit.toString());
        } catch (e) {
            console.warn("SellToken Gas 估算失败:", e);
            sellGasLimit = undefined;
        }

        // 获取 gas price
        const gasPrice = (await ethersProvider.getFeeData()).gasPrice;
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : null; // +5%
        console.log("SellToken Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        const sellTxOptions = {
            // type: 0, // 强制使用 Legacy 交易类型
        } as any;

        if (sellGasLimit) {
            sellTxOptions.gasLimit = sellGasLimit;
        }
        if (newGasPrice) {
            sellTxOptions.gasPrice = newGasPrice;
        }

        const sellTxResult = await factoryContract.sellToken(
            tokenAddress,
            sellAmount,
            minEthOut,
            sellTxOptions
        );

        console.log("sellToken 交易已发送:", sellTxResult.hash);
        const sellReceipt = await sellTxResult.wait();
        console.log("sellToken 交易已确认:", sellReceipt);

        return {
            txHash: sellTxResult.hash,
            receipt: sellReceipt,
            approveTxHash,
            ethAmountOut: ethAmountOut.toString(),
            tokenBalance: sellAmount.toString(),
        };
    };

    return {
        handleBuy,
        handleSell,
        isConnected,
        address,
    };
};

import { useAccount } from "wagmi";
import { readContract, writeContract, estimateGas, getGasPrice } from "@wagmi/core";
import { parseEther } from "viem";
import { CONTRACT_CONFIG } from "@/config/chains";
import { useSlippageStore } from "@/stores/useSlippageStore";
import { config } from "@/config/wagmi";

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

        const contractABI = (await import("@/constant/abi.json")).default;
        const amount = parseEther(ethAmount);

        console.log("Calling tryBuy with parameters:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", amount);

        // 1. 调用 tryBuy 获取预期输出
        const result = await readContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "tryBuy",
            args: [tokenAddress, amount],
        });

        console.log("tryBuy 返回值:", result);
        console.log("Token Amount Out:", (result as any)[0]?.toString());
        console.log("Refund:", (result as any)[1]?.toString());

        // 2. 计算滑点保护
        const tokenAmountOut = (result as any)[0];
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const minAmountOut =
            (tokenAmountOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);
        console.log("调用 buyToken 参数:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", amount);
        console.log(
            `MinAmountOut (with ${slippage}% slippage):`,
            minAmountOut.toString()
        );

        // 3. 估算 gas limit
        let gasLimit;
        try {
            const estimatedGas = await estimateGas(config, {
                to: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
                data: `0x`, // 这里应该是实际的函数调用数据，但 wagmi 会自动处理
                value: amount,
            });
            gasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("预估 Gas Limit:", gasLimit.toString());
        } catch (e) {
            console.warn("Gas 估算失败:", e);
            gasLimit = undefined;
        }

        // 4. 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100) : undefined; // +5%
        
        console.log("Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        // 5. 执行买入交易
        console.log("发送 buyToken 交易...");
        
        const buyResult = await writeContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "buyToken",
            args: [tokenAddress, amount, minAmountOut],
            value: amount,
            gas: gasLimit,
            gasPrice: newGasPrice,
            type: "legacy" as const,
        });

        console.log("buyToken 交易已发送:", buyResult);

        return {
            txHash: buyResult,
            receipt: null, // wagmi 不直接返回 receipt，需要另外获取
            tokenAmountOut: (result as any)[0]?.toString(),
            refund: (result as any)[1]?.toString(),
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

        const contractABI = (await import("@/constant/abi.json")).default;
        const tokenABI = [
            "function balanceOf(address owner) view returns (uint256)",
            "function approve(address spender, uint256 amount) returns (bool)",
            "function allowance(address owner, address spender) view returns (uint256)",
        ];

        // 1. 获取代币余额
        const balance = await readContract(config, {
            address: tokenAddress as `0x${string}`,
            abi: tokenABI,
            functionName: "balanceOf",
            args: [address],
        }) as bigint;

        console.log("代币余额:", balance.toString());
        console.log("要卖出的数量:", tokenAmount);

        if (balance === BigInt(0)) {
            throw new Error("Insufficient balance");
        }

        const sellAmount = parseEther(tokenAmount);

        if (sellAmount > balance) {
            throw new Error("Insufficient balance");
        }

        // 2. 调用 trySell 获取预期输出
        const sellResult = await readContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "trySell",
            args: [tokenAddress, sellAmount],
        }) as bigint;

        console.log("trySell 返回值:", sellResult);
        console.log("ETH Amount Out:", sellResult.toString());

        // 3. 计算滑点保护
        const ethAmountOut = sellResult;
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const minEthOut = (ethAmountOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);
        console.log(`MinEthOut (with ${slippage}% slippage):`, minEthOut.toString());

        // 4. 检查和执行授权
        const allowance = await readContract(config, {
            address: tokenAddress as `0x${string}`,
            abi: tokenABI,
            functionName: "allowance",
            args: [address, CONTRACT_CONFIG.FACTORY_CONTRACT],
        }) as bigint;

        console.log("当前授权额度:", allowance.toString());

        // 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100) : undefined; // +5%
        
        console.log("Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        let approveTxHash = null;
        if (allowance < sellAmount) {
            console.log("需要授权，发送 approve 交易...");
            console.log("授权数量: 无限授权");

            // 估算 approve 的 gas limit
            let approveGasLimit;
            try {
                const estimatedGas = await estimateGas(config, {
                    to: tokenAddress as `0x${string}`,
                    data: `0x`, // approve 函数调用数据
                });
                approveGasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
                console.log("Approve 预估 Gas Limit:", approveGasLimit.toString());
            } catch (e) {
                console.warn("Approve Gas 估算失败:", e);
                approveGasLimit = undefined;
            }

            const approveResult = await writeContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: tokenABI,
                functionName: "approve",
                args: [CONTRACT_CONFIG.FACTORY_CONTRACT, BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff")],
                gas: approveGasLimit,
                gasPrice: newGasPrice,
                type: "legacy" as const,
            });

            console.log("授权交易已发送:", approveResult);
            approveTxHash = approveResult;
        }

        // 5. 估算 sellToken 的 gas limit
        let sellGasLimit;
        try {
            const estimatedGas = await estimateGas(config, {
                to: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
                data: `0x`, // sellToken 函数调用数据
            });
            sellGasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("SellToken 预估 Gas Limit:", sellGasLimit.toString());
        } catch (e) {
            console.warn("SellToken Gas 估算失败:", e);
            sellGasLimit = undefined;
        }

        // 6. 执行卖出操作
        console.log("发送 sellToken 交易...");
        console.log("卖出参数:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", sellAmount.toString());
        console.log("MinAmountOut:", minEthOut.toString());

        const sellTxResult = await writeContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "sellToken",
            args: [tokenAddress, sellAmount, minEthOut],
            gas: sellGasLimit,
            gasPrice: newGasPrice,
            type: "legacy" as const,
        });

        console.log("sellToken 交易已发送:", sellTxResult);

        return {
            txHash: sellTxResult,
            receipt: null, // wagmi 不直接返回 receipt
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

import { useAccount } from "wagmi";
import {
    readContract,
    writeContract,
    estimateGas,
    getGasPrice,
    getBalance,
} from "@wagmi/core";
import { parseEther, formatEther } from "viem";
import { CONTRACT_CONFIG } from "@/config/chains";
import { useSlippageStore } from "@/stores/useSlippageStore";
import { config } from "@/config/wagmi";
import contractABI from "@/constant/TM.json";
import swapABI from "@/constant/Swap.json";

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

        // 3. 检查钱包余额
        const walletBalance = await getBalance(config, {
            address: address as `0x${string}`,
        });

        console.log("钱包余额:", formatEther(walletBalance.value), "OKB");
        console.log("购买金额:", formatEther(amount), "OKB");

        if (walletBalance.value < amount) {
            throw new Error(
                `Insufficient balance. You have ${formatEther(walletBalance.value)} OKB but trying to spend ${formatEther(amount)} OKB`
            );
        }

        // 4. 估算 gas limit
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

        // 5. 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : undefined; // +5%

        console.log("Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        // 6. 执行买入交易
        console.log("发送 buyToken 交易...");

        const buyResult = await writeContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "purchase",
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
        console.log(1);
        if (!isConnected || !address) {
            console.log("请先连接钱包");
            throw new Error("Please connect wallet first");
        }
        console.log(2);
        const tokenABI = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_spender", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {"name": "_owner", "type": "address"},
                    {"name": "_spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            }
        ];

        // 1. 获取代币余额
        console.log("开始获取代币余额...");
        console.log("代币地址:", tokenAddress);
        console.log("用户地址:", address);
        
        let balance: bigint;
        try {
            balance = (await readContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: tokenABI,
                functionName: "balanceOf",
                args: [address],
            })) as bigint;
            
            console.log("成功获取代币余额:", balance.toString());
            console.log("要卖出的数量:", tokenAmount);
            
        } catch (error) {
            console.error("获取代币余额失败:", error);
            console.error("错误详情:", {
                tokenAddress,
                address,
                errorMessage: error instanceof Error ? error.message : String(error)
            });
            throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (balance === BigInt(0)) {
            throw new Error("Insufficient balance");
        }

        const sellAmount = parseEther(tokenAmount);

        if (sellAmount > balance) {
            throw new Error("Insufficient balance");
        }

        // 2. 调用 trySell 获取预期输出
        const sellResult = (await readContract(config, {
            address: CONTRACT_CONFIG.FACTORY_CONTRACT as `0x${string}`,
            abi: contractABI,
            functionName: "trySell",
            args: [tokenAddress, sellAmount],
        })) as bigint;

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
        const allowance = (await readContract(config, {
            address: tokenAddress as `0x${string}`,
            abi: tokenABI,
            functionName: "allowance",
            args: [address, CONTRACT_CONFIG.FACTORY_CONTRACT],
        })) as bigint;

        console.log("当前授权额度:", allowance.toString());

        // 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : undefined; // +5%

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
                console.log(
                    "Approve 预估 Gas Limit:",
                    approveGasLimit.toString()
                );
            } catch (e) {
                console.warn("Approve Gas 估算失败:", e);
                approveGasLimit = undefined;
            }

            const approveResult = await writeContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: tokenABI,
                functionName: "approve",
                args: [
                    CONTRACT_CONFIG.FACTORY_CONTRACT,
                    BigInt(
                        "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
                    ),
                ],
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
            functionName: "sell",
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

    // 外盘 Swap 买入功能
    const handleSwapBuy = async (
        tokenAddress: string,
        ethAmount: string
    ): Promise<BuyResult> => {
        console.log("=== Swap 买入操作 ===");

        if (!isConnected || !address) {
            throw new Error("Please connect wallet first");
        }

        const amount = parseEther(ethAmount);

        console.log("Swap 买入参数:");
        console.log("Token address:", tokenAddress);
        console.log("ETH Amount:", amount);

        // 1. 检查钱包余额
        const walletBalance = await getBalance(config, {
            address: address as `0x${string}`,
        });
        
        console.log("钱包余额:", formatEther(walletBalance.value), "ETH");
        console.log("购买金额:", formatEther(amount), "ETH");
        
        if (walletBalance.value < amount) {
            throw new Error(`Insufficient balance. You have ${formatEther(walletBalance.value)} ETH but trying to spend ${formatEther(amount)} ETH`);
        }

        // 2. 获取预期输出并计算滑点保护
        const path = [CONTRACT_CONFIG.WETH_ADDRESS, tokenAddress];
        
        // 调用 getAmountsOut 获取预期输出
        const amounts = (await readContract(config, {
            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
            abi: swapABI,
            functionName: "getAmountsOut",
            args: [amount, path],
        })) as bigint[];
        
        const expectedTokenOut = amounts[1]; // 预期的代币输出量
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const amountOutMin = (expectedTokenOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);
        console.log("预期代币输出:", formatEther(expectedTokenOut));
        console.log("最小代币输出:", formatEther(amountOutMin));

        // 3. 设置交易参数
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期

        // 4. 估算 gas
        let gasLimit;
        try {
            const estimatedGas = await estimateGas(config, {
                to: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
                data: `0x`,
                value: amount,
            });
            gasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("预估 Gas Limit:", gasLimit.toString());
        } catch (e) {
            console.warn("Gas 估算失败:", e);
            gasLimit = undefined;
        }

        // 5. 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : undefined; // +5%

        console.log("Gas Price:", {
            original: gasPrice?.toString(),
            new: newGasPrice?.toString(),
        });

        // 6. 执行 Swap 买入交易
        console.log("发送 swapExactETHForTokens 交易...");

        const swapResult = await writeContract(config, {
            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
            abi: swapABI,
            functionName: "swapExactETHForTokens",
            args: [amountOutMin, path, address, deadline],
            value: amount,
            gas: gasLimit,
            gasPrice: newGasPrice,
            type: "legacy" as const,
        });

        console.log("swapExactETHForTokens 交易已发送:", swapResult);

        return {
            txHash: swapResult,
            receipt: null,
            tokenAmountOut: formatEther(expectedTokenOut), // 预期的代币输出量
            refund: "0",
        };
    };

    // 外盘 Swap 卖出功能
    const handleSwapSell = async (
        tokenAddress: string,
        tokenAmount: string
    ): Promise<SellResult> => {
        console.log("=== Swap 卖出操作 ===");

        if (!isConnected || !address) {
            throw new Error("Please connect wallet first");
        }

        const tokenABI = [
            {
                "constant": true,
                "inputs": [{"name": "_owner", "type": "address"}],
                "name": "balanceOf",
                "outputs": [{"name": "balance", "type": "uint256"}],
                "type": "function"
            },
            {
                "constant": false,
                "inputs": [
                    {"name": "_spender", "type": "address"},
                    {"name": "_value", "type": "uint256"}
                ],
                "name": "approve",
                "outputs": [{"name": "", "type": "bool"}],
                "type": "function"
            },
            {
                "constant": true,
                "inputs": [
                    {"name": "_owner", "type": "address"},
                    {"name": "_spender", "type": "address"}
                ],
                "name": "allowance",
                "outputs": [{"name": "", "type": "uint256"}],
                "type": "function"
            }
        ];

        // 1. 获取代币余额
        console.log("开始获取代币余额...");
        console.log("代币地址:", tokenAddress);
        console.log("用户地址:", address);
        
        let balance: bigint;
        try {
            balance = (await readContract(config, {
                address: tokenAddress as `0x${string}`,
                abi: tokenABI,
                functionName: "balanceOf",
                args: [address],
            })) as bigint;
            
            console.log("成功获取代币余额:", balance.toString());
            console.log("要卖出的数量:", tokenAmount);
            
        } catch (error) {
            console.error("获取代币余额失败:", error);
            throw new Error(`Failed to get token balance: ${error instanceof Error ? error.message : String(error)}`);
        }

        if (balance === BigInt(0)) {
            throw new Error("Insufficient balance");
        }

        const sellAmount = parseEther(tokenAmount);

        if (sellAmount > balance) {
            throw new Error("Insufficient balance");
        }

        // 2. 获取预期输出并计算滑点保护
        const path = [tokenAddress, CONTRACT_CONFIG.WETH_ADDRESS];
        
        // 调用 getAmountsOut 获取预期输出
        const amounts = (await readContract(config, {
            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
            abi: swapABI,
            functionName: "getAmountsOut",
            args: [sellAmount, path],
        })) as bigint[];
        
        const expectedEthOut = amounts[1]; // 预期的 ETH 输出量
        const slippageMultiplier = Math.floor(getSlippageMultiplier() * 100);
        const amountOutMin = (expectedEthOut * BigInt(slippageMultiplier)) / BigInt(100);

        console.log(`使用滑点: ${slippage}%`);
        console.log("预期 ETH 输出:", formatEther(expectedEthOut));
        console.log("最小 ETH 输出:", formatEther(amountOutMin));

        // 3. 设置交易参数
        const deadline = Math.floor(Date.now() / 1000) + 60 * 20; // 20分钟后过期

        // 4. 检查和执行授权
        const allowance = (await readContract(config, {
            address: tokenAddress as `0x${string}`,
            abi: tokenABI,
            functionName: "allowance",
            args: [address, CONTRACT_CONFIG.ROUTER_CONTRACT],
        })) as bigint;

        console.log("当前授权额度:", allowance.toString());

        // 获取 gas price
        const gasPrice = await getGasPrice(config);
        const newGasPrice = gasPrice
            ? gasPrice + (gasPrice * BigInt(5)) / BigInt(100)
            : undefined; // +5%

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
                    data: `0x`,
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
                args: [
                    CONTRACT_CONFIG.ROUTER_CONTRACT,
                    BigInt("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"),
                ],
                gas: approveGasLimit,
                gasPrice: newGasPrice,
                type: "legacy" as const,
            });

            console.log("授权交易已发送:", approveResult);
            approveTxHash = approveResult;
        }

        // 5. 估算 swap 的 gas limit
        let swapGasLimit;
        try {
            const estimatedGas = await estimateGas(config, {
                to: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
                data: `0x`,
            });
            swapGasLimit = (estimatedGas * BigInt(120)) / BigInt(100); // +20% buffer
            console.log("Swap 预估 Gas Limit:", swapGasLimit.toString());
        } catch (e) {
            console.warn("Swap Gas 估算失败:", e);
            swapGasLimit = undefined;
        }

        // 6. 执行 Swap 卖出操作
        console.log("发送 swapExactTokensForETH 交易...");
        console.log("Swap 卖出参数:");
        console.log("Token address:", tokenAddress);
        console.log("Amount:", sellAmount.toString());
        console.log("AmountOutMin:", amountOutMin.toString());

        const swapTxResult = await writeContract(config, {
            address: CONTRACT_CONFIG.ROUTER_CONTRACT as `0x${string}`,
            abi: swapABI,
            functionName: "swapExactTokensForETH",
            args: [sellAmount, amountOutMin, path, address, deadline],
            gas: swapGasLimit,
            gasPrice: newGasPrice,
            type: "legacy" as const,
        });

        console.log("swapExactTokensForETH 交易已发送:", swapTxResult);

        return {
            txHash: swapTxResult,
            receipt: null,
            approveTxHash,
            ethAmountOut: formatEther(expectedEthOut), // 预期的 ETH 输出量
            tokenBalance: sellAmount.toString(),
        };
    };

    return {
        handleBuy,
        handleSell,
        handleSwapBuy,
        handleSwapSell,
        isConnected,
        address,
    };
};

"use client"

import { Image } from "@heroui/react";

export default function Home() {
    return (
        <div className="min-h-screen text-white" style={{ backgroundColor: '#1E1946' }}>
            {/* Main Content */}
            <main className="pt-[24px]">
                <div className="relative w-[375px] mx-auto h-[667px]">
                    <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
                        style={{
                            background: `
                                 radial-gradient(ellipse at center, rgba(30, 25, 70, 0) 40%, rgba(30, 25, 70, 0.6) 80%, #1E1946 100%),
                                 linear-gradient(180deg, rgba(30, 25, 70, 1) 0%, rgba(30, 25, 70, 0) 20%, rgba(30, 25, 70, 0) 70%, rgba(30, 25, 70, 0.8) 85%, #1E1946 100%),
                                 linear-gradient(0deg, rgba(30, 25, 70, 0.7) 0%, rgba(30, 25, 70, 0) 20%, rgba(30, 25, 70, 0) 80%, rgba(30, 25, 70, 0.7) 100%),
                                 linear-gradient(90deg, rgba(30, 25, 70, 0.8) 0%, rgba(30, 25, 70, 0) 15%, rgba(30, 25, 70, 0) 85%, rgba(30, 25, 70, 0.8) 100%),
                                 linear-gradient(270deg, rgba(30, 25, 70, 1) 0%, rgba(30, 25, 70, 0) 15%, rgba(30, 25, 70, 0) 85%, rgba(30, 25, 70, 0.8) 100%)
                             `
                        }}>
                    </div>
                    <div className="absolute top-0 left-0 w-full h-full z-5" style={{ backgroundColor: 'rgba(30, 25, 70, 0.3)' }}></div>
                    <div className="absolute top-[43.5%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                        <Image src="/images/home/boz.png" className="w-[134px] h-auto" disableSkeleton loading="eager" />
                    </div>
                    {/* 四个六角形标签 */}
                    <div className="absolute z-30 animate-float-1 top-[161px] left-[67.5px]">
                        <a href="https://okay.fun/meme/0x9df0c82fb9f50a07b04c6e6d466b432dcd149595" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            <HexagonLabel text="XBOZ" />
                        </a>
                    </div>
                    <div className="absolute z-30 animate-float-2 top-[129px] right-[41.5px]">
                        <a href="https://okay.fun" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            <HexagonLabel text="Okay.fun" />
                        </a>
                    </div>
                    <div className="absolute z-30 animate-float-3 top-[266px] left-[31px]">
                        <a href="https://okay.fun/meme/0x8854b281cdf5940ebd4a753f8d37f49775058e03" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            <HexagonLabel text="模因文化" />
                        </a>
                    </div>
                    <div className="absolute z-30 animate-float-4 top-[290px] right-[45px]">
                        <a href="https://x.com/0xBozwang" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                            <HexagonLabel text="构建者" />
                        </a>
                    </div>
                    <Image src="/images/home/bg.png" className="w-[375px] h-auto relative z-0" disableSkeleton loading="eager" />
                    <div className="absolute w-full text-center text-[20px] text-white z-30 bottom-[115px] font-bold">
                        在 X Layer 打造真正的模因文化
                    </div>
                    <div className="absolute w-full flex justify-center gap-3 z-30 bottom-[55px]">
                        <a href="https://okay.fun" target="_blank" rel="noopener noreferrer">
                            <button
                                className="w-[150px] h-[44px] rounded-[12px] text-[14px] text-[#FFF] cursor-pointer"
                                style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)' }}
                            >
                                体验 Okay.fun
                            </button>
                        </a>
                        <a
                            href="https://twitter.com/intent/tweet?text=我已加入%20https://xboz.fun%20的等待列表，一起建设在%20@okaydotfun%20公平发射的%20$XBOZ%20🕶️%0Ahttps://okay.fun/details/0x9df0c82fb9f50a07b04c6e6d466b432dcd149595"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <button className="w-[150px] h-[44px] rounded-[12px] text-[14px] text-[#0E0E0E] bg-[#FFF] cursor-pointer">
                                加入等待列表
                            </button>
                        </a>
                    </div>
                </div>
                <div className="w-full max-w-[400px] px-[16px] mx-auto mb-[50px]">
                    <div className="rounded-[12px] border border-white/20 bg-white/0">
                        <div className="h-[52px] rounded-[12px] bg-white/5 flex items-center px-4 justify-between">
                            <div className="flex items-center gap-2">
                                <Image src="/images/home/token.png" className="w-[32px] h-[32px]" loading="eager" />
                                <div className="text-[16px] text-[#fff] font-semibold">$XBOZ</div>
                            </div>
                            <a href="https://okoswap.com/?outAddr=0x9df0c82fb9f50a07b04c6e6d466b432dcd149595" target="_blank" rel="noopener noreferrer">
                                <button className="w-[76px] h-[28px] rounded-[18px] bg-[#5D4FDC] text-[12px] text-white cursor-pointer">
                                    立即购买
                                </button>
                            </a>
                        </div>
                        <div className="px-[16px] text-[12px] text-[#FFF] mt-[16px]">
                            $XBOZ 是由 Okay.fun 的 CEO BOZ 在 Okay.fun 发出的实验代币。因 BOZ 被社区绑架，现由其本人发起 CTO。
                        </div>
                        <div className="px-[16px] text-[12px] text-[#FFF] mt-[8px]">“真正的 Meme 是流行文化而不是 PVP 游戏。”</div>
                        <div className="px-[16px] text-[10px] text-[#FFF] mt-[12px] mb-[16px] text-right">—— Boz @0xBozwang</div>
                    </div>
                </div>
            </main>

        </div>
    );
}

// 自适应宽度的六角形标签组件
const HexagonLabel = ({ text }: { text: string }) => {
    const cornerSize = 8; // 六角形角的大小
    const minWidth = 50; // 最小宽度
    // 中文字符宽度大约是英文的1.5倍
    const isChinese = /[\u4e00-\u9fa5]/.test(text);
    const padding = isChinese ? 20 : 18; // 中文用更大的内边距
    const charWidth = isChinese ? 12 : 6; // 英文字符更窄
    const textWidth = text.length * charWidth; // 估算文字宽度
    const totalWidth = Math.max(minWidth, textWidth + padding * 2);
    const height = 32;

    return (
        <div className="relative" style={{ width: totalWidth, height }}>
            {/* 六角形背景 + 模糊效果 */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'rgba(169, 123, 255, 0.15)',
                    backdropFilter: 'blur(6px)',
                    clipPath: `polygon(${cornerSize}px 0%, calc(100% - ${cornerSize}px) 0%, 100% 50%, calc(100% - ${cornerSize}px) 100%, ${cornerSize}px 100%, 0% 50%)`
                }}
            />

            {/* 四角装饰 - SVG样式 */}
            <svg className="absolute inset-0" xmlns="http://www.w3.org/2000/svg" width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`} fill="none">
                {/* 右下角 */}
                <path d={`M${totalWidth - 8} ${height}H${totalWidth - 16}V${height - 2}H${totalWidth - 9.2363}L${totalWidth - 6.7363} ${height - 7}H${totalWidth - 4.5}L${totalWidth - 8} ${height}Z`} fill="#CEA9FF" />
                {/* 左下角 */}
                <path d={`M9.23633 ${height - 2}H16V${height}H8L4.5 ${height - 7}H6.73633L9.23633 ${height - 2}Z`} fill="#CEA9FF" />
                {/* 右上角 */}
                <path d={`M${totalWidth - 4.5} 7H${totalWidth - 6.7363}L${totalWidth - 9.2363} 2H${totalWidth - 16}V0H${totalWidth - 8}L${totalWidth - 4.5} 7Z`} fill="#CEA9FF" />
                {/* 左上角 */}
                <path d="M16 2H9.23633L6.73633 7H4.5L8 0H16V2Z" fill="#CEA9FF" />
            </svg>

            {/* 文字 */}
            <div className="absolute inset-0 flex items-center justify-center text-white font-bold" style={{ fontSize: '13px' }}>
                {text}
            </div>
        </div>
    );
};


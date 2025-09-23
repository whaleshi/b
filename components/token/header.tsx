"use client"
import { Image, Link, useDisclosure, Button } from "@heroui/react";
import ResponsiveDialog from "@/components/modal";
import useClipboard from '@/hooks/useClipboard';

export default function TokenHeader({ data }: any) {
	const { isOpen, onOpen, onOpenChange } = useDisclosure();
	const { copy } = useClipboard();
	return (
		<>
			<div className="h-[48px] flex items-center justify-between w-full relative mb-[20px]">
				<Link href="/" className="w-[40px] h-[40px] rounded-[12px] bg-[#29254F] flex items-center justify-center">
					<Image src="/images/common/back.png" className="w-[15px] h-auto cursor-pointer rounded-[0px]" disableSkeleton loading="eager" />
				</Link>
				<div className="w-[40px] h-[40px] rounded-[12px] bg-[#29254F] flex items-center justify-center cursor-pointer" onClick={onOpen}>
					<Image src="/images/common/share.png" className="w-[calc(47px/3)] h-auto cursor-pointer rounded-[0px]" disableSkeleton loading="eager" />
				</div>
			</div>
			<ResponsiveDialog
				isOpen={isOpen}
				onOpenChange={onOpenChange}
				title='分享代币'
				maxVH={70}
				size="md"
				classNames={{ body: "text-[#fff]" }}
			>
				<div className="flex flex-col items-center pt-[0px]">
					<Image
						src={data?.image || "/images/common/default.png"}
						alt='tokenAvatar'
						className="w-[60px] h-[60px] rounded-full object-cover"
						width={60}
						height={60}
						disableSkeleton
					/>
					<div className="text-[20px] text-[#FFF] mt-[14px] font-bold">${data?.symbol}</div>
					<div className="text-[16px] text-[#808C92] mt-[8px]">{data?.name}</div>
					<Button
						fullWidth
						className="text-[14px] rounded-[12px] text-[#fff] bg-[#29254F] h-[48px] mt-[22px]"
						onPress={() => {
							copy(`https://bgbs.fun/token/${data?.address}`);
						}}
					>
						复制链接
					</Button>
					<Button
						fullWidth
						className="text-[14px] rounded-[12px] bg-[#fff] text-[#101010] h-[48px] my-[12px]"
						onPress={() => {
							const text = `https://xboz.fun/token/${data?.address}`
							const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
							window.open(url, "_blank");
						}}
					>
						分享到 X
					</Button>
				</div>
			</ResponsiveDialog>
		</>
	)
}
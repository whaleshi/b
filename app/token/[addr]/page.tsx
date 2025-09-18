import TokenAbout from '@/components/token/about';
import TokenTrade from '@/components/token/trade';
import TokenHeader from '@/components/token/header';
interface PageProps {
	params: Promise<{ addr: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

// TODO: 后续接入：根据 addr 请求链上/后端接口获取 Token 基本信息与统计数据
async function fetchTokenData(addr: string) {
	// 占位：返回 mock 数据
	return {
		address: addr,
		name: 'DODO',
		symbol: 'Dodoooooo',
		description: 'Solana is a highly functional open source project that banks on blockchain technology\'s',
		image: '/images/common/default.png',
		createdAt: Date.now(),
		totalSupply: 2358000,
		distributionProgress: 38.5,
		distributionRemaining: 1000000,
		raised: 240,
		currency: 'OKB',
		creator: '@Bozwang',
		beneficiary: '@Bozwang',
		participants: 1234,
	};
}

export async function generateMetadata({ params }: { params: Promise<{ addr: string }> }) {
	const { addr } = await params;
	const data = await fetchTokenData(addr);
	return {
		title: {
			absolute: `${data.name} (${data.symbol})`
		},
		description: data.description,
		openGraph: {
			title: `${data.name} (${data.symbol})`,
			description: data.description,
			images: [data.image],
		},
	};
}

export default async function TokenDetailPage({ params }: PageProps) {
	const { addr } = await params;
	const data = await fetchTokenData(addr);

	return <div className="w-full max-w-[450px] h-full pt-[56px] px-[16px]">
		{/* Header */}
		<TokenHeader data={data} />
		<div className="min-h-[calc(100vh-124px)] flex flex-col">
			<div>
				<TokenAbout data={data} />
			</div>
			<div className='min-h-[100px]'></div>
			<TokenTrade data={data} />
		</div>;
	</div>
}

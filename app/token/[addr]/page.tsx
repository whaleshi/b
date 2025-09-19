import TokenDetailClient from './TokenDetailClient';
interface PageProps {
	params: Promise<{ addr: string }>;
	searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function TokenDetailPage({ params }: PageProps) {
	const { addr } = await params;

	return <TokenDetailClient address={addr} />;
}

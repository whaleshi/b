export default function TokenLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<section className="flex flex-col items-center min-h-[100vh]">
			{children}
		</section>
	);
}
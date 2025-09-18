import React, { useState } from "react";
import { useRouter } from "next/navigation";
import CreateForm from "./form";
import { Image, Link } from "@heroui/react";
const Create = () => {
	const router = useRouter();

	return (
		<div className="w-full max-w-[450px] px-[16px]">
			<div className="flex items-center justify-between relative pt-[56px]">
				<Link href="/" className="w-[40px] h-[40px] rounded-[12px] bg-[#29254F] flex items-center justify-center">
					<Image src="/images/common/back.png" className="w-[15px] h-auto cursor-pointer rounded-[0px]" disableSkeleton loading="eager" />
				</Link>
			</div>
			<CreateForm />
		</div>
	);
};

export default Create;

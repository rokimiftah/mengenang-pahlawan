// src/components/home/Home.tsx

import { useEffect, useMemo, useState } from "react";

import { useLocation } from "wouter";

import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import { IconChevronDown } from "@tabler/icons-react";

import "./Home.css";

function FaqItem({
	value,
	question,
	answer,
}: {
	value: string;
	question: string;
	answer: string;
}) {
	return (
		<Accordion.Item
			value={value}
			className="group flex min-h-0 flex-col data-[state=closed]:h-14 data-[state=open]:flex-1"
		>
			<Accordion.Header asChild>
				<Accordion.Trigger
					className="flex h-14 cursor-pointer items-center justify-between gap-4 px-5 text-left text-gray-900 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
					aria-label={question}
				>
					<span className="line-clamp-1 pr-6 text-base font-medium md:text-lg">
						{question}
					</span>
					<IconChevronDown
						size={20}
						className="shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
					/>
				</Accordion.Trigger>
			</Accordion.Header>

			<Accordion.Content className="px-5 pt-0 pb-5">
				<div className="relative rounded-xl bg-[#ECEEDF] p-4 ring-1 ring-gray-200">
					<p className="line-clamp-4 text-sm leading-relaxed text-gray-700">
						{answer}
					</p>

					<div className="mt-3">
						<Dialog.Root>
							<Dialog.Portal>
								<Dialog.Overlay className="data-[state=open]:animate-fade-in fixed inset-0 bg-black/40" />
								<Dialog.Content className="data-[state=open]:animate-zoom-in fixed top-1/2 left-1/2 z-50 w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
									<Dialog.Title className="mb-2 text-lg font-semibold text-black">
										{question}
									</Dialog.Title>
									<div className="max-h-[70vh] overflow-auto pr-1 text-sm leading-relaxed text-gray-800">
										{answer}
									</div>
									<div className="mt-4 flex justify-end">
										<Dialog.Close asChild>
											<button className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-[#C70039] focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500">
												Tutup
											</button>
										</Dialog.Close>
									</div>
								</Dialog.Content>
							</Dialog.Portal>
						</Dialog.Root>
					</div>
				</div>
			</Accordion.Content>
		</Accordion.Item>
	);
}

export const Home = () => {
	const [_location, navigate] = useLocation();
	const [isLoading, setIsLoading] = useState(false);

	const goToDashboard = () => {
		if (document.startViewTransition) {
			document.startViewTransition(() => {
				navigate("/dashboard");
			});
		} else {
			navigate("/dashboard");
		}
	};

	useEffect(() => {
		setIsLoading(false);
	}, []);

	const VIDEO_URL = useMemo(
		() => "https://cdn.mengenangpahlawan.web.id/veteran.mp4",
		[],
	);

	const faqs = useMemo(
		() => [
			{
				id: "ai-heavy",
				q: "Apakah situs ini menggunakan AI secara intensif?",
				a: "Ya. Banyak fitur—seperti ringkasan, kuis, dan saran—menggunakan model AI. Harap gunakan dengan bijak dan selalu verifikasi hal penting.",
			},
			{
				id: "sources",
				q: "Dari mana sumber konten diambil?",
				a: "Konten dirangkum dari sumber kredibel (misalnya arsip nasional, buku sejarah, laman pemerintah, dan institusi pendidikan). Saat tersedia, kami tampilkan rujukan/sitasi pada halaman detail tokoh.",
			},
			{
				id: "accuracy",
				q: "Seberapa akurat hasil AI?",
				a: "AI bisa keliru atau menyederhanakan konteks. Untuk informasi krusial (tanggal, gelar, kutipan), periksa kembali sumber aslinya.",
			},
			{
				id: "privacy",
				q: "Bagaimana dengan data dan privasi saya?",
				a: "Kami hanya memproses data yang diperlukan untuk autentikasi, penyimpanan progres/kuis, dan peningkatan pengalaman. Jangan masukkan data sensitif ke kolom chat.",
			},
			{
				id: "feedback",
				q: "Bagaimana melaporkan kesalahan atau mengusulkan perbaikan?",
				a: "Gunakan tombol umpan balik/Hubungi kami di footer atau kirimkan issue melalui repositori proyek (jika open source). Sertakan tautan halaman dan tangkapan layar bila memungkinkan.",
			},
			{
				id: "quiz-points",
				q: "Bagaimana sistem kuis dan poin bekerja?",
				a: "Pertanyaan dihasilkan berdasarkan konten slide tokoh yang kamu lihat. Jawaban benar menambah poin; riwayat poin dapat dilihat melalui menu profil.",
			},
			{
				id: "contribute",
				q: "Bisakah saya menambah tokoh/menyunting informasi?",
				a: "Ya, kamu dapat mengusulkan tokoh atau koreksi. Kami akan kurasi dan memverifikasi sebelum diterbitkan.",
			},
			{
				id: "license",
				q: "Bagaimana lisensi media dan atribusi?",
				a: "Beberapa gambar/ilustrasi mungkin memiliki lisensi tertentu. Saat tersedia, atribusi ditampilkan. Mohon jangan gunakan ulang tanpa memeriksa lisensinya.",
			},
		],
		[],
	);

	return (
		<>
			<div className="flex h-dvh flex-col overflow-hidden bg-[#111110]">
				<div className="mx-auto w-full max-w-screen-2xl flex-shrink-0">
					<header className="flex items-center justify-between px-4 py-4 md:px-8 md:py-8">
						<a
							href="/"
							className="inline-flex items-center gap-2.5 text-2xl font-bold text-black md:text-3xl"
							aria-label="logo"
						>
							<svg
								viewBox="0 0 266.66666 266.66666"
								className="h-12 w-12 text-indigo-500"
								fill="currentColor"
								xmlns="http://www.w3.org/2000/svg"
							>
								<defs>
									<clipPath
										clipPathUnits="userSpaceOnUse"
										id="clipPath3"
									>
										<path
											d="M 0,200 H 200 V 0 H 0 Z"
											transform="translate(-75.999999,-132.75)"
											id="path3"
										/>
									</clipPath>
									<clipPath
										clipPathUnits="userSpaceOnUse"
										id="clipPath5"
									>
										<path
											d="M 0,200 H 200 V 0 H 0 Z"
											transform="translate(-82,-97.556205)"
											id="path5"
										/>
									</clipPath>
									<clipPath
										clipPathUnits="userSpaceOnUse"
										id="clipPath7"
									>
										<path
											d="M 0,200 H 200 V 0 H 0 Z"
											transform="translate(-144.25,-83.000002)"
											id="path7"
										/>
									</clipPath>
									<clipPath
										clipPathUnits="userSpaceOnUse"
										id="clipPath9"
									>
										<path
											d="M 0,200 H 200 V 0 H 0 Z"
											transform="translate(-130,-83.000002)"
											id="path9"
										/>
									</clipPath>
								</defs>
								<g id="layer-MC0">
									<path
										id="path1"
										d="M 0,0 H 200 V 200 H 0 Z"
										style={{
											fill: "#ed1c24",
											fillOpacity: 1,
											fillRule: "nonzero",
											stroke: "none",
										}}
										transform="matrix(1.3333333,0,0,-1.3333333,0,266.66667)"
									/>
									<path
										id="path2"
										d="m 0,0 c -8.685,0 -15.75,-7.065 -15.75,-15.75 0,-6.56 4.034,-12.191 9.75,-14.556 v 14.556 c 0,3.314 2.686,6 6,6 3.314,0 6,-2.686 6,-6 v -14.556 c 5.716,2.365 9.75,7.996 9.75,14.556 C 15.75,-7.065 8.685,0 0,0"
										style={{
											fill: "#ffffff",
											fillOpacity: 1,
											fillRule: "nonzero",
											stroke: "none",
										}}
										transform="matrix(1.3333333,0,0,-1.3333333,101.33333,89.666667)"
										clipPath="url(#clipPath3)"
									/>
									<path
										id="path4"
										d="m 0,0 v -14.556 c 0,-3.314 -2.686,-6 -6,-6 -3.314,0 -6,2.686 -6,6 V 0 c -5.716,-2.365 -9.75,-7.996 -9.75,-14.556 0,-8.685 7.065,-15.75 15.75,-15.75 8.685,0 15.75,7.065 15.75,15.75 C 9.75,-7.996 5.716,-2.365 0,0"
										style={{
											fill: "#ffffff",
											fillOpacity: 1,
											fillRule: "nonzero",
											stroke: "none",
										}}
										transform="matrix(1.3333333,0,0,-1.3333333,109.33333,136.59173)"
										clipPath="url(#clipPath5)"
									/>
									<path
										id="path6"
										d="m 0,0 c 0,-11.166 -9.084,-20.25 -20.25,-20.25 -11.166,0 -20.25,9.084 -20.25,20.25 v 34 c 0,11.166 9.084,20.25 20.25,20.25 C -9.084,54.25 0,45.166 0,34 Z m -48,0 c 0,-11.166 -9.084,-20.25 -20.25,-20.25 -11.166,0 -20.25,9.084 -20.25,20.25 0,7.125 3.708,13.39 9.286,17 -5.578,3.61 -9.286,9.875 -9.286,17 0,11.166 9.084,20.25 20.25,20.25 C -57.084,54.25 -48,45.166 -48,34 -48,26.875 -51.708,20.61 -57.286,17 -51.708,13.39 -48,7.125 -48,0 m 27.75,63 c -9.981,0 -18.783,-5.043 -24,-12.719 -5.217,7.676 -14.019,12.719 -24,12.719 -16.016,0 -29,-12.984 -29,-29 0,-6.352 2.048,-12.223 5.512,-17 -3.464,-4.777 -5.512,-10.648 -5.512,-17 0,-16.016 12.984,-29 29,-29 9.981,0 18.783,5.043 24,12.719 5.217,-7.676 14.019,-12.719 24,-12.719 16.016,0 29,12.984 29,29 v 34 c 0,16.016 -12.984,29 -29,29"
										style={{
											fill: "#ffffff",
											fillOpacity: 1,
											fillRule: "nonzero",
											stroke: "none",
										}}
										transform="matrix(1.3333333,0,0,-1.3333333,192.33333,156)"
										clipPath="url(#clipPath7)"
									/>
									<path
										id="path8"
										d="m 0,0 c 0,-3.314 -2.686,-6 -6,-6 -3.314,0 -6,2.686 -6,6 v 34 c 0,3.314 2.686,6 6,6 3.314,0 6,-2.686 6,-6 z m -6,49.75 c -8.685,0 -15.75,-7.065 -15.75,-15.75 V 0 c 0,-8.685 7.065,-15.75 15.75,-15.75 8.685,0 15.75,7.065 15.75,15.75 V 34 C 9.75,42.685 2.685,49.75 -6,49.75"
										style={{
											fill: "#ffffff",
											fillOpacity: 1,
											fillRule: "nonzero",
											stroke: "none",
										}}
										transform="matrix(1.3333333,0,0,-1.3333333,173.33333,156)"
										clipPath="url(#clipPath9)"
									/>
								</g>
							</svg>
						</a>

						<button
							className="mt-4 mb-4 inline-flex h-10 w-28 cursor-pointer items-center justify-center rounded-xl bg-red-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[#C70039] active:bg-[#900020] disabled:cursor-not-allowed disabled:bg-[#900020] sm:h-12 sm:w-32 sm:text-base md:text-lg"
							onClick={goToDashboard}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ")
									goToDashboard();
							}}
							disabled={isLoading}
						>
							<div className="flex h-4 w-4 items-center justify-center sm:h-5 sm:w-5">
								{isLoading ? (
									<svg
										className="h-4 w-4 animate-spin text-[#111110] sm:h-5 sm:w-5"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 24 24"
									>
										<circle
											className="opacity-25"
											cx="12"
											cy="12"
											r="10"
											stroke="currentColor"
											strokeWidth="4"
										></circle>
										<path
											className="opacity-75"
											fill="currentColor"
											d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
										></path>
									</svg>
								) : (
									<span className="text-center text-sm leading-4 font-semibold sm:text-base sm:leading-5">
										Mulai
									</span>
								)}
							</div>
						</button>
					</header>
				</div>

				<section className="relative mx-4 mb-4 flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg bg-gray-100 shadow-lg md:mx-8 md:mb-8">
					<img
						src="/bendera.avif"
						loading="lazy"
						alt="Pahlawan Nasional"
						className="absolute inset-0 h-full w-full object-cover lg:object-[50%_85%] xl:object-[50%_85%]"
					/>
					<div className="relative z-10 flex flex-col items-center p-4 sm:max-w-xl">
						<h1 className="mb-6 text-center text-4xl font-bold text-white mix-blend-overlay drop-shadow-[0_3px_12px_rgba(0,0,0,0.45)] sm:text-6xl md:mb-8 md:text-7xl lg:text-8xl xl:text-9xl">
							MENGENANG PAHLAWAN
						</h1>
					</div>
				</section>
			</div>

			<div className="flex h-dvh flex-col overflow-hidden bg-[#111110]">
				<section className="relative m-4 flex h-full flex-1 flex-col overflow-hidden rounded-lg bg-[#ECEEDF] shadow-lg md:m-8">
					<div className="relative z-10 flex h-full w-full flex-col p-4 md:p-8">
						<div className="grid h-full grid-cols-1 gap-6 md:grid-cols-2">
							<div className="flex h-full flex-col">
								<div className="relative aspect-video w-full flex-1 overflow-hidden rounded-2xl bg-black shadow-lg">
									<iframe
										className="absolute top-0 left-0 h-full w-full"
										src={VIDEO_URL}
										title="Pengantar Mengenang Pahlawan"
										loading="lazy"
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
										referrerPolicy="strict-origin-when-cross-origin"
										allowFullScreen
									/>
								</div>
							</div>

							<div className="flex h-full flex-col">
								<Accordion.Root
									type="single"
									defaultValue="ai-heavy"
									collapsible
									className="flex w-full flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-sm"
								>
									{faqs.map((item) => (
										<FaqItem
											key={item.id}
											value={item.id}
											question={item.q}
											answer={item.a}
										/>
									))}
								</Accordion.Root>
							</div>
						</div>
					</div>
				</section>
			</div>
		</>
	);
};

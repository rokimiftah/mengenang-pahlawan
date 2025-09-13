// src/components/auth/templates/VerificationEmail.tsx

import { Body, Container, Head, Heading, Html, Section, Text } from "@react-email/components";

interface VerificationCodeEmailProps {
	code: string;
	expires: Date;
	minutesUntilExpiry: number;
}

export function VerificationEmail({ code, minutesUntilExpiry }: VerificationCodeEmailProps) {
	return (
		<Html>
			<Head />
			<Body style={main}>
				<Container style={container}>
					<Section style={contentSection}>
						<Heading style={h1}>Verifikasi Alamat Email</Heading>
						<Text style={mainText}>
							Terima kasih telah memulai pembuatan akun. Kami ingin memastikan itu benar-benar Anda. Harap masukkan kode
							verifikasi berikut.
						</Text>
						<Section style={verificationSection}>
							<Text style={verifyText}>Kode Verifikasi</Text>
							<Text style={codeText}>{code}</Text>
							<Text style={validityText}>Kode ini akan kedaluwarsa dalam {minutesUntilExpiry} menit.</Text>
						</Section>
						<Text style={smallText}>Jika Anda tidak meminta kode, abaikan email ini.</Text>
					</Section>
				</Container>
			</Body>
		</Html>
	);
}

const main = {
	backgroundColor: "#f4f7fa",
	fontFamily:
		"'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Helvetica Neue', sans-serif",
	color: "#1a202c",
	textAlign: "center" as const,
};

const container = {
	maxWidth: "600px",
	width: "100%",
	margin: "0 auto",
	backgroundColor: "#ffffff",
	borderRadius: "8px",
	overflow: "hidden",
	boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
	textAlign: "center" as const,
};

const contentSection = {
	padding: "40px 30px",
	backgroundColor: "#ffffff",
	textAlign: "center" as const,
};

const h1 = {
	color: "#1a202c",
	fontSize: "24px",
	fontWeight: 600,
	margin: "0 0 20px",
	textAlign: "center" as const,
};

const mainText = {
	color: "#4a5568",
	fontSize: "16px",
	lineHeight: "24px",
	margin: "0 0 20px",
	textAlign: "center" as const,
};

const verificationSection = {
	backgroundColor: "#f7fafc",
	borderRadius: "8px",
	padding: "20px",
	margin: "20px 0",
	textAlign: "center" as const,
};

const verifyText = {
	color: "#2d3748",
	fontSize: "14px",
	fontWeight: 600,
	margin: "0 0 10px",
	textAlign: "center" as const,
};

const codeText = {
	color: "#4a90e2",
	fontSize: "32px",
	fontWeight: 700,
	letterSpacing: "4px",
	margin: "10px 0",
	textAlign: "center" as const,
};

const validityText = {
	color: "#718096",
	fontSize: "14px",
	margin: "0",
	textAlign: "center" as const,
};

const smallText = {
	color: "#718096",
	fontSize: "14px",
	lineHeight: "18px",
	margin: "8px 0 0",
	textAlign: "center" as const,
};

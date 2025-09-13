// src/features/auth/ui/ErrorModalAuth.tsx

import { useEffect } from "react";

import { Alert, Modal } from "@mantine/core";

interface ErrorModalProps {
	error: string | null;
	onClose: () => void;
}

export const ErrorModalAuth = ({ error, onClose }: ErrorModalProps) => {
	useEffect(() => {
		if (error) {
			const timer = setTimeout(onClose, 7000);
			return () => clearTimeout(timer);
		}
	}, [error, onClose]);

	return (
		<Modal
			opened={!!error}
			onClose={onClose}
			withCloseButton={false}
			withOverlay={false}
			centered={false}
			trapFocus={false}
			lockScroll={false}
			closeOnClickOutside
			zIndex={1000}
			size="auto"
			styles={{
				inner: {
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-start",
					paddingTop: "max(16px, env(safe-area-inset-top))",
					paddingRight: "max(12px, env(safe-area-inset-right))",
					paddingBottom: 12,
					paddingLeft: 12,
					pointerEvents: "none",
				},
				content: {
					margin: "0 auto",
					pointerEvents: "all",
					borderRadius: 12,
					width: "auto",
					maxWidth: "min(92vw, 420px)",
					boxShadow: "0 10px 25px rgba(0,0,0,0.2), 0 4px 10px rgba(0,0,0,0.12)",
				},
				body: { padding: 0 },
			}}
			transitionProps={{
				transition: "slide-down",
				duration: 160,
				timingFunction: "ease-out",
			}}
		>
			<Alert
				role="alert"
				aria-live="assertive"
				color="red"
				variant="filled"
				radius="md"
				styles={{
					root: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						paddingTop: 8,
						paddingRight: 16,
						paddingBottom: 8,
						paddingLeft: 16,
					},
					icon: { marginTop: 6, marginBottom: 4 },
					message: {
						marginTop: 6,
						marginBottom: 6,
						fontSize: 14,
						lineHeight: 1.45,
						wordBreak: "break-word",
					},
				}}
			>
				{error}
			</Alert>
		</Modal>
	);
};

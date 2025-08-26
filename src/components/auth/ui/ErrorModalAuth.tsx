// src/components/auth/ui/ErrorModalAuth.tsx

import { useEffect } from "react";

import { Alert, Modal } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";

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
			size="auto"
			styles={{
				inner: {
					display: "flex",
					justifyContent: "center",
					alignItems: "flex-start",
					padding: 16,
					pointerEvents: "none",
				},
				content: { margin: 0, pointerEvents: "all" },
			}}
			transitionProps={{ transition: "slide-down", duration: 150 }}
		>
			<Alert
				icon={<IconAlertTriangle size={20} />}
				color="red"
				variant="filled"
				radius="md"
				styles={{
					root: {
						display: "flex",
						flexDirection: "column",
						alignItems: "center",
						textAlign: "center",
						paddingTop: 2,
						paddingRight: 20,
						paddingBottom: 2,
						paddingLeft: 20,
					},
					icon: { marginTop: 13, marginBottom: 10 },
					message: { marginTop: 10, marginBottom: 10, fontSize: 16 },
				}}
			>
				{error}
			</Alert>
		</Modal>
	);
};

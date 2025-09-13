import { Authenticated } from "convex/react";
import { Redirect } from "wouter";

import { AuthenticationForm } from "@features/auth";

export default function VerifyEmailPage() {
	const search = typeof window !== "undefined" ? window.location.search : "";
	const params = new URLSearchParams(search);
	const email = params.get("email") || undefined;
	return (
		<>
			<Authenticated>
				<Redirect to="/pahlawan" />
			</Authenticated>
			<AuthenticationForm initialType="verify" initialEmail={email} />
		</>
	);
}

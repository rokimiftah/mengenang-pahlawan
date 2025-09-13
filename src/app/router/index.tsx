import { Authenticated, Unauthenticated } from "convex/react";
import { Redirect, Route, Switch } from "wouter";

import ForgotPasswordPage from "@pages/Auth/ForgotPasswordPage";
import LoginPage from "@pages/Auth/LoginPage";
import RegisterPage from "@pages/Auth/RegisterPage";
import ResetPasswordPage from "@pages/Auth/ResetPasswordPage";
import VerifyEmailPage from "@pages/Auth/VerifyEmailPage";
import DashboardPage from "@pages/DashboardPage";
import HeroDetailPage from "@pages/HeroDetailPage";
import HomePage from "@pages/HomePage";

export function AppRoutes() {
	return (
		<Switch>
			<Route path="/" component={HomePage} />
			<Route path="/login">
				{() => (
					<>
						<Authenticated>
							<Redirect to="/pahlawan" />
						</Authenticated>
						<Unauthenticated>
							<LoginPage />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/register">
				{() => (
					<>
						<Authenticated>
							<Redirect to="/pahlawan" />
						</Authenticated>
						<Unauthenticated>
							<RegisterPage />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/forgot-password">
				{() => (
					<>
						<Authenticated>
							<Redirect to="/pahlawan" />
						</Authenticated>
						<Unauthenticated>
							<ForgotPasswordPage />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/reset-password">
				{() => (
					<>
						<Authenticated>
							<Redirect to="/pahlawan" />
						</Authenticated>
						<Unauthenticated>
							<ResetPasswordPage />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/verify-email">
				{() => (
					<>
						<Authenticated>
							<Redirect to="/pahlawan" />
						</Authenticated>
						<Unauthenticated>
							<VerifyEmailPage />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/pahlawan">
				{() => (
					<>
						<Authenticated>
							<DashboardPage />
						</Authenticated>
						<Unauthenticated>
							<Redirect to="/login" />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route path="/pahlawan/:slug">
				{() => (
					<>
						<Authenticated>
							<HeroDetailPage />
						</Authenticated>
						<Unauthenticated>
							<Redirect to="/login" />
						</Unauthenticated>
					</>
				)}
			</Route>
			<Route>
				<Redirect to="/" />
			</Route>
		</Switch>
	);
}

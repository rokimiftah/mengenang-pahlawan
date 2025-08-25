// src/index.tsx

import React from "react";
import ReactDOM from "react-dom/client";

import { ConvexReactClient } from "convex/react";
import { Redirect, Route, Router, Switch } from "wouter";

import { DashboardHero, DashboardHome } from "@components/dashboard";
import { Home } from "@components/home";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { MantineProvider } from "@mantine/core";

import "./index.css";

const convex = new ConvexReactClient(import.meta.env.PUBLIC_CONVEX_URL, {
	logger: false,
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
	<React.StrictMode>
		<MantineProvider forceColorScheme="dark">
			<ConvexAuthProvider client={convex}>
				<Router base="/">
					<Switch>
						<Route path="/" component={Home} />
						<Route path="/pahlawan" component={DashboardHome} />
						<Route path="/pahlawan/:slug" component={DashboardHero} />
						<Route>
							<Redirect to="/" />
						</Route>
					</Switch>
				</Router>
			</ConvexAuthProvider>
		</MantineProvider>
	</React.StrictMode>,
);

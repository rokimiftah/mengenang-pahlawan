import { Redirect, Route, Switch } from "wouter";

import DashboardPage from "@pages/DashboardPage";
import HeroDetailPage from "@pages/HeroDetailPage";
import HomePage from "@pages/HomePage";

export function AppRoutes() {
	return (
		<Switch>
			<Route path="/" component={HomePage} />
			<Route path="/pahlawan" component={DashboardPage} />
			<Route path="/pahlawan/:slug" component={HeroDetailPage} />
			<Route>
				<Redirect to="/" />
			</Route>
		</Switch>
	);
}

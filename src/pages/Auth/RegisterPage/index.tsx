import { Authenticated } from "convex/react";
import { Redirect } from "wouter";

import { AuthenticationForm } from "@features/auth";

export default function RegisterPage() {
  return (
    <>
      <Authenticated>
        <Redirect to="/pahlawan" />
      </Authenticated>
      <AuthenticationForm initialType="signUp" />
    </>
  );
}

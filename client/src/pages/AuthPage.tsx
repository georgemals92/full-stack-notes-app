import { LoginForm } from "@/components/features/auth/LoginForm";
import { SignupForm } from "@/components/features/auth/SignupForm";

function AuthPage({ mode = "login" as "login" | "register" }) {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        {mode === "login" && <LoginForm />}
        {mode === "register" && <SignupForm />}
      </div>
    </div>
  );
}

export default AuthPage;

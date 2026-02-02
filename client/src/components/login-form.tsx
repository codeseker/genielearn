import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import useGoogleAuth from "@/hooks/auth/useGoogleAuth";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type LoginSchema = z.infer<typeof loginSchema>;

type LoginFormProps = {
  onSubmit: (data: LoginSchema) => any;
};

export function LoginForm({ onSubmit }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const { mutateAsync: googleAuth } = useGoogleAuth();

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      await googleAuth(tokenResponse.code);
    },
    flow: "auth-code",
  });

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            to="/register"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Sign up
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-1">
          <Input
            type="email"
            placeholder="Email"
            className="bg-input text-foreground placeholder:text-muted-foreground"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Password</span>
            <Link
              to="/forgot-password"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            type="password"
            placeholder="Password"
            className="bg-input text-foreground placeholder:text-muted-foreground"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Login Button */}
        <Button type="submit" className="w-full">
          Login
        </Button>

        {/* Divider */}
        <div className="relative text-center text-sm">
          <span className="bg-background px-2 text-muted-foreground relative z-10">
            Or continue with
          </span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
        </div>

        {/* Google Login */}
        <Button
          variant="outline"
          type="button"
          className="w-full cursor-pointer"
          onClick={() => handleGoogleLogin()}
        >
          Continue with Google
        </Button>
      </form>
    </div>
  );
}

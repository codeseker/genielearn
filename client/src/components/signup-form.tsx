import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { useRegister } from "@/hooks/auth/useRegister";
import useGoogleAuth from "@/hooks/auth/useGoogleAuth";
import { useGoogleLogin } from "@react-oauth/google";

const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    username: z.string().min(1, "Username is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match",
  });

export type RegisterSchema = z.infer<typeof registerSchema>;

export function SignupForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const { handleRegister, loading } = useRegister();

  const onSubmit = async (data: RegisterSchema) => {
    await handleRegister(data);
  };

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
          Create your account
        </h1>
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            className="underline underline-offset-4 hover:text-foreground"
          >
            Sign in
          </Link>
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Username */}
        <div className="space-y-1">
          <Input
            placeholder="Username"
            className="bg-input text-foreground placeholder:text-muted-foreground"
            {...register("username")}
          />
          {errors.username && (
            <p className="text-xs text-destructive">
              {errors.username.message}
            </p>
          )}
        </div>

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

        {/* First + Last Name */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Input
              placeholder="First name"
              className="bg-input text-foreground placeholder:text-muted-foreground"
              {...register("first_name")}
            />
            {errors.first_name && (
              <p className="text-xs text-destructive">
                {errors.first_name.message}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <Input
              placeholder="Last name"
              className="bg-input text-foreground placeholder:text-muted-foreground"
              {...register("last_name")}
            />
            {errors.last_name && (
              <p className="text-xs text-destructive">
                {errors.last_name.message}
              </p>
            )}
          </div>
        </div>

        {/* Password + Confirm */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
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
          <div className="space-y-1">
            <Input
              type="password"
              placeholder="Confirm password"
              className="bg-input text-foreground placeholder:text-muted-foreground"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-xs text-destructive">
                {errors.confirm_password.message}
              </p>
            )}
          </div>
        </div>

        {/* Register Button */}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account..." : "Create Account"}
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

        {/* Google Button */}
        <Button
          variant="outline"
          type="button"
          className="w-full cursor-pointer"
          onClick={() => handleGoogleLogin()}
        >
          Continue with Google
        </Button>

        {/* Terms */}
        <p className="text-xs text-muted-foreground text-center">
          By continuing, you agree to our{" "}
          <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
            Terms
          </span>{" "}
          and{" "}
          <span className="underline underline-offset-4 cursor-pointer hover:text-foreground">
            Privacy Policy
          </span>
          .
        </p>
      </form>
    </div>
  );
}

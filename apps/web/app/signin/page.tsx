"use client"
import { Eye, EyeOff, Workflow } from "lucide-react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { register } from "../../lib/actions/api"

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isRegister, setIsRegister] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setname] = useState("")
  const nav = useRouter();
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleLogin = async () => {
    console.log("Google login clicked");
    await signIn("google", { callbackUrl: "/" });
  }
  const handleRegister = async () => {
    let type;
    if (isRegister) type = "SIGNUP"
    else type = "SIGNIN"
    if (email && password) {
      let response;
      if (type === "SIGNUP") {
        if (name.trim() == "") {
          // toast.error("Please enter your name")
          return;
        };
        response = await register(type, email, password, name);
      }
      if (type === "SIGNIN") {
        response = await register(type, email, password);
      }
      if (response?.ok) {
        if (response.ok && response.value) {
          console.log(response.value.data);
          // toast.success("Welcome " + response.value.data.name ? "Welcome " + response.value.data.name : "Welcome " + response.value.data.email);
          // const userval = {
          //   userId: response.value.data.id,
          //   dashboardId: response.value.data.dashboards?.id as string,
          //   name: response.value.data.name as string,
          //   email: response.value.data.email as string,
          //   profilePic: response.value.data.image as string
          // }
          // setUser(userval);
          nav.push("/dashboard");
        }
      }else{
        // toast.error(`Error: ${response?.error || "Failed to register"}`);
      }
    }
  }
 return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-[#f8fbff] via-[#eef6ff] to-[#dbeeff] px-6">
      {/* Background Glow */}
      <div className="absolute -top-48 left-1/2 h-162.5 w-162.5 -translate-x-1/2 rounded-full bg-blue-400/20 blur-[140px]" />
      <div className="absolute -bottom-40 -left-20 h-112.5 w-112.5 rounded-full bg-sky-300/20 blur-[120px]" />
      <div className="absolute -right-24 top-32 h-87.5 w-87.5 rounded-full bg-cyan-300/20 blur-[120px]" />

      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2563eb 1px, transparent 1px),
            linear-gradient(to bottom, #2563eb 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md rounded-[32] border border-white/50 bg-white/55 backdrop-blur-3xl p-10 shadow-[0_25px_80px_rgba(37,99,235,0.18)]">
        {/* Badge */}
        <div className="mb-8 flex justify-center">
          <span className="rounded-full border border-blue-200 bg-blue-100/70 px-4 py-1 text-xs font-semibold tracking-wide text-blue-700">
            WORKFLOW AUTOMATION PLATFORM
          </span>
        </div>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/30">
            <Workflow className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900">
            Workflow Automation
          </h1>

          <p className="text-[15px] leading-7 text-slate-600">
            Build, automate and execute workflows visually with a modern
            low-code automation platform.
          </p>
        </div>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          className="group mt-10 flex w-full cursor-pointer items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-base font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-xl"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9A6 6 0 1 1 12 6a5.4 5.4 0 0 1 3.8 1.5l2.8-2.8A9.6 9.6 0 1 0 21.6 12c0-.6-.1-1.1-.2-1.8z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.4-.3-2H12v4h6.4c-.3 1.6-1.3 2.9-2.7 3.8l3.2 2.5c1.9-1.8 3-4.4 3-8.3z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.3a5.8 5.8 0 0 1 0-4L2.3 7.7a10 10 0 0 0 0 8.8z"
            />
            <path
              fill="#34A853"
              d="M12 22a9.7 9.7 0 0 0 6.7-2.4l-3.2-2.5a6 6 0 0 1-9-2.8l-3.3 2.6A10 10 0 0 0 12 22z"
            />
          </svg>

          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <p className="mt-8 text-center text-sm leading-6 text-slate-500">
          Secure authentication powered by Google.
          <br />
          No password required.
        </p>
      </div>
    </main>
  );
}

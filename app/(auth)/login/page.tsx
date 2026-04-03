import { LoginUI } from "@/features/auth/components/login-ui"

const LoginPage = async () => {
  
  return (
    <main className="min-h-dvh bg-background">
      <div className="mx-auto flex min-h-dvh w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <LoginUI />
        </div>
      </div>
    </main>
  )
}

export default LoginPage

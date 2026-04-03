import LoginUI from '@/features/auth/components/login-ui';

export default function Page() {
  return (
    <main className="min-h-[100dvh] bg-background">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-7xl items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="w-full">
          <LoginUI />
        </div>
      </div>
    </main>
  );
}

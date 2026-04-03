'use client';

import { OnboardingScreen } from '@/components/ui/onboarding-screen';
import { signIn } from '@/lib/auth-client';

export const LoginUI = () => {
  const handleGithubLogin = async () => {
    try {
      await signIn.social({
        provider: "github"
      })
    } catch (error) {
      console.error("GitHub login failed:", error);
    }
  }
  

  return (
    <OnboardingScreen
      onGithubLogin={handleGithubLogin}
    />
  );
}

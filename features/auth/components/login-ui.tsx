'use client';

import React from 'react';
import { OnboardingScreen } from '@/components/ui/onboarding-screen';

export default function LoginUI() {
  const handleGithubLogin = async () => {
    try {
      console.log('Initiating GitHub login...');
      // TODO: Implement GitHub OAuth flow
      // window.location.href = '/api/auth/github';
    } catch (error) {
      console.error('GitHub login error:', error);
    }
  };

  return (
    <OnboardingScreen
      onGithubLogin={handleGithubLogin}
    />
  );
}

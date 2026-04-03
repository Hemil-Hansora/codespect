'use client';

import React from 'react';
import { motion } from 'motion/react';
import { CheckmarkBadge01Icon, GithubIcon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface OnboardingProps {
  title?: string;
  subtitle?: string;
  githubButtonText?: string;
  tooltipMainText?: string;
  tooltipSubText?: string;
  rightSectionDescription?: string;
  onGithubLogin?: () => void;
}

export const OnboardingScreen: React.FC<OnboardingProps> = ({
  title = 'Welcome to CodeSpect',
  subtitle = 'Sign in with your GitHub account to get started',
  githubButtonText = 'Continue with GitHub',
  tooltipMainText = 'Connect your GitHub account',
  tooltipSubText = 'Securely authenticate with GitHub OAuth',
  rightSectionDescription =
    'Sign in to access code review, analytics, and collaboration features.',
  onGithubLogin,
}) => {
  const spring = { type: 'spring', stiffness: 300, damping: 30 } as const;

  const handleGithubLogin = () => {
    onGithubLogin?.();
  };

  return (
    <div className="relative flex min-h-[calc(100dvh-3rem)] w-full flex-col items-center justify-center overflow-hidden bg-background transition-colors duration-500">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 left-10 h-24 w-24 rounded-2xl border border-border/60 bg-card/30" />
        <div className="absolute right-14 bottom-14 h-20 w-20 rounded-full border border-border/50 bg-muted/40" />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={spring}
        className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[28px] border border-border bg-card p-2 shadow-2xl transition-colors duration-500 sm:max-w-xl md:max-w-5xl md:flex-row"
      >
        <div className="relative flex flex-[1.2] flex-col justify-center overflow-hidden rounded-[24px] border border-border bg-card px-6 py-8 transition-colors duration-500 sm:px-8 sm:py-10 md:rounded-l-[24px] md:rounded-r-none md:border-r-0 md:px-12 lg:px-16">
          <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />

          <div className="relative z-10 mx-auto w-full max-w-sm">
            <motion.div
              className="mb-7 flex justify-center md:justify-start"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-xl border border-primary/25 bg-primary p-3 shadow-lg">
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="text-primary-foreground"
                >
                  <path
                    d="M7 8H5C3.34315 8 2 9.34315 2 11V13C2 14.6569 3.34315 16 5 16H7M17 8H19C20.6569 8 22 9.34315 22 11V13C22 14.6569 20.6569 16 19 16H17M8 12H16"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </motion.div>

            <motion.h1
              className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {title}
            </motion.h1>
            <motion.p
              className="mb-8 text-sm text-muted-foreground transition-colors sm:mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {subtitle}
            </motion.p>

            <motion.div
              className="mb-4 space-y-6 text-left sm:mb-8"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.button
                onClick={handleGithubLogin}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-2xl border border-primary/25 bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-lg transition-all hover:bg-primary/90 sm:py-4"
              >
                <HugeiconsIcon icon={GithubIcon} size={20} />
                <span>{githubButtonText}</span>
              </motion.button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs font-medium text-muted-foreground">secure oauth</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <div className="text-center">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  By continuing, you agree to our{' '}
                  <span className="cursor-pointer font-medium text-primary hover:underline">
                    Terms of Service
                  </span>
                  {' '}and{' '}
                  <span className="cursor-pointer font-medium text-primary hover:underline">
                    Privacy Policy
                  </span>
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden rounded-[24px] border border-border bg-muted p-8 transition-colors duration-500 md:flex md:rounded-l-none md:rounded-r-[24px] md:border-l-0 lg:p-12">
          <div className="absolute top-8 right-8 h-14 w-14 rounded-xl border border-border/70 bg-card/60" />
          <div className="absolute bottom-8 left-8 h-16 w-16 rounded-full border border-border/70 bg-card/60" />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="z-10 -mb-5 rounded-2xl border border-border bg-popover px-5 py-3 text-center text-xs font-semibold whitespace-nowrap text-popover-foreground shadow-lg transition-colors"
          >
            <p className="text-primary">{tooltipMainText}</p>
            <p className="mt-0.5 text-[10px] font-normal whitespace-nowrap text-muted-foreground">
              {tooltipSubText}
            </p>
          </motion.div>

          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 200 }}
            className="relative my-8 flex aspect-square w-full max-w-72 flex-col items-center justify-center rounded-[32px] border-2 border-border bg-background p-8 shadow-xl transition-all"
          >
            <motion.div
              className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-md ring-4 ring-primary/15"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <HugeiconsIcon icon={GithubIcon} size={36} strokeWidth={1.5} />
            </motion.div>

            <motion.div
              className="mb-6 flex items-center gap-2 whitespace-nowrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <span className="text-base font-bold text-foreground">
                GitHub User
              </span>
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="shrink-0 text-primary" />
            </motion.div>

            <div className="w-full space-y-2 opacity-25">
              <div className="h-2 w-full rounded-full bg-foreground" />
              <div className="mx-auto h-2 w-2/3 rounded-full bg-foreground" />
            </div>
          </motion.div>

          <motion.p
            className="relative z-10 max-w-64 text-center text-xs leading-relaxed text-muted-foreground transition-colors"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {rightSectionDescription}
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};

'use client';

import { createContext, useContext, type ReactNode } from 'react';

export interface UserStatus {
  userId: string;
  firstName: string | null;
  paymentStatus: string;
  isGoocampusMember: boolean;
  onboardingComplete: boolean;
  membershipStartDate: string | null;
  membershipEndDate: string | null;
}

const UserStatusContext = createContext<UserStatus | null>(null);

export function UserStatusProvider({
  value,
  children,
}: {
  value: UserStatus;
  children: ReactNode;
}) {
  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
}

export function useUserStatus(): UserStatus {
  const ctx = useContext(UserStatusContext);
  if (!ctx) {
    throw new Error('useUserStatus must be used within UserStatusProvider');
  }
  return ctx;
}

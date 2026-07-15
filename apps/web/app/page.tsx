'use client';

import { Dashboard } from "../components/Dashboard";

import { SessionProvider } from 'next-auth/react'

export default function Page() {
        
  return<>
  <SessionProvider>
  <Dashboard />;
  </SessionProvider>
  </>
}

'use client';

import { SessionProvider } from 'next-auth/react';

export default function NextAuthProvider({ children }) {
  // You can pass the session fetched from server components
  // as a prop here if needed for initial state, but often
  // the provider handles fetching it client-side anyway.
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}

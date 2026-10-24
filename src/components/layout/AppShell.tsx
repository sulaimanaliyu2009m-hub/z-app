import React from 'react';
import { Outlet } from 'react-router-dom';
import { TopHeader } from './TopHeader';
import { BottomNav } from './BottomNav';

export const AppShell: React.FC = () => {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col bg-white shadow-2xl dark:bg-neutral-950 sm:border-x sm:border-neutral-200 dark:sm:border-neutral-800">
      <TopHeader />
      <main className="flex-1 pb-20">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};
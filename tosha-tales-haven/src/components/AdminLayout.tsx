import React from 'react';
import ApiMonitor from './ApiMonitor';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <>
      {children}
      <ApiMonitor />
    </>
  );
};

export default AdminLayout; 
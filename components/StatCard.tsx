
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value }) => {
  return (
    <div className="bg-brand-surface p-6 rounded-lg flex items-center space-x-4">
      <div className="p-3 bg-brand-primary/20 rounded-full text-brand-secondary">
        {React.cloneElement(icon as React.ReactElement, { className: "w-6 h-6" })}
      </div>
      <div>
        <p className="text-sm text-brand-text-secondary">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;

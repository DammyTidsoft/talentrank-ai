import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="flex justify-between items-center pb-4 border-b border-brand-muted">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-brand-text">TalentRank AI</h1>
        <p className="text-sm text-brand-text-secondary mt-1">LSETF/PLP Hackathon Edition</p>
      </div>
    </header>
  );
};

export default Header;
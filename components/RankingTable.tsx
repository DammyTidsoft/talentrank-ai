import React, { useState, useMemo } from 'react';
import { Applicant, ApplicantStatus } from '../types';
import { SortIcon } from './icons/Icons';

interface RankingTableProps {
  applicants: Applicant[];
  onSelectApplicant: (applicant: Applicant) => void;
  searchQuery: string;
  statusFilter: ApplicantStatus | 'all';
}

type SortKey = 'rank' | 'name' | 'score';
type SortDirection = 'asc' | 'desc';

const RankingTable: React.FC<RankingTableProps> = ({ applicants, onSelectApplicant, searchQuery, statusFilter }) => {
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const filteredApplicants = useMemo(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    return applicants.filter(applicant => {
      const matchesStatus = statusFilter === 'all' || applicant.status === statusFilter;
      const matchesSearch = !searchQuery ||
        applicant.name.toLowerCase().includes(lowercasedQuery) ||
        applicant.email.toLowerCase().includes(lowercasedQuery) ||
        applicant.skills.some(skill => skill.toLowerCase().includes(lowercasedQuery));
      return matchesStatus && matchesSearch;
    });
  }, [applicants, searchQuery, statusFilter]);

  const sortedApplicants = useMemo(() => {
    const sorted = [...filteredApplicants].sort((a, b) => {
      let valA, valB;
      switch (sortKey) {
        case 'name':
          valA = a.name.toLowerCase();
          valB = b.name.toLowerCase();
          break;
        case 'score':
          valA = a.score;
          valB = b.score;
          break;
        case 'rank':
        default:
          valA = a.rank;
          valB = b.rank;
          break;
      }
      if (valA < valB) return -1;
      if (valA > valB) return 1;
      return 0;
    });
    return sortDirection === 'desc' ? sorted.reverse() : sorted;
  }, [filteredApplicants, sortKey, sortDirection]);

  const handleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  const SortableHeader: React.FC<{ sortKey: SortKey, children: React.ReactNode }> = ({ sortKey: key, children }) => (
    <th onClick={() => handleSort(key)} className="px-4 py-3 cursor-pointer select-none hover:bg-gray-700">
      <div className="flex items-center justify-start">
        {children}
        <SortIcon className={`w-4 h-4 ml-2 transition-transform duration-200 ${sortKey === key ? 'text-white' : 'text-gray-500'} ${sortKey === key && sortDirection === 'desc' ? 'rotate-180' : ''}`} />
      </div>
    </th>
  );

  if (sortedApplicants.length === 0) {
    return (
      <div className="bg-brand-surface rounded-lg p-8 text-center text-brand-text-secondary">
        <h3 className="text-xl font-semibold">No Applicants Found</h3>
        <p>Your search or filter criteria did not match any applicants.</p>
      </div>
    );
  }

  return (
    <div className="bg-brand-surface rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-700/50 text-xs uppercase text-brand-text-secondary">
            <tr>
              <SortableHeader sortKey="rank">Rank</SortableHeader>
              <SortableHeader sortKey="name">Name</SortableHeader>
              <SortableHeader sortKey="score">Score</SortableHeader>
              <th className="px-4 py-3">Top Skills</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedApplicants.map((applicant) => (
              <tr
                key={applicant.id}
                onClick={() => onSelectApplicant(applicant)}
                className="border-b border-brand-muted hover:bg-brand-muted/50 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 font-bold text-brand-text">{applicant.rank}</td>
                <td className="px-4 py-3">
                    <div className="font-medium text-brand-text">{applicant.name}</div>
                    <div className="text-xs text-brand-text-secondary">{applicant.email}</div>
                </td>
                <td className="px-4 py-3 font-semibold text-brand-secondary">{applicant.score}/100</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {applicant.skills.slice(0, 3).map(skill => (
                      <span key={skill} className="bg-brand-muted text-brand-text-secondary text-xs font-medium px-2 py-0.5 rounded">{skill}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    applicant.status === ApplicantStatus.Ranked ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
                  }`}>
                    {applicant.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankingTable;
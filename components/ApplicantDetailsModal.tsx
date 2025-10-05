
import React from 'react';
import { Applicant, ApplicantStatus } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface ApplicantDetailsModalProps {
  applicant: Applicant | null;
  onClose: () => void;
}

const ApplicantDetailsModal: React.FC<ApplicantDetailsModalProps> = ({ applicant, onClose }) => {
  if (!applicant) return null;

  const scoreData = [
    { name: 'Skills', value: applicant.scoreBreakdown.skills, color: '#3B82F6' },
    { name: 'Experience', value: applicant.scoreBreakdown.experience, color: '#10B981' },
    { name: 'Education', value: applicant.scoreBreakdown.education, color: '#F97316' },
    { name: 'Extra', value: applicant.scoreBreakdown.extra, color: '#8B5CF6' },
  ];

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 transition-opacity"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-brand-surface p-6 border-b border-brand-muted flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{applicant.name}</h2>
            <p className="text-brand-text-secondary">{applicant.email} &bull; {applicant.phone}</p>
          </div>
          <button onClick={onClose} className="text-brand-text-secondary hover:text-brand-text">&times;</button>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4">
            <div className="bg-brand-background p-4 rounded-lg">
              <p className="text-sm text-brand-text-secondary">Overall Score</p>
              <p className="text-4xl font-bold text-brand-secondary">{applicant.score} <span className="text-2xl text-brand-text-secondary">/ 100</span></p>
            </div>
            <div className="bg-brand-background p-4 rounded-lg">
              <p className="text-sm text-brand-text-secondary">Rank</p>
              <p className="text-3xl font-bold">#{applicant.rank}</p>
            </div>
            <div className="bg-brand-background p-4 rounded-lg">
              <p className="text-sm text-brand-text-secondary">Status</p>
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                applicant.status === ApplicantStatus.Ranked ? 'bg-green-900 text-green-300' : 'bg-yellow-900 text-yellow-300'
              }`}>
                {applicant.status}
              </span>
            </div>
          </div>
          <div className="md:col-span-2 bg-brand-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Score Breakdown</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreData} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={80} tickLine={false} axisLine={false} stroke="#D1D5DB" />
                <Tooltip cursor={{fill: '#4B5563'}} contentStyle={{ backgroundColor: '#1F2937', border: 'none' }}/>
                <Bar dataKey="value" barSize={20}>
                  {scoreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-6">
          <div className="bg-brand-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {applicant.skills.map(skill => (
                <span key={skill} className="bg-brand-muted text-brand-text-secondary text-sm font-medium px-3 py-1 rounded-full">{skill}</span>
              ))}
            </div>
          </div>

          <div className="bg-brand-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Education</h4>
            <p className="text-brand-text-secondary">{applicant.education}</p>
          </div>

          <div className="bg-brand-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Experience Summary</h4>
            <p className="text-brand-text-secondary">{applicant.experienceSummary}</p>
          </div>
          
           <div className="bg-brand-background p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Resume Summary</h4>
            <p className="text-brand-text-secondary italic">{applicant.resumeSummary}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicantDetailsModal;

import React, { useState, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Applicant, RankingResult, ApplicantStatus } from '../types';
import { uploadAndRankApplicants } from '../services/mockApiService';
import Header from './Header';
import FileUpload from './FileUpload';
import RankingTable from './RankingTable';
import ApplicantDetailsModal from './ApplicantDetailsModal';
import StatCard from './StatCard';
import { CheckCircleIcon, UserGroupIcon, WarningIcon, DownloadIcon, SaveIcon, TrashIcon } from './icons/Icons';

type View = 'ranking' | 'bias' | 'validation';

const Dashboard: React.FC = () => {
  const [rankingResult, setRankingResult] = useState<RankingResult | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<View>('ranking');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | 'all'>('all');
  const [notification, setNotification] = useState<string>('');

  useEffect(() => {
    try {
      const savedData = localStorage.getItem('rankingResult');
      if (savedData) {
        setRankingResult(JSON.parse(savedData));
        setNotification('Session restored from the last visit.');
      }
    } catch (e) {
      console.error("Failed to parse saved data from localStorage", e);
      localStorage.removeItem('rankingResult');
    }
  }, []);

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleFileUpload = useCallback(async (file: File, targetRole: string) => {
    setIsLoading(true);
    setError(null);
    setRankingResult(null);
    try {
      const result = await uploadAndRankApplicants(file, targetRole);
      setRankingResult(result);
      setCurrentView('ranking');
      localStorage.setItem('rankingResult', JSON.stringify(result)); // Auto-save on new upload
      showNotification('Analysis complete and session saved!');
    } catch (err) {
      setError('Failed to process applicant data. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSelectApplicant = (applicant: Applicant) => setSelectedApplicant(applicant);

  const handleSaveState = useCallback(() => {
    if (rankingResult) {
      localStorage.setItem('rankingResult', JSON.stringify(rankingResult));
      showNotification('Current session saved successfully!');
    }
  }, [rankingResult]);

  const handleClearState = useCallback(() => {
    localStorage.removeItem('rankingResult');
    setRankingResult(null);
    setSearchQuery('');
    setStatusFilter('all');
    showNotification('Session cleared.');
  }, []);

  const handleDownloadCSV = useCallback(() => {
    if (!rankingResult) return;
    const headers = ['Rank', 'Name', 'Email', 'Phone', 'Score', 'Status', 'Skills'];
    const rows = rankingResult.rankedApplicants.map(app => [
        app.rank, `"${app.name.replace(/"/g, '""')}"`, app.email, app.phone, app.score,
        app.status, `"${app.skills.join('; ')}"`
    ].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'applicant_ranking.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, [rankingResult]);

  const renderBiasReport = () => {
    if (!rankingResult) return null;
    const { gender, region, education } = rankingResult.biasReport;
    const totalGender = gender.reduce((sum, item) => sum + item.value, 0);
    const GENDER_COLORS = ['#3B82F6', '#EC4899'];
    const REGION_COLOR = '#10B981';
    const EDUCATION_COLOR = '#F97316';

    const getTopItem = (data: {name: string, value: number}[]) => data.reduce((max, item) => item.value > max.value ? item : max, data[0]);

    const topRegion = getTopItem(region);
    const topGender = getTopItem(gender);

    return (
      <div className="bg-brand-surface p-6 rounded-lg">
        <h3 className="text-xl font-bold mb-2">Bias & Fairness Report</h3>
        <div className="text-brand-text-secondary mb-6 p-4 bg-brand-background rounded-md space-y-1 text-sm">
            <p><strong className="text-brand-text">Gender:</strong> {topGender.name}s represent the largest group at <strong className="text-brand-text">{((topGender.value / totalGender) * 100).toFixed(1)}%</strong>.</p>
            <p><strong className="text-brand-text">Region:</strong> Applicants from <strong className="text-brand-text">{topRegion.name}</strong> are the most represented in the dataset.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-2 text-center">Distribution by Gender</h4>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={gender} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {gender.map((entry, index) => <Cell key={`cell-${index}`} fill={GENDER_COLORS[index % GENDER_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-2 text-center">Distribution by Region</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={region}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                <XAxis dataKey="name" stroke="#D1D5DB" tick={{ fontSize: 12 }} />
                <YAxis stroke="#D1D5DB" />
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                <Legend />
                <Bar dataKey="value" fill={REGION_COLOR} name="Applicants"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="lg:col-span-2 flex flex-col items-center">
            <h4 className="text-lg font-semibold mb-2 text-center">Distribution by Education Level</h4>
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={education} layout="vertical" margin={{ top: 5, right: 20, left: 120, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis type="number" stroke="#D1D5DB" />
                    <YAxis type="category" dataKey="name" stroke="#D1D5DB" tick={{ fontSize: 12 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #4B5563' }} />
                    <Legend />
                    <Bar dataKey="value" fill={EDUCATION_COLOR} name="Applicants" />
                </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-brand-surface rounded-lg">
          <div className="loader border-t-4 border-brand-secondary border-solid rounded-full w-12 h-12 animate-spin mb-4"></div>
          <p className="text-xl font-semibold">Analyzing Applicants...</p>
          <p className="text-brand-text-secondary">This may take a moment. We're extracting skills, scoring, and ranking.</p>
        </div>
      );
    }
    if (!rankingResult) {
      return (
        <div className="text-center p-8 bg-brand-surface rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Welcome to TalentRank AI</h2>
          <p className="text-brand-text-secondary">Upload a file to begin the analysis. Saved sessions will be restored automatically.</p>
        </div>
      );
    }
    switch (currentView) {
      case 'ranking':
        return <RankingTable applicants={rankingResult.rankedApplicants} onSelectApplicant={handleSelectApplicant} searchQuery={searchQuery} statusFilter={statusFilter}/>;
      case 'bias':
        return renderBiasReport();
      case 'validation':
        return (
          <div className="bg-brand-surface p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">Data Validation Log</h3>
            <ul className="space-y-2 font-mono text-sm">
              {rankingResult.validationErrors.map((log, index) => (
                <li key={index} className="flex items-start">
                  <WarningIcon className="w-4 h-4 mr-2 mt-1 text-yellow-400 flex-shrink-0" />
                  <span className="text-brand-text-secondary">{log}</span>
                </li>
              ))}
            </ul>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {notification && (
        <div className="fixed top-5 right-5 bg-brand-secondary text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          {notification}
        </div>
      )}
      <Header />
      <main className="mt-8">
        <FileUpload onUpload={handleFileUpload} isLoading={isLoading} />
        {error && <div className="mt-4 text-center p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg">{error}</div>}
        
        {rankingResult && (
          <div className="flex justify-center space-x-2 mt-4">
              <button onClick={handleSaveState} className="flex items-center space-x-2 px-3 py-1 text-xs bg-brand-surface border border-brand-muted hover:bg-brand-muted rounded-md"><SaveIcon className="w-4 h-4"/><span>Save Session</span></button>
              <button onClick={handleClearState} className="flex items-center space-x-2 px-3 py-1 text-xs bg-brand-surface border border-brand-muted hover:bg-brand-muted rounded-md"><TrashIcon className="w-4 h-4"/><span>Clear Session</span></button>
          </div>
        )}

        {rankingResult && (
          <>
            <div className="my-8 text-center">
              <p className="text-brand-text-secondary">Analysis for Target Role:</p>
              <h2 className="text-2xl font-bold text-brand-secondary">{rankingResult.targetRole}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard icon={<UserGroupIcon />} title="Total Applicants" value={rankingResult.stats.total.toString()} />
              <StatCard icon={<CheckCircleIcon />} title="Successfully Ranked" value={rankingResult.stats.ranked.toString()} />
              <StatCard icon={<WarningIcon />} title="Flagged for Review" value={rankingResult.stats.forReview.toString()} />
            </div>

            <div className="bg-brand-surface p-4 rounded-t-lg border-b border-brand-muted">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                     <div className="flex-grow">
                        <input
                            type="text"
                            placeholder="Search by name, email, or skill..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2 bg-brand-background border border-brand-muted rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                        />
                    </div>
                    <div className="flex-shrink-0">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | 'all')}
                            className="w-full md:w-auto px-4 py-2 bg-brand-background border border-brand-muted rounded-md focus:ring-2 focus:ring-brand-secondary focus:outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value={ApplicantStatus.Ranked}>Ranked</option>
                            <option value={ApplicantStatus.Review}>For Review</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between border-b border-brand-muted mb-6 bg-brand-surface p-2 rounded-b-lg">
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentView('ranking')} className={`px-4 py-2 text-sm font-medium transition-colors ${currentView === 'ranking' ? 'border-b-2 border-brand-secondary text-brand-text' : 'text-brand-text-secondary hover:text-brand-text'}`}>Ranking</button>
                    <button onClick={() => setCurrentView('bias')} className={`px-4 py-2 text-sm font-medium transition-colors ${currentView === 'bias' ? 'border-b-2 border-brand-secondary text-brand-text' : 'text-brand-text-secondary hover:text-brand-text'}`}>Bias Report</button>
                    <button onClick={() => setCurrentView('validation')} className={`px-4 py-2 text-sm font-medium transition-colors ${currentView === 'validation' ? 'border-b-2 border-brand-secondary text-brand-text' : 'text-brand-text-secondary hover:text-brand-text'}`}>Validation Log</button>
                </div>
                <button onClick={handleDownloadCSV} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium bg-brand-primary text-white rounded-md hover:bg-blue-800 transition-colors"><DownloadIcon className="w-4 h-4" /><span>Download CSV</span></button>
            </div>
          </>
        )}
        
        <div className="mt-6">
          {renderContent()}
        </div>
      </main>
      <ApplicantDetailsModal applicant={selectedApplicant} onClose={() => setSelectedApplicant(null)} />
      <footer className="mt-12 py-4 text-center text-sm text-brand-muted border-t border-brand-muted">
        <p className="font-semibold">Powered by tedtechitsolutions</p>
        <p className="mt-1">Designed for seamless integration with LSETF’s LMS and built to scale for future needs.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
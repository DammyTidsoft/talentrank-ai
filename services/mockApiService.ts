import { Applicant, ApplicantStatus, BiasReportData, RankingResult } from '../types';

const firstNames = ["Adebayo", "Chiamaka", "Damilola", "Emeka", "Fatima", "Gbenga", "Habiba", "Ifeanyi", "Jide", "Kemi"];
const lastNames = ["Okafor", "Adewale", "Eze", "Balogun", "Ibrahim", "Nwachukwu", "Abiodun", "Okoro", "Suleiman", "Adekunle"];
const skills = ["Python Developer", "Data Science", "React", "Node.js", "DevOps", "Project Management", "UI/UX Design", "Machine Learning", "Cybersecurity", "Cloud Computing"];
const educationLevels = ["B.Sc Computer Science", "M.Sc Data Analytics", "HND Electrical Engineering", "Ph.D. in AI", "B.Eng Mechanical Engineering", "Self-taught"];
const regions = ["Lagos", "Abuja", "Rivers", "Kano", "Oyo", "Enugu"];

const getRandomElement = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;

const generateMockApplicant = (id: number): Applicant => {
  const score = getRandomInt(65, 98);
  const status = score < 70 || Math.random() < 0.1 ? ApplicantStatus.Review : ApplicantStatus.Ranked;

  const scoreBreakdown = {
    skills: Math.round(score * 0.4 * (1 + (Math.random() - 0.5) * 0.2)),
    experience: Math.round(score * 0.25 * (1 + (Math.random() - 0.5) * 0.2)),
    education: Math.round(score * 0.25 * (1 + (Math.random() - 0.5) * 0.2)),
    extra: Math.round(score * 0.1 * (1 + (Math.random() - 0.5) * 0.2)),
  };
  
  return {
    id: `applicant-${id}`,
    rank: 0, // Will be set after sorting
    name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
    email: `applicant${id}@example.com`,
    phone: `080${getRandomInt(10000000, 99999999)}`,
    score,
    status,
    skills: [...new Set(Array.from({ length: getRandomInt(3, 5) }, () => getRandomElement(skills)))],
    education: getRandomElement(educationLevels),
    experienceSummary: `${getRandomInt(2, 8)} years of experience in various roles.`,
    scoreBreakdown,
    resumeSummary: "Experienced professional with a demonstrated history of working in the information technology and services industry. Skilled in various technologies and methodologies.",
  };
};

export const uploadAndRankApplicants = (file: File, targetRole?: string): Promise<RankingResult> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const applicantCount = getRandomInt(50, 200);
      const applicants = Array.from({ length: applicantCount }, (_, i) => generateMockApplicant(i + 1));

      // Sort by score desc, then name asc for tie-breaking
      applicants.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.name.localeCompare(b.name);
      });

      // Assign ranks
      applicants.forEach((applicant, index) => {
        applicant.rank = index + 1;
      });
      
      const validationErrors = [
          "Row 15: Missing email, applicant skipped.",
          "Row 42: Non-UTF8 character detected in resume, sanitized.",
          "Row 98: Duplicate phone number found for applicant 'Jide Balogun', flagged for review."
      ];

      const educationDistribution: { [key: string]: number } = {};
      applicants.forEach(app => {
        educationDistribution[app.education] = (educationDistribution[app.education] || 0) + 1;
      });

      const biasReport: BiasReportData = {
        gender: [
            { name: 'Male', value: Math.floor(applicantCount * 0.55) },
            { name: 'Female', value: Math.floor(applicantCount * 0.45) }
        ],
        region: regions.map(r => ({ name: r, value: getRandomInt(5, 25) })),
        education: Object.entries(educationDistribution).map(([name, value]) => ({ name, value })),
      };
      
      const stats = {
          total: applicantCount + 3, // original total
          ranked: applicants.filter(a => a.status === ApplicantStatus.Ranked).length,
          forReview: applicants.filter(a => a.status === ApplicantStatus.Review).length
      };

      resolve({
        rankedApplicants: applicants,
        validationErrors,
        biasReport,
        stats,
        targetRole: targetRole || 'General Application Pool',
      });
    }, 2000);
  });
};
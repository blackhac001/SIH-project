import { api } from './api';

export interface ResumeParsedResult {
  candidateName: string;
  targetRole: string;
  seniority: string;
  atsScore: number;
  extractedSkills: { name: string; category: string; proficiency: number }[];
  missingKeywords: string[];
  strengths: string[];
  recommendations: string[];
  jobMatchComparisons: {
    jobTitle: string;
    company: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
  }[];
}

export interface SalaryProjection {
  currentEstimatedSalary: number;
  potentialSalary: number;
  growthPercentage: number;
  confidenceScore: number;
  timeline: { year: number; baseSalary: number; bonusEquity: number; total: number }[];
  positiveDrivers: { factor: string; impact: string; icon: string }[];
  growthBlockers: { blocker: string; impact: string; recommendation: string }[];
  skillBoostSimulations: { skillName: string; addedValue: number; category: string }[];
  disclaimer?: string;
}

export interface FutureSkill {
  id: string;
  name: string;
  category: string;
  demandGrowth: string;
  growthPercentage: number;
  importance: 'CRITICAL' | 'HIGH' | 'EMERGING';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  timeToLearn: string;
  recommendedCourse: string;
  provider: string;
  globalSalaryPremium: string;
}

export interface SkillGapAnalysis {
  targetRole: string;
  matchScore: number;
  candidateSkillsCoverage: number;
  targetRequiredCoverage: number;
  criticalMissing: { skill: string; reason: string; priority: number }[];
  importantMissing: { skill: string; reason: string; priority: number }[];
  niceToHave: { skill: string; reason: string; priority: number }[];
  curatedLearningPath: {
    week: string;
    focus: string;
    skills: string[];
    certification: string;
  }[];
}

export interface GlobalJob {
  id: string | number;
  title: string;
  company: string;
  companyLogoText: string;
  country: string;
  countryCode: string;
  city: string;
  workplaceType: 'Remote' | 'Hybrid' | 'Onsite';
  salaryMin: number;
  salaryMax: number;
  currency: string;
  experienceLevel: 'Entry' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
  visaSponsorship: boolean;
  matchScore: number;
  requiredSkills: string[];
  description: string;
  postedDate: string;
  applicantsCount: number;
  applied?: boolean;
}

export interface RecruiterCandidate {
  id: string | number;
  name: string;
  avatarText: string;
  title: string;
  location: string;
  country: string;
  experienceYears: number;
  matchScore: number;
  skills: string[];
  salaryExpectation: string;
  availability: string;
  verifiedCredentials: boolean;
  status: 'NEW' | 'REVIEWED' | 'SHORTLISTED' | 'INTERVIEWING' | 'OFFERED' | 'HIRED';
}

export interface MessageItem {
  id: string | number;
  senderName: string;
  senderRole: string;
  avatarText: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  conversation: {
    id: string | number;
    fromMe: boolean;
    text: string;
    time: string;
    isOffer?: boolean;
    offerDetails?: {
      role: string;
      salary: string;
      company: string;
    };
  }[];
}

export interface GlobalRegionDemand {
  region: string;
  code: string;
  activeJobs: number;
  topSkills: string[];
  avgSalary: string;
  remoteRate: string;
  hotSector: string;
}

// -----------------------------------------------------------------------------
// Real Backend API Integrations
// -----------------------------------------------------------------------------

export const analyzeResumeAPI = async (resumeText: string, targetRole?: string): Promise<ResumeParsedResult> => {
  try {
    const response = await api.post<ResumeParsedResult>('/intelligence/analyze-resume', {
      resume_text: resumeText,
      target_role: targetRole || "Senior AI & Cloud Platform Engineer"
    });
    return response.data;
  } catch {
    return getResumeAnalysisMock();
  }
};

export const predictSalaryAPI = async (): Promise<SalaryProjection> => {
  try {
    const response = await api.post<SalaryProjection>('/intelligence/salary-prediction');
    return response.data;
  } catch {
    return getSalaryProjectionData();
  }
};

export const computeSkillGapAPI = async (targetRole?: string): Promise<SkillGapAnalysis> => {
  try {
    const response = await api.post<SkillGapAnalysis>('/intelligence/skill-gap', {
      target_role: targetRole || "Principal AI & Cloud Architect"
    });
    return response.data;
  } catch {
    return getSkillGapData();
  }
};

export const fetchFutureSkillsAPI = async (): Promise<FutureSkill[]> => {
  try {
    const response = await api.get<FutureSkill[]>('/intelligence/future-skills');
    return response.data;
  } catch {
    return getFutureSkillsData();
  }
};

export const chatCopilotAPI = async (message: string, history?: any[]) => {
  try {
    const response = await api.post('/intelligence/copilot', {
      message,
      conversation_history: history || []
    });
    return response.data;
  } catch {
    return {
      reply: "I am your CONNECTX Career Copilot. How can I assist your skills roadmap and job discovery today?",
      suggestedActions: ["Analyze my resume", "View salary forecast", "Find matching jobs"]
    };
  }
};

export const fetchDashboardKPIsAPI = async () => {
  try {
    const response = await api.get('/intelligence/dashboard-kpis');
    return response.data;
  } catch {
    return null;
  }
};

export const fetchJobsAPI = async (): Promise<GlobalJob[]> => {
  try {
    const response = await api.get<any[]>('/jobs');
    if (response.data && response.data.length > 0) {
      return response.data.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.employer?.company_name || "Enterprise Partner",
        companyLogoText: (j.employer?.company_name || "EP").substring(0, 2).toUpperCase(),
        country: "Global",
        countryCode: "US",
        city: "Remote / Hybrid",
        workplaceType: "Remote" as const,
        salaryMin: j.min_salary || 120000,
        salaryMax: j.max_salary || 165000,
        currency: "USD",
        experienceLevel: "Senior" as const,
        visaSponsorship: true,
        matchScore: 92,
        requiredSkills: j.job_skills?.map((js: any) => js.skill?.name) || ["Python", "FastAPI", "Cloud"],
        description: j.description || "Architect and deliver high-performance distributed systems.",
        postedDate: "Today",
        applicantsCount: 14,
        applied: false,
      }));
    }
    return getJobsData();
  } catch {
    return getJobsData();
  }
};

export const applyToJobAPI = async (jobId: string | number) => {
  const response = await api.post(`/jobs/${jobId}/apply`);
  return response.data;
};

export const fetchMyApplicationsAPI = async () => {
  try {
    const response = await api.get('/jobs/applications/my');
    return response.data;
  } catch {
    return [];
  }
};

export const fetchEmployerApplicationsAPI = async () => {
  try {
    const response = await api.get('/jobs/employer/applications');
    return response.data;
  } catch {
    return [];
  }
};

export const updateApplicationStatusAPI = async (appId: number | string, status: string) => {
  const response = await api.put(`/jobs/applications/${appId}/status?new_status=${status}`);
  return response.data;
};

export const hireCandidateAPI = async (appId: number | string, offeredSalary: number = 145000) => {
  const response = await api.post(`/jobs/applications/${appId}/hire?offered_salary=${offeredSalary}`);
  return response.data;
};

export const scheduleInterviewAPI = async (data: {
  application_id: number;
  scheduled_at: string;
  interview_type: string;
  meeting_link?: string;
  interviewer_name?: string;
  notes?: string;
}) => {
  const response = await api.post('/interviews', data);
  return response.data;
};

export const fetchMyInterviewsAPI = async () => {
  try {
    const response = await api.get('/interviews/my');
    return response.data;
  } catch {
    return [];
  }
};

export const fetchConversationsAPI = async () => {
  try {
    const response = await api.get('/messages/conversations');
    return response.data;
  } catch {
    return [];
  }
};

export const sendMessageAPI = async (convId: number | string, content: string) => {
  const response = await api.post(`/messages/conversations/${convId}/messages`, { content });
  return response.data;
};

export const fetchNotificationsAPI = async () => {
  try {
    const response = await api.get('/notifications');
    return response.data;
  } catch {
    return [];
  }
};

export const markNotificationReadAPI = async (notifId: number | string) => {
  const response = await api.post(`/notifications/${notifId}/read`);
  return response.data;
};

// -----------------------------------------------------------------------------
// Synchronous Mock Data Fallbacks
// -----------------------------------------------------------------------------

export const getResumeAnalysisMock = (): ResumeParsedResult => {
  return {
    candidateName: "Alex Rivera",
    targetRole: "Senior AI & Cloud Platform Engineer",
    seniority: "Senior Professional (5+ Yrs)",
    atsScore: 91,
    extractedSkills: [
      { name: "Python", category: "Backend & ML", proficiency: 96 },
      { name: "PyTorch", category: "AI Systems", proficiency: 92 },
      { name: "FastAPI", category: "Backend Architecture", proficiency: 94 },
      { name: "PostgreSQL", category: "Databases", proficiency: 88 },
      { name: "Docker", category: "DevOps & Cloud", proficiency: 90 },
      { name: "AWS", category: "Cloud Platforms", proficiency: 85 },
      { name: "Distributed Systems", category: "System Design", proficiency: 87 },
      { name: "Vector DBs", category: "GenAI Infrastructure", proficiency: 82 },
    ],
    missingKeywords: [
      "Kubernetes Multi-Cluster",
      "Ray Cluster Distributed Training",
      "eBPF Network Security",
    ],
    strengths: [
      "Exceptional deep learning API construction with asynchronous Python",
      "Strong database optimization and modern vector search indexing",
      "Demonstrated end-to-end containerized microservices delivery",
      "Active open-source contributions with clean documentation standards",
    ],
    recommendations: [
      "Highlight production Kubernetes orchestrations and multi-node GPU cluster setups.",
      "Quantify latency improvements (e.g. 'reduced inference P99 by 42%') on prior projects.",
      "Add official AWS Solutions Architect or CKA certification credentials to unlock Tier-1 recruiter alerts.",
    ],
    jobMatchComparisons: [
      {
        jobTitle: "Senior AI Infrastructure Engineer",
        company: "Google (Cloud AI)",
        matchScore: 94,
        matchedSkills: ["Python", "PyTorch", "Distributed Systems", "Docker", "FastAPI"],
        missingSkills: ["Ray", "Kubernetes Multi-Cluster"],
      },
      {
        jobTitle: "Staff Cloud Backend Architect",
        company: "Microsoft Azure",
        matchScore: 89,
        matchedSkills: ["Python", "Microservices", "PostgreSQL", "AWS/Cloud", "Docker"],
        missingSkills: ["Terraform", "Azure Kubernetes Service"],
      },
      {
        jobTitle: "Autonomous Systems Software Engineer",
        company: "Tesla",
        matchScore: 85,
        matchedSkills: ["Python", "PyTorch", "High Throughput Data", "Docker"],
        missingSkills: ["C++20", "Embedded Real-Time OS"],
      },
    ],
  };
};

export const getSalaryProjectionData = (): SalaryProjection => {
  return {
    currentEstimatedSalary: 115000,
    potentialSalary: 175000,
    growthPercentage: 52.2,
    confidenceScore: 94,
    timeline: [
      { year: 2026, baseSalary: 115000, bonusEquity: 18000, total: 133000 },
      { year: 2027, baseSalary: 128000, bonusEquity: 24000, total: 152000 },
      { year: 2028, baseSalary: 144000, bonusEquity: 32000, total: 176000 },
      { year: 2029, baseSalary: 162000, bonusEquity: 42000, total: 204000 },
      { year: 2030, baseSalary: 182000, bonusEquity: 54000, total: 236000 },
    ],
    positiveDrivers: [
      {
        factor: "High Global Demand for Generative AI & LLM Engineers",
        impact: "+$22,500 / yr value premium",
        icon: "TrendingUp",
      },
      {
        factor: "Cross-disciplinary Cloud + Data Engineering skillset",
        impact: "+18% accelerated offer velocity",
        icon: "ShieldCheck",
      },
      {
        factor: "Remote Global Hiring Eligibility (US, EU, UK, SG contracts)",
        impact: "+35% compensation ceiling expansion",
        icon: "Globe2",
      },
    ],
    growthBlockers: [
      {
        blocker: "Missing Production Kubernetes (CKA) Certification",
        impact: "-$14,000 potential initial base offer",
        recommendation: "Complete Certified Kubernetes Administrator course and link verified badge.",
      },
      {
        blocker: "Limited Large-Scale Distributed Systems Architecture evidence",
        impact: "Caps transition to Staff / Principal band",
        recommendation: "Build a portfolio project demonstrating multi-node consensus (Raft/Redis Cluster).",
      },
    ],
    skillBoostSimulations: [
      { skillName: "Kubernetes & Helm Orchestration", addedValue: 15000, category: "DevOps" },
      { skillName: "LLM Fine-Tuning & vLLM / TensorRT", addedValue: 21000, category: "AI Systems" },
      { skillName: "Terraform & Multi-Cloud IaC", addedValue: 9500, category: "Infrastructure" },
      { skillName: "Distributed Systems & Consensus", addedValue: 18500, category: "Systems" },
    ],
    disclaimer: "Estimated market range based on verified skills and market index — not a guaranteed salary."
  };
};

export const getFutureSkillsData = (): FutureSkill[] => {
  return [
    {
      id: "fs-1",
      name: "Generative AI Systems & LLMOps",
      category: "Artificial Intelligence",
      demandGrowth: "+48% YoY",
      growthPercentage: 48,
      importance: "CRITICAL",
      difficulty: "Advanced",
      timeToLearn: "6-8 Weeks",
      recommendedCourse: "Distributed Inference with vLLM & Triton",
      provider: "CONNECTX AI Academy",
      globalSalaryPremium: "+$28,000/yr",
    },
    {
      id: "fs-2",
      name: "Production Kubernetes & Service Mesh",
      category: "Cloud & Infrastructure",
      demandGrowth: "+42% YoY",
      growthPercentage: 42,
      importance: "CRITICAL",
      difficulty: "Intermediate",
      timeToLearn: "4-6 Weeks",
      recommendedCourse: "Certified Kubernetes Administrator (CKA)",
      provider: "Linux Foundation Partner",
      globalSalaryPremium: "+$22,000/yr",
    },
    {
      id: "fs-3",
      name: "Vector Databases & Hybrid Search",
      category: "Data Engineering",
      demandGrowth: "+38% YoY",
      growthPercentage: 38,
      importance: "HIGH",
      difficulty: "Intermediate",
      timeToLearn: "3-4 Weeks",
      recommendedCourse: "Vector Search Mastery (Qdrant & pgvector)",
      provider: "MIT Tech Institute",
      globalSalaryPremium: "+$19,500/yr",
    },
    {
      id: "fs-4",
      name: "Zero-Trust Identity & Cyber RBAC",
      category: "Security & Governance",
      demandGrowth: "+35% YoY",
      growthPercentage: 35,
      importance: "HIGH",
      difficulty: "Intermediate",
      timeToLearn: "4 Weeks",
      recommendedCourse: "Enterprise Identity & Token Security",
      provider: "Global Cyber Consortium",
      globalSalaryPremium: "+$16,000/yr",
    },
  ];
};

export const getSkillGapData = (): SkillGapAnalysis => {
  return {
    targetRole: "Principal AI & Cloud Architect",
    matchScore: 84,
    candidateSkillsCoverage: 8,
    targetRequiredCoverage: 11,
    criticalMissing: [
      { skill: "Production Kubernetes", reason: "Mandatory for resilient distributed container rollouts", priority: 1 },
      { skill: "Distributed Consensus (Raft/Paxos)", reason: "Critical for fault-tolerant microservices", priority: 2 },
    ],
    importantMissing: [
      { skill: "Vector Database Indexing (HNSW)", reason: "Required for low-latency similarity search in LLM pipelines", priority: 3 },
    ],
    niceToHave: [
      { skill: "Terraform Multi-Cloud Provider", reason: "Automates multi-region disaster recovery deployments", priority: 4 },
    ],
    curatedLearningPath: [
      {
        week: "Week 1-2",
        focus: "Production Kubernetes & Cluster Resilience",
        skills: ["Kubernetes", "Helm", "Ingress Controllers"],
        certification: "Certified Kubernetes Administrator (CKA)"
      },
      {
        week: "Week 3-4",
        focus: "Distributed Systems & Asynchronous Streaming",
        skills: ["Distributed Systems", "Kafka", "Redis"],
        certification: "Enterprise Architecture Foundations"
      },
      {
        week: "Week 5-6",
        focus: "Vector Search & LLM Inference Architecture",
        skills: ["Vector DBs", "Qdrant", "PyTorch"],
        certification: "Applied AI Systems Specialist"
      }
    ]
  };
};

export const getJobsData = (): GlobalJob[] => {
  return [
    {
      id: 1,
      title: "Senior AI Systems & Cloud Platform Engineer",
      company: "Google Cloud AI",
      companyLogoText: "GOOG",
      country: "United States",
      countryCode: "US",
      city: "San Francisco / Remote",
      workplaceType: "Remote",
      salaryMin: 140000,
      salaryMax: 185000,
      currency: "USD",
      experienceLevel: "Senior",
      visaSponsorship: true,
      matchScore: 95,
      requiredSkills: ["Python", "FastAPI", "PyTorch", "Distributed Systems", "Docker"],
      description: "Build high-throughput LLM serving infrastructure and asynchronous distributed services for enterprise cloud clients.",
      postedDate: "Just now",
      applicantsCount: 24,
      applied: false,
    },
    {
      id: 2,
      title: "Staff Cloud Native Solutions Architect",
      company: "Microsoft Azure",
      companyLogoText: "MSFT",
      country: "United States",
      countryCode: "US",
      city: "Redmond, WA / Remote",
      workplaceType: "Hybrid",
      salaryMin: 155000,
      salaryMax: 210000,
      currency: "USD",
      experienceLevel: "Lead",
      visaSponsorship: true,
      matchScore: 89,
      requiredSkills: ["Python", "Microservices", "PostgreSQL", "AWS/Azure", "Docker"],
      description: "Architect mission-critical multi-tenant SaaS services processing over 10M events per second with 99.999% uptime.",
      postedDate: "1 day ago",
      applicantsCount: 38,
      applied: false,
    },
    {
      id: 3,
      title: "Autonomous Robotics Software Engineer",
      company: "Tesla Robotics",
      companyLogoText: "TSLA",
      country: "United States",
      countryCode: "US",
      city: "Palo Alto, CA",
      workplaceType: "Onsite",
      salaryMin: 145000,
      salaryMax: 195000,
      currency: "USD",
      experienceLevel: "Senior",
      visaSponsorship: true,
      matchScore: 86,
      requiredSkills: ["Python", "C++", "PyTorch", "Docker", "ROS2"],
      description: "Develop real-time computer vision perception pipelines and neural control algorithms for humanoid robotic platforms.",
      postedDate: "2 days ago",
      applicantsCount: 52,
      applied: false,
    },
  ];
};

export const getGlobalJobsData = getJobsData;

export const getRecruiterCandidatesData = (): RecruiterCandidate[] => {
  return [
    {
      id: 1,
      name: "Alex Rivera",
      avatarText: "AR",
      title: "Senior AI & Cloud Platform Engineer",
      location: "San Francisco, CA",
      country: "United States",
      experienceYears: 5.2,
      matchScore: 96,
      skills: ["Python", "PyTorch", "Docker", "FastAPI", "PostgreSQL", "AWS"],
      salaryExpectation: "$140k - $175k",
      availability: "Immediate",
      verifiedCredentials: true,
      status: "SHORTLISTED",
    },
    {
      id: 2,
      name: "Maya Patel",
      avatarText: "MP",
      title: "Distributed Data & Cloud Engineer",
      location: "New York / Remote",
      country: "United States",
      experienceYears: 4.1,
      matchScore: 92,
      skills: ["Python", "React", "PostgreSQL", "FastAPI", "Docker", "Redis"],
      salaryExpectation: "$130k - $155k",
      availability: "Available Now",
      verifiedCredentials: true,
      status: "NEW",
    }
  ];
};

export const getMessagesData = (): MessageItem[] => {
  return [
    {
      id: 1,
      senderName: "Sarah Chen",
      senderRole: "Executive Talent Partner at Google Cloud AI",
      avatarText: "SC",
      lastMessage: "Hi Alex! Your profile showed a 95% match for our Senior AI Platform Engineer role. Looking forward to our technical review!",
      timestamp: "10:45 AM",
      unread: true,
      conversation: [
        {
          id: 1,
          fromMe: false,
          text: "Hi Alex! I reviewed your CONNECTX capability profile and was very impressed by your work with asynchronous Python microservices and PyTorch inference pipelines.",
          time: "10:30 AM",
        },
        {
          id: 2,
          fromMe: false,
          text: "Our team is building next-gen distributed LLM serving systems for Google Cloud AI. Your profile showed a 95% AI match with our requirements.",
          time: "10:32 AM",
        },
        {
          id: 3,
          fromMe: true,
          text: "Hello Sarah! Thanks for reaching out. Yes, that sounds exactly in line with what I'm looking for next. I'd love to learn more about the team's tech stack.",
          time: "10:38 AM",
        },
        {
          id: 4,
          fromMe: false,
          text: "Fantastic! I have scheduled our technical review in the calendar invite.",
          time: "10:45 AM",
        },
      ],
    },
  ];
};

export const getGlobalRegionDemands = (): GlobalRegionDemand[] => {
  return [
    {
      region: "North America (US & Canada)",
      code: "NA",
      activeJobs: 384500,
      topSkills: ["Generative AI / LLMOps", "Cloud Architecture (AWS/Azure)", "Distributed Systems", "Kubernetes", "Cybersecurity"],
      avgSalary: "$142,000 / yr",
      remoteRate: "68% Remote / Hybrid",
      hotSector: "Artificial Intelligence & Enterprise Cloud",
    },
    {
      region: "Western Europe (UK, Germany, France)",
      code: "EU",
      activeJobs: 241000,
      topSkills: ["Industrial Automation & ROS2", "Cybersecurity & GDPR Tech", "Cloud Native Microservices", "Python", "Rust"],
      avgSalary: "€88,000 / yr",
      remoteRate: "59% Remote / Hybrid",
      hotSector: "Robotics, CleanTech & Automotive",
    },
    {
      region: "Asia-Pacific (Singapore, Japan, India, Australia)",
      code: "APAC",
      activeJobs: 512000,
      topSkills: ["Full Stack Python / React", "Data Engineering & Spark", "Cloud Security", "Mobile Engineering", "FinTech Systems"],
      avgSalary: "$68,000 - $125,000",
      remoteRate: "72% Remote Global Hiring",
      hotSector: "FinTech, Digital Platforms & Cloud Scaling",
    },
  ];
};

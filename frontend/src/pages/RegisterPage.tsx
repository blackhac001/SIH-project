import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Mail, Lock, User, Building2, Briefcase, GraduationCap, ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';

type AccountType = 'candidate' | 'company' | 'recruiter' | 'provider';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as AccountType) || 'candidate';
  const [accountType, setAccountType] = useState<AccountType>(initialType);

  // Common Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('Global');

  // Candidate Specific
  const [educationLevel, setEducationLevel] = useState('Graduate / B.Tech');
  const [skillsInput, setSkillsInput] = useState('Python, Machine Learning, Cloud Architecture');

  // Company Specific
  const [companyName, setCompanyName] = useState('');
  const [industrySector, setIndustrySector] = useState('Artificial Intelligence & Cloud');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  // Recruiter Specific
  const [recruiterCompany, setRecruiterCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('Technical Talent Partner');

  // Provider Specific
  const [orgName, setOrgName] = useState('');
  const [providerType, setProviderType] = useState('POLYTECHNIC');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { registerCandidate, registerCompany, registerRecruiter, registerProvider } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const typeParam = searchParams.get('type') as AccountType;
    if (typeParam && ['candidate', 'company', 'recruiter', 'provider'].includes(typeParam)) {
      setAccountType(typeParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (accountType === 'candidate') {
        const skills = skillsInput.split(',').map((s) => s.trim()).filter(Boolean);
        await registerCandidate({
          full_name: fullName,
          email,
          password,
          phone_number: phone,
          education_level: educationLevel,
          skills,
          country,
          consent_given: true,
        });
        navigate('/candidate/dashboard');
      } else if (accountType === 'company') {
        await registerCompany({
          company_name: companyName || fullName,
          email,
          password,
          industry_sector: industrySector,
          website,
          address,
          country,
          phone_number: phone,
        });
        navigate('/company/dashboard');
      } else if (accountType === 'recruiter') {
        await registerRecruiter({
          full_name: fullName,
          email,
          password,
          company_name: recruiterCompany,
          job_title: jobTitle,
          phone_number: phone,
        });
        navigate('/recruiter/dashboard');
      } else if (accountType === 'provider') {
        await registerProvider({
          name: orgName || fullName,
          email,
          password,
          provider_type: providerType,
          country,
          address,
          phone_number: phone,
        });
        navigate('/provider/dashboard');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please check your information.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const accountTabs = [
    { id: 'candidate' as AccountType, label: 'Candidate', icon: User, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { id: 'company' as AccountType, label: 'Company', icon: Building2, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { id: 'recruiter' as AccountType, label: 'Recruiter', icon: Briefcase, color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' },
    { id: 'provider' as AccountType, label: 'Academy', icon: GraduationCap, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#080C15]">
      <div className="w-full max-w-xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Logo size="lg" showTagline to="/" className="justify-center" />
          <h2 className="text-2xl font-bold text-white pt-2">Join CONNECTX Global Platform</h2>
          <p className="text-xs text-slate-400">Select your account type to set up your dedicated workspace</p>
        </div>

        {/* Register Card */}
        <Card glow="purple" className="p-6 sm:p-8 space-y-6 shadow-2xl bg-slate-900/90 border-slate-800">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-xs text-rose-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Account Type Selector Tabs */}
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            {accountTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = accountType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setAccountType(tab.id);
                    setError(null);
                  }}
                  className={`py-2 px-2 text-xs font-semibold rounded-lg transition-all flex flex-col items-center gap-1 ${
                    isActive
                      ? tab.color
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="text-[11px]">{tab.label}</span>
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* CANDIDATE FORM FIELDS */}
            {accountType === 'candidate' && (
              <>
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Rivera"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Education Level
                    </label>
                    <input
                      type="text"
                      placeholder="B.Tech Computer Science"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={educationLevel}
                      onChange={(e) => setEducationLevel(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Country / Region
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. United States, India, Germany"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Core Technical Skills (comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Python, FastAPI, Machine Learning, React"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                    value={skillsInput}
                    onChange={(e) => setSkillsInput(e.target.value)}
                  />
                </div>
              </>
            )}

            {/* COMPANY FORM FIELDS */}
            {accountType === 'company' && (
              <>
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Registered Company Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vertex Systems Inc."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Industry Sector
                    </label>
                    <input
                      type="text"
                      placeholder="Cloud & AI Software"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={industrySector}
                      onChange={(e) => setIndustrySector(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://company.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* RECRUITER FORM FIELDS */}
            {accountType === 'recruiter' && (
              <>
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Recruiter Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Chen"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Represented Enterprise / Agency
                    </label>
                    <input
                      type="text"
                      placeholder="Global Staffing Partners"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={recruiterCompany}
                      onChange={(e) => setRecruiterCompany(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Professional Title
                    </label>
                    <input
                      type="text"
                      placeholder="Executive Talent Partner"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-blue-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* PROVIDER FORM FIELDS */}
            {accountType === 'provider' && (
              <>
                <div>
                  <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                    Institution / Academy Name
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. MIT Global Institute of Technology"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={orgName}
                      onChange={(e) => setOrgName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Organization Type
                    </label>
                    <select
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white focus:outline-none"
                      value={providerType}
                      onChange={(e) => setProviderType(e.target.value)}
                    >
                      <option value="POLYTECHNIC">Polytechnic / University</option>
                      <option value="PVT_ITI">Vocational Institute</option>
                      <option value="GOVT_ITI">Govt Vocational Centre</option>
                      <option value="PRIVATE_PARTNER">Industry Training Academy</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                      Campus Headquarters
                    </label>
                    <input
                      type="text"
                      placeholder="Cambridge, MA / Global"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {/* COMMON CREDENTIAL FIELDS */}
            <div>
              <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                Official Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="contact@organization.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs text-white placeholder-slate-600 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="cyber"
                size="md"
                type="submit"
                className="w-full"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create {accountType.charAt(0).toUpperCase() + accountType.slice(1)} Account
              </Button>
            </div>
          </form>
        </Card>

        {/* Footer Link */}
        <div className="text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">
            Sign In to Workspace
          </Link>
        </div>
      </div>
    </div>
  );
};

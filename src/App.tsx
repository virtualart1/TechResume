import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Code2, 
  FolderGit2, 
  ChevronRight, 
  ChevronLeft, 
  Download,
  Plus,
  Trash2,
  Github,
  Linkedin,
  Globe,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  Eye,
  Edit3
} from 'lucide-react';
import { ResumeData, INITIAL_DATA, TechRole, Experience, Education, Project } from './types';
import { cn } from './lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Constants & Predefined Options ---
const TECH_ROLES: TechRole[] = [
  'Software Engineer', 'Frontend Engineer', 'Backend Engineer', 
  'Full Stack Developer', 'DevOps Engineer', 'Data Scientist', 
  'ML Engineer', 'Data Engineer', 'Mobile Developer', 'Security Engineer'
];

const COMMON_SKILLS = {
  languages: ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'C++', 'Rust', 'Ruby', 'Swift', 'Kotlin'],
  frameworks: ['React', 'Next.js', 'Vue', 'Angular', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'FastAPI'],
  tools: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure', 'Git', 'CI/CD', 'Terraform', 'Jenkins', 'Linux'],
  databases: ['PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'Elasticsearch', 'DynamoDB', 'Supabase', 'Firebase']
};

// --- Components ---

const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { icon: User, label: 'Personal' },
    { icon: Briefcase, label: 'Experience' },
    { icon: GraduationCap, label: 'Education' },
    { icon: Code2, label: 'Skills' },
    { icon: FolderGit2, label: 'Projects' },
  ];

  return (
    <div className="flex items-center justify-between mb-8 px-4">
      {steps.map((step, idx) => {
        const Icon = step.icon;
        const isActive = idx === currentStep;
        const isCompleted = idx < currentStep;

        return (
          <React.Fragment key={idx}>
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                isActive ? "bg-black text-white scale-110 shadow-lg" : 
                isCompleted ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
              )}>
                {isCompleted ? <CheckCircle2 size={20} /> : <Icon size={20} />}
              </div>
              <span className={cn(
                "hidden sm:block text-[10px] uppercase tracking-wider font-semibold",
                isActive ? "text-black" : "text-gray-400"
              )}>{step.label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={cn(
                "h-[2px] flex-1 mx-2 sm:mx-4 transition-all duration-500",
                isCompleted ? "bg-green-500" : "bg-gray-100"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default function App() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [isExporting, setIsExporting] = useState(false);
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const resumeRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);

  // Handle responsive scaling for the A4 preview
  useEffect(() => {
    const updateScale = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.offsetWidth;
        const targetWidth = 794; // A4 width in px (210mm at 96dpi)
        const padding = 32; // 16px padding on each side
        const availableWidth = containerWidth - padding;
        
        if (availableWidth < targetWidth) {
          setPreviewScale(availableWidth / targetWidth);
        } else {
          setPreviewScale(1);
        }
      }
    };

    const observer = new ResizeObserver(updateScale);
    if (previewContainerRef.current) {
      observer.observe(previewContainerRef.current);
    }
    
    updateScale();
    return () => observer.disconnect();
  }, [mobileTab]);

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const updatePersonal = (field: keyof ResumeData['personal'], value: string) => {
    setData(prev => ({
      ...prev,
      personal: { ...prev.personal, [field]: value }
    }));
  };

  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      role: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ['']
    };
    setData(prev => ({ ...prev, experience: [...prev.experience, newExp] }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: string | boolean | string[]) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({ ...prev, experience: prev.experience.filter(exp => exp.id !== id) }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      school: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
    };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
  };

  const updateEducation = (id: string, field: keyof Education, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({ ...prev, education: prev.education.filter(edu => edu.id !== id) }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      technologies: []
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
  };

  const updateProject = (id: string, field: keyof Project, value: string | string[]) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    }));
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  const toggleSkill = (category: keyof ResumeData['skills'], skill: string) => {
    setData(prev => {
      const skills = prev.skills[category];
      const newSkills = skills.includes(skill) 
        ? skills.filter(s => s !== skill) 
        : [...skills, skill];
      return { ...prev, skills: { ...prev.skills, [category]: newSkills } };
    });
  };

  const exportToPDF = async () => {
    if (!resumeRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(resumeRef.current, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 1) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${data.personal.fullName.replace(/\s+/g, '_') || 'Resume'}.pdf`);
    } catch (error) {
      console.error('PDF Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col lg:flex-row">
      {/* Mobile Tabs */}
      <div className="lg:hidden flex border-b border-gray-200 bg-white sticky top-0 z-20">
        <button 
          onClick={() => setMobileTab('edit')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors",
            mobileTab === 'edit' ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Edit3 size={16} /> Edit
        </button>
        <button 
          onClick={() => setMobileTab('preview')}
          className={cn(
            "flex-1 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors",
            mobileTab === 'preview' ? "text-black border-b-2 border-black" : "text-gray-400 hover:text-gray-600"
          )}
        >
          <Eye size={16} /> Preview
        </button>
        {mobileTab === 'preview' && (
          <button 
            onClick={exportToPDF}
            disabled={isExporting}
            className="px-4 py-4 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 text-green-600 hover:text-green-700 transition-colors border-b-2 border-transparent"
          >
            <Download size={16} />
          </button>
        )}
      </div>

      {/* Left Side: Wizard */}
      <div className={cn(
        "w-full lg:w-1/2 p-4 sm:p-6 lg:p-12 overflow-y-auto max-h-[calc(100vh-56px)] lg:max-h-screen border-r border-gray-100",
        mobileTab === 'preview' ? "hidden lg:block" : "block"
      )}>
        <div className="max-w-xl mx-auto">
          <header className="mb-8 lg:mb-12">
            <h1 className="text-3xl font-bold tracking-tight mb-2">TechResume Pro</h1>
            <p className="text-gray-500">Create a high-impact resume for your next tech role.</p>
          </header>

          <StepIndicator currentStep={step} />

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Full Name</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="Aarav Patel"
                        value={data.personal.fullName}
                        onChange={e => updatePersonal('fullName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Target Role</label>
                      <select 
                        className="input-field"
                        value={data.personal.role}
                        onChange={e => updatePersonal('role', e.target.value)}
                      >
                        <option value="">Select Role</option>
                        {TECH_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Email</label>
                      <input 
                        type="email" 
                        className="input-field" 
                        placeholder="aarav@example.com"
                        value={data.personal.email}
                        onChange={e => updatePersonal('email', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                      <input 
                        type="tel" 
                        className="input-field" 
                        placeholder="+91 98765 43210"
                        value={data.personal.phone}
                        onChange={e => updatePersonal('phone', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Location</label>
                    <input 
                      type="text" 
                      className="input-field" 
                      placeholder="Bengaluru, Karnataka"
                      value={data.personal.location}
                      onChange={e => updatePersonal('location', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">GitHub</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="github.com/user"
                        value={data.personal.github}
                        onChange={e => updatePersonal('github', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">LinkedIn</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="linkedin.com/in/user"
                        value={data.personal.linkedin}
                        onChange={e => updatePersonal('linkedin', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-gray-500">Portfolio</label>
                      <input 
                        type="text" 
                        className="input-field" 
                        placeholder="portfolio.com"
                        value={data.personal.website}
                        onChange={e => updatePersonal('website', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-gray-500">Professional Summary</label>
                    <textarea 
                      className="input-field min-h-[120px]" 
                      placeholder="Briefly describe your expertise and career goals..."
                      value={data.personal.summary}
                      onChange={e => updatePersonal('summary', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* Step 1: Experience */}
              {step === 1 && (
                <div className="space-y-6">
                  {data.experience.map((exp, idx) => (
                    <div key={exp.id} className="glass-card p-6 space-y-4 relative group">
                      <button 
                        onClick={() => removeExperience(exp.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Company</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            value={exp.company}
                            onChange={e => updateExperience(exp.id, 'company', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Role</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            value={exp.role}
                            onChange={e => updateExperience(exp.id, 'role', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Start Date</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="MM/YYYY"
                            value={exp.startDate}
                            onChange={e => updateExperience(exp.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">End Date</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="MM/YYYY or Present"
                            value={exp.endDate}
                            onChange={e => updateExperience(exp.id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Key Achievements (One per line)</label>
                        <textarea 
                          className="input-field min-h-[100px]" 
                          value={exp.description.join('\n')}
                          onChange={e => updateExperience(exp.id, 'description', e.target.value.split('\n'))}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={addExperience} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> Add Experience
                  </button>
                </div>
              )}

              {/* Step 2: Education */}
              {step === 2 && (
                <div className="space-y-6">
                  {data.education.map((edu) => (
                    <div key={edu.id} className="glass-card p-6 space-y-4 relative">
                      <button 
                        onClick={() => removeEducation(edu.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">School / University</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={edu.school}
                          onChange={e => updateEducation(edu.id, 'school', e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Degree</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="B.Tech, M.Tech, etc."
                            value={edu.degree}
                            onChange={e => updateEducation(edu.id, 'degree', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Field of Study</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="Computer Science"
                            value={edu.field}
                            onChange={e => updateEducation(edu.id, 'field', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">Start Date</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="YYYY"
                            value={edu.startDate}
                            onChange={e => updateEducation(edu.id, 'startDate', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase text-gray-500">End Date</label>
                          <input 
                            type="text" 
                            className="input-field" 
                            placeholder="YYYY"
                            value={edu.endDate}
                            onChange={e => updateEducation(edu.id, 'endDate', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button onClick={addEducation} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> Add Education
                  </button>
                </div>
              )}

              {/* Step 3: Skills */}
              {step === 3 && (
                <div className="space-y-8">
                  {(Object.keys(COMMON_SKILLS) as Array<keyof typeof COMMON_SKILLS>).map((category) => (
                    <div key={category} className="space-y-3">
                      <label className="text-xs font-bold uppercase text-gray-500">{category}</label>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_SKILLS[category].map(skill => (
                          <button
                            key={skill}
                            onClick={() => toggleSkill(category, skill)}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
                              data.skills[category].includes(skill)
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
                            )}
                          >
                            {skill}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Step 4: Projects */}
              {step === 4 && (
                <div className="space-y-6">
                  {data.projects.map((proj) => (
                    <div key={proj.id} className="glass-card p-6 space-y-4 relative">
                      <button 
                        onClick={() => removeProject(proj.id)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Project Name</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          value={proj.name}
                          onChange={e => updateProject(proj.id, 'name', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Description</label>
                        <textarea 
                          className="input-field min-h-[80px]" 
                          value={proj.description}
                          onChange={e => updateProject(proj.id, 'description', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-gray-500">Technologies (Comma separated)</label>
                        <input 
                          type="text" 
                          className="input-field" 
                          placeholder="React, Node.js, AWS"
                          value={proj.technologies.join(', ')}
                          onChange={e => updateProject(proj.id, 'technologies', e.target.value.split(',').map(s => s.trim()))}
                        />
                      </div>
                    </div>
                  ))}
                  <button onClick={addProject} className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-black hover:text-black transition-all flex items-center justify-center gap-2">
                    <Plus size={20} /> Add Project
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <footer className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <button 
                onClick={prevStep}
                disabled={step === 0}
                className="btn-secondary flex items-center gap-2"
              >
                <ChevronLeft size={20} /> Previous
              </button>
              {step === 4 ? (
                <button 
                  onClick={exportToPDF}
                  disabled={isExporting}
                  className="btn-primary flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                  {isExporting ? 'Generating...' : <><Download size={20} /> Download PDF</>}
                </button>
              ) : (
                <button 
                  onClick={nextStep}
                  className="btn-primary flex items-center gap-2"
                >
                  Next <ChevronRight size={20} />
                </button>
              )}
            </div>
            <div className="text-center text-sm text-gray-500">
              Created by <a href="https://surajmishra.site" target="_blank" rel="noopener noreferrer" className="text-black hover:underline font-medium">Suraj Mishra</a>
            </div>
          </footer>
        </div>
      </div>

      {/* Right Side: Preview */}
      <div className={cn(
        "w-full lg:w-1/2 bg-gray-100 p-4 sm:p-6 lg:p-12 overflow-y-auto max-h-[calc(100vh-56px)] lg:max-h-screen flex justify-center",
        mobileTab === 'edit' ? "hidden lg:flex" : "flex"
      )}>
        <div ref={previewContainerRef} className="w-full flex justify-center sticky top-4 lg:top-12 h-fit">
          {/* Scaled Wrapper */}
          <div 
            className="shadow-2xl"
            style={{ 
              transform: `scale(${previewScale})`, 
              transformOrigin: 'top center',
              width: '794px',
              marginBottom: `-${1123 * (1 - previewScale)}px` // Prevent extra scroll space
            }}
          >
            <div 
              ref={resumeRef}
              className="bg-white min-h-[1123px] p-12 text-[#1a1a1a] font-sans"
            >
              {/* Header */}
            <header className="border-b-2 border-black pb-8 mb-8">
              <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">
                {data.personal.fullName || 'Your Name'}
              </h2>
              <p className="text-xl font-medium text-[#4b5563] mb-6">
                {data.personal.role || 'Target Role'}
              </p>
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm font-medium">
                {data.personal.email && (
                  <span className="flex items-center gap-1.5"><Mail size={14} /> {data.personal.email}</span>
                )}
                {data.personal.phone && (
                  <span className="flex items-center gap-1.5"><Phone size={14} /> {data.personal.phone}</span>
                )}
                {data.personal.location && (
                  <span className="flex items-center gap-1.5"><MapPin size={14} /> {data.personal.location}</span>
                )}
                {data.personal.github && (
                  <span className="flex items-center gap-1.5"><Github size={14} /> {data.personal.github}</span>
                )}
                {data.personal.linkedin && (
                  <span className="flex items-center gap-1.5"><Linkedin size={14} /> {data.personal.linkedin}</span>
                )}
                {data.personal.website && (
                  <span className="flex items-center gap-1.5"><Globe size={14} /> {data.personal.website}</span>
                )}
              </div>
            </header>

            <div className="space-y-8">
              {/* Summary */}
              {data.personal.summary && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-3">Professional Summary</h3>
                  <p className="text-[15px] leading-relaxed text-[#1f2937]">{data.personal.summary}</p>
                </section>
              )}

              {/* Experience */}
              {data.experience.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4">Work Experience</h3>
                  <div className="space-y-6">
                    {data.experience.map((exp) => (
                      <div key={exp.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-lg">{exp.role}</h4>
                          <span className="text-sm font-bold text-[#6b7280]">{exp.startDate} — {exp.endDate}</span>
                        </div>
                        <div className="text-sm font-bold text-[#4b5563] mb-3">{exp.company}</div>
                        <ul className="list-disc list-outside ml-4 space-y-1.5">
                          {exp.description.map((bullet, i) => bullet && (
                            <li key={i} className="text-[14px] text-[#374151] leading-snug">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Skills */}
              {(data.skills.languages.length > 0 || data.skills.frameworks.length > 0 || data.skills.tools.length > 0) && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4">Technical Skills</h3>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                    {data.skills.languages.length > 0 && (
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#9ca3af] block mb-1">Languages</span>
                        <p className="text-[14px] font-medium">{data.skills.languages.join(', ')}</p>
                      </div>
                    )}
                    {data.skills.frameworks.length > 0 && (
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#9ca3af] block mb-1">Frameworks</span>
                        <p className="text-[14px] font-medium">{data.skills.frameworks.join(', ')}</p>
                      </div>
                    )}
                    {data.skills.tools.length > 0 && (
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#9ca3af] block mb-1">Tools & Cloud</span>
                        <p className="text-[14px] font-medium">{data.skills.tools.join(', ')}</p>
                      </div>
                    )}
                    {data.skills.databases.length > 0 && (
                      <div>
                        <span className="text-[11px] font-black uppercase text-[#9ca3af] block mb-1">Databases</span>
                        <p className="text-[14px] font-medium">{data.skills.databases.join(', ')}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Projects */}
              {data.projects.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4">Key Projects</h3>
                  <div className="space-y-4">
                    {data.projects.map((proj) => (
                      <div key={proj.id}>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-[15px]">{proj.name}</h4>
                          <span className="text-[12px] font-mono text-[#6b7280]">{proj.technologies.join(' • ')}</span>
                        </div>
                        <p className="text-[14px] text-[#374151] leading-snug">{proj.description}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Education */}
              {data.education.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[#9ca3af] mb-4">Education</h3>
                  <div className="space-y-4">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-[15px]">{edu.school}</h4>
                          <div className="text-[14px] text-[#4b5563]">{edu.degree} in {edu.field}</div>
                        </div>
                        <span className="text-[12px] font-bold text-[#6b7280]">{edu.startDate} — {edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}

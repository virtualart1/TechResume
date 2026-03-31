export type TechRole = 
  | 'Frontend Engineer' 
  | 'Backend Engineer' 
  | 'Full Stack Developer' 
  | 'Software Engineer' 
  | 'DevOps Engineer' 
  | 'Data Scientist' 
  | 'ML Engineer' 
  | 'Data Engineer' 
  | 'Mobile Developer' 
  | 'Security Engineer';

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
    summary: string;
    role: TechRole | string;
  };
  experience: Experience[];
  education: Education[];
  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
    databases: string[];
  };
  projects: Project[];
}

export const INITIAL_DATA: ResumeData = {
  personal: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    github: '',
    linkedin: '',
    summary: '',
    role: '',
  },
  experience: [],
  education: [],
  skills: {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
  },
  projects: [],
};

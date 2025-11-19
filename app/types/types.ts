export interface Job {
  job_id: string;
  title: string;
  description: string;
  category: string;
  budget: number;
  deadline: string;
  location: string;
  status: string;
  image_url: string;
  user: User;
  requiredSkills: string;
}

export interface Client {
  user_id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  image_url: string;
  jobs: Job[];
}

export interface ApplicationRequest {
  id: string;
  job_id: string;
  user_id: number;
  status: string;
  created_at: string;
  cover_letter: string;
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  bio: string;
  location: string;
  image_url: string;
  jobs: Job[];
  userSkills: Skill[];
}

export interface Skill {
  skill_id: number;
  name: string;
}

export interface Application {
  application_id: number;
  job_id: number;
  user_id: number;
  status: string;
  created_at: string;
  cover_letter: string;
  job: Job;
  user: User;
}
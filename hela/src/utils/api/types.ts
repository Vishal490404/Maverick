// API response interfaces
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
}

// User related types
export interface UserData {
  username: string;
  email: string;
  full_name: string;
  is_superuser: boolean;
  contact_number?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  full_name: string;
  contact_number?: string;
  is_superuser?: boolean;
}

// Paper and curriculum related types
export interface Standard {
  id: string;
  name: string;
  description?: string;
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
}

export interface Topic {
  id: string;
  title: string;
  name?: string; // For curriculum APIs that use name instead of title
  description?: string;
  selected?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  name?: string; // For curriculum APIs that use name instead of title
  description?: string;
  selected?: boolean;
  topics?: Topic[];
}

export interface QuestionType {
  id: string;
  title?: string;
  name: string; // For curriculum APIs that use name instead of title
  description?: string;
  usage_count?: number;
  selected?: boolean;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  color: string;
  usage_count?: number;
}

export interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  standard_id: string;
  standard_name: string;
  subject_id: string;
  subject_name: string;
  question_count: number;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export interface Question {
  id: string;
  question_text: string;
  question_type_id: string;
  question_type_name: string;
  difficulty_level: string;
  marks: number;
  image_required: boolean;
  images?: string[];
  topic_id: string;
  chapter_id: string;
  subject_id: string;
  standard_id: string;
  tags?: string[];
  created_at: string;
  created_by: string;
  updated_at: string;
  updated_by: string;
}

export interface ScanResult {
  questions: Array<{
    question_text: string;
    image_required: boolean;
    difficulty_level?: string;
    marks?: number;
  }>;
}
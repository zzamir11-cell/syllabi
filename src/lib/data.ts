import {
  Qualification,
  ExamBoard,
  Subject,
  Topic,
  Resource,
  UserProfile,
  Collection,
  ResourceRequest,
  Report,
} from './types';

export const INITIAL_QUALIFICATIONS: Qualification[] = [
  {
    id: 'qual-gcse',
    slug: 'gcse',
    name: 'GCSE',
    description: 'General Certificate of Secondary Education (UK & Northern Ireland)',
  },
  {
    id: 'qual-alevel',
    slug: 'a-level',
    name: 'A-Level',
    description: 'General Certificate of Education Advanced Level',
  },
  {
    id: 'qual-igcse',
    slug: 'igcse',
    name: 'Cambridge IGCSE',
    description: 'International General Certificate of Secondary Education',
  },
  {
    id: 'qual-ial',
    slug: 'international-a-level',
    name: 'International A-Level',
    description: 'Pearson Edexcel & Cambridge International A-Levels',
  },
];

export const INITIAL_EXAM_BOARDS: ExamBoard[] = [
  {
    id: 'board-aqa',
    slug: 'aqa',
    name: 'AQA',
    code: 'AQA',
    description: 'Assessment and Qualifications Alliance',
  },
  {
    id: 'board-edexcel',
    slug: 'edexcel',
    name: 'Pearson Edexcel',
    code: 'Edexcel',
    description: 'Pearson Edexcel Qualifications',
  },
  {
    id: 'board-ocr',
    slug: 'ocr',
    name: 'OCR',
    code: 'OCR',
    description: 'Oxford, Cambridge and RSA Examinations',
  },
  {
    id: 'board-cambridge',
    slug: 'cambridge-international',
    name: 'Cambridge International',
    code: 'CAIE',
    description: 'Cambridge Assessment International Education',
  },
  {
    id: 'board-eduqas',
    slug: 'eduqas',
    name: 'WJEC Eduqas',
    code: 'Eduqas',
    description: 'WJEC Eduqas Qualifications',
  },
  {
    id: 'board-ccea',
    slug: 'ccea',
    name: 'CCEA',
    code: 'CCEA',
    description: 'Northern Ireland Council for the Curriculum, Examinations & Assessment',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'sub-chem', slug: 'chemistry', name: 'Chemistry', category: 'Sciences' },
  { id: 'sub-bio', slug: 'biology', name: 'Biology', category: 'Sciences' },
  { id: 'sub-phys', slug: 'physics', name: 'Physics', category: 'Sciences' },
  { id: 'sub-maths', slug: 'mathematics', name: 'Mathematics', category: 'Mathematics' },
  { id: 'sub-further-maths', slug: 'further-maths', name: 'Further Mathematics', category: 'Mathematics' },
  { id: 'sub-eng-lit', slug: 'english-literature', name: 'English Literature', category: 'Humanities' },
  { id: 'sub-eng-lang', slug: 'english-language', name: 'English Language', category: 'Humanities' },
  { id: 'sub-hist', slug: 'history', name: 'History', category: 'Humanities' },
  { id: 'sub-geog', slug: 'geography', name: 'Geography', category: 'Humanities' },
  { id: 'sub-cs', slug: 'computer-science', name: 'Computer Science', category: 'Arts & Technical' },
  { id: 'sub-econ', slug: 'economics', name: 'Economics', category: 'Humanities' },
  { id: 'sub-psych', slug: 'psychology', name: 'Psychology', category: 'Sciences' },
];

export const INITIAL_TOPICS: Topic[] = [
  { id: 'top-c6', subjectId: 'sub-chem', name: 'Electrolysis & Chemical Changes', slug: 'electrolysis-chemical-changes' },
  { id: 'top-c4', subjectId: 'sub-chem', name: 'Atomic Structure & Periodic Table', slug: 'atomic-structure' },
  { id: 'top-b1', subjectId: 'sub-bio', name: 'Cell Biology & Microscopy', slug: 'cell-biology' },
  { id: 'top-b5', subjectId: 'sub-bio', name: 'Photosynthesis & Respiration', slug: 'photosynthesis-respiration' },
  { id: 'top-m-calc', subjectId: 'sub-maths', name: 'Calculus & Integration', slug: 'calculus-integration' },
  { id: 'top-lit-macbeth', subjectId: 'sub-eng-lit', name: 'Macbeth — Themes & Quotations', slug: 'macbeth-themes' },
  { id: 'top-cs-arch', subjectId: 'sub-cs', name: 'Systems Architecture & Fetch-Execute', slug: 'systems-architecture' },
];

export const INITIAL_CREATORS: UserProfile[] = [];
export const INITIAL_RESOURCES: Resource[] = [];
export const INITIAL_COLLECTIONS: Collection[] = [];
export const INITIAL_REQUESTS: ResourceRequest[] = [];
export const INITIAL_REPORTS: Report[] = [];

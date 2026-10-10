export type Qualification = {
  id: string;
  slug: string;
  name: string;
  description?: string;
};

export type ExamBoard = {
  id: string;
  slug: string;
  name: string;
  code: string;
  description?: string;
};

export type Subject = {
  id: string;
  slug: string;
  name: string;
  category: 'Sciences' | 'Mathematics' | 'Humanities' | 'Languages' | 'Arts & Technical';
  iconName?: string;
};

export type Topic = {
  id: string;
  subjectId: string;
  qualificationId?: string;
  examBoardId?: string;
  name: string;
  slug: string;
};

export type ResourceType =
  | 'Revision notes'
  | 'Revision guides'
  | 'Mind maps'
  | 'Flashcards'
  | 'Topic summaries'
  | 'Formula sheets'
  | 'Essay plans'
  | 'Essay examples'
  | 'Coursework guidance'
  | 'Study checklists'
  | 'Diagrams'
  | 'Personal revision resources';

export type UserProfile = {
  id: string;
  username: string;
  fullName?: string;
  bio?: string;
  avatarUrl?: string;
  qualification?: string;
  examBoard?: string;
  targetGrades?: string;
  subjects: string[];
  isPublic: boolean;
  showActivity: boolean;
  allowIndexing: boolean;
  role: 'student' | 'moderator' | 'admin';
  resourcesCount: number;
  totalViews: number;
  totalSaves: number;
  reputationTitle?: string;
  createdAt: string;
};

export type Resource = {
  id: string;
  creatorId: string;
  creatorUsername: string;
  creatorReputation?: string;
  title: string;
  slug: string;
  description: string;
  qualificationId: string;
  qualificationName: string;
  examBoardId: string;
  examBoardName: string;
  subjectId: string;
  subjectName: string;
  topicId?: string;
  topicName?: string;
  resourceType: ResourceType;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  pageCount: number;
  tags: string[];
  viewsCount: number;
  downloadsCount: number;
  savesCount: number;
  ratingAvg: number;
  ratingCount: number;
  qualityBreakdown: {
    helpful: number;
    clarity: number;
    examFocus: number;
    organization: number;
  };
  status: 'published' | 'under_review' | 'removed';
  copyrightConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  previewPages?: string[];
  previewUrl?: string;
  isFeatured?: boolean;
};

export type Collection = {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  visibility: 'public' | 'private' | 'unlisted';
  slug: string;
  resourcesCount: number;
  resources?: Resource[];
  createdAt: string;
  updatedAt: string;
};

export type ResourceRequest = {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  qualificationName: string;
  examBoardName: string;
  subjectName: string;
  topicName?: string;
  status: 'open' | 'fulfilled';
  fulfilledResourceId?: string;
  createdAt: string;
};

export type Report = {
  id: string;
  reporterId: string;
  reporterUsername: string;
  targetType: 'resource' | 'profile' | 'request';
  targetId: string;
  targetTitle: string;
  reason:
    | 'copyright'
    | 'plagiarism'
    | 'official_exam_material'
    | 'harassment'
    | 'hate_abuse'
    | 'sexual_content'
    | 'dangerous_content'
    | 'spam'
    | 'misleading'
    | 'other';
  description: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolutionNotes?: string;
  resolvedBy?: string;
  createdAt: string;
};

export type RatingReview = {
  id: string;
  userId: string;
  username: string;
  resourceId: string;
  helpfulScore: number;
  clarityScore: number;
  examFocusScore: number;
  organizationScore: number;
  overallScore: number;
  reviewText: string;
  createdAt: string;
};

export type ShareCardStyle =
  | 'new_upload'
  | 'resource_stats'
  | 'study_achievement'
  | 'popular_resource';

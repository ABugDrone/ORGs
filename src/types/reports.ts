// Reports Module Type Definitions

export type Period = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export interface FileAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export interface Report {
  id: string;
  title: string;
  content: string;
  period: Period;
  departmentId: string;
  subdepartmentId?: string;
  authorId: string;
  authorName: string;
  tags: string[];
  attachments: FileAttachment[];
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface CreateReportInput {
  title: string;
  content: string;
  period: Period;
  tags: string[];
  attachments: File[];
}

export interface UpdateReportInput {
  title?: string;
  content?: string;
  period?: Period;
  tags?: string[];
  attachments?: FileAttachment[];
  newAttachments?: File[];
}

export interface AISummary {
  reportId: string;
  summary: string;
  generatedAt: string;
  bulletPoints: string[];
}

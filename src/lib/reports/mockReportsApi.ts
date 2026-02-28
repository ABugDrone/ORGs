import type { User } from "@/data/mockData";
import type { Report, CreateReportInput, UpdateReportInput, FileAttachment } from "@/types/reports";

const generateId = () => crypto.randomUUID();

class MockReportsAPI {
  private reports: Report[] = [];
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getReports(): Promise<Report[]> {
    await this.delay(300);
    return [...this.reports];
  }

  async getReportById(id: string): Promise<Report> {
    await this.delay(200);
    const report = this.reports.find(r => r.id === id);
    if (!report) throw new Error("Report not found");
    return report;
  }

  async createReport(input: CreateReportInput, user: User): Promise<Report> {
    await this.delay(500);
    const report: Report = {
      id: generateId(),
      title: input.title,
      content: input.content,
      period: input.period,
      tags: input.tags,
      departmentId: user.departmentId,
      subdepartmentId: user.subdepartmentId,
      authorId: user.id,
      authorName: user.name,
      attachments: await this.processAttachments(input.attachments),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      approvalStatus: 'pending'
    };
    this.reports.push(report);
    this.persist();
    return report;
  }

  async updateReport(id: string, input: UpdateReportInput, userId: string): Promise<Report> {
    await this.delay(400);
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Report not found");
    
    const existingReport = this.reports[index];
    let attachments = existingReport.attachments;

    // Handle new attachments if provided
    if (input.newAttachments && input.newAttachments.length > 0) {
      const newProcessedAttachments = await this.processAttachments(input.newAttachments);
      attachments = [...attachments, ...newProcessedAttachments];
    }

    // Use provided attachments if explicitly set (for removal scenarios)
    if (input.attachments !== undefined) {
      attachments = input.attachments;
    }

    this.reports[index] = {
      ...existingReport,
      title: input.title ?? existingReport.title,
      content: input.content ?? existingReport.content,
      period: input.period ?? existingReport.period,
      tags: input.tags ?? existingReport.tags,
      attachments,
      updatedAt: new Date().toISOString(),
      lastEditedBy: userId,
    };
    this.persist();
    return this.reports[index];
  }

  async deleteReport(id: string): Promise<void> {
    await this.delay(300);
    this.reports = this.reports.filter(r => r.id !== id);
    this.persist();
  }

  async approveReport(id: string, adminId: string, adminName: string): Promise<Report> {
    await this.delay(300);
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Report not found");
    
    this.reports[index] = {
      ...this.reports[index],
      approvalStatus: 'approved',
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
      rejectionReason: undefined
    };
    this.persist();
    return this.reports[index];
  }

  async rejectReport(id: string, adminId: string, adminName: string, reason: string): Promise<Report> {
    await this.delay(300);
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Report not found");
    
    this.reports[index] = {
      ...this.reports[index],
      approvalStatus: 'rejected',
      approvedBy: adminName,
      approvedAt: new Date().toISOString(),
      rejectionReason: reason
    };
    this.persist();
    return this.reports[index];
  }

  private async processAttachments(files: File[]): Promise<FileAttachment[]> {
    return Promise.all(files.map(async (file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: await this.fileToDataURL(file),
      uploadedAt: new Date().toISOString(),
    })));
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private persist() {
    localStorage.setItem("casi360_reports", JSON.stringify({
      reports: this.reports,
      lastSync: new Date().toISOString(),
    }));
  }

  loadFromStorage() {
    const stored = localStorage.getItem("casi360_reports");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.reports = data.reports || [];
      } catch (e) {
        console.error("Failed to load reports from storage", e);
      }
    }
  }
}

export const mockReportsApi = new MockReportsAPI();

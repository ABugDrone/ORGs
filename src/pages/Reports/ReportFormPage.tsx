import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useReports } from "@/hooks/useReports";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TagInput from "@/components/reports/TagInput";
import FileUpload from "@/components/reports/FileUpload";
import type { Period } from "@/types/reports";
import { toast } from "sonner";

const ReportFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { createReport, updateReport, getReport } = useReports();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [period, setPeriod] = useState<Period>("monthly");
  const [tags, setTags] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const isEditMode = !!id;

  useEffect(() => {
    if (isEditMode) {
      const report = getReport(id);
      if (report) {
        setTitle(report.title);
        setContent(report.content);
        setPeriod(report.period);
        setTags(report.tags);
      }
    }
  }, [id, isEditMode, getReport]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setLoading(true);
    try {
      if (isEditMode) {
        await updateReport(id, {
          title,
          content,
          period,
          tags,
        });
        toast.success("Report updated successfully");
        navigate(`/reports/${id}`);
      } else {
        const newReport = await createReport({
          title,
          content,
          period,
          tags,
          attachments: files,
        });
        toast.success("Report created successfully");
        navigate(`/reports/${newReport.id}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-heading text-2xl">
            {isEditMode ? "Edit Report" : "Create New Report"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter report title"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={period} onValueChange={(value) => setPeriod(value as Period)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Enter report content"
                className="min-h-[200px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags</label>
              <TagInput tags={tags} onChange={setTags} />
            </div>

            {!isEditMode && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <FileUpload files={files} onChange={setFiles} />
              </div>
            )}

            <div className="flex gap-3">
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : isEditMode ? "Update Report" : "Create Report"}
              </Button>
              <Button
                type="button"
                variant="outline"
                asChild
              >
                <Link to="/reports">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportFormPage;

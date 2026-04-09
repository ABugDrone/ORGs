// ORGs — single user app, no roles or user management needed.
// Keeping departments as optional organizational tags for file categorization.

export interface Department {
  id: string;
  name: string;
  color: string;
}

export const departments: Department[] = [
  { id: "documents", name: "Documents", color: "199 89% 48%" },
  { id: "media", name: "Media", color: "142 76% 36%" },
  { id: "finance", name: "Finance", color: "25 95% 53%" },
  { id: "projects", name: "Projects", color: "262 83% 58%" },
  { id: "personal", name: "Personal", color: "280 89% 60%" },
  { id: "archive", name: "Archive", color: "340 82% 52%" },
];

export const getDepartment = (id: string) => departments.find((d) => d.id === id);
export const getDepartmentColor = (id: string) => getDepartment(id)?.color ?? "0 0% 50%";

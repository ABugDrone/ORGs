export type Role = "super_admin" | "dept_head" | "staff";

export interface Department {
  id: string;
  name: string;
  color: string;
  subdepartments: { id: string; name: string }[];
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  departmentId: string;
  subdepartmentId?: string;
  avatar: string;
  jobTitle: string;
}

export const departments: Department[] = [
  {
    id: "management",
    name: "Management",
    color: "199 89% 48%",
    subdepartments: [
      { id: "mgmt-strategy", name: "Strategy and Critical Decision" },
      { id: "mgmt-shareholders", name: "Shareholders/Investors" },
      { id: "mgmt-hr", name: "HR Management" },
      { id: "mgmt-va", name: "VA Management" },
    ],
  },
  {
    id: "finance",
    name: "Budget and Finance",
    color: "142 76% 36%",
    subdepartments: [
      { id: "fin-budget", name: "Budget and Expenses" },
      { id: "fin-income", name: "Income and Investment" },
      { id: "fin-records", name: "Records and Book Keeping" },
    ],
  },
  {
    id: "sales",
    name: "Sales and Marketing",
    color: "25 95% 53%",
    subdepartments: [
      { id: "sales-advertising", name: "Advertising" },
      { id: "sales-promotion", name: "Promotion and Event" },
      { id: "sales-strategy", name: "Products and Market Strategy" },
    ],
  },
  {
    id: "relations",
    name: "Public and Customer Relations",
    color: "262 83% 58%",
    subdepartments: [
      { id: "rel-crm", name: "CRM and Customer Care" },
      { id: "rel-legal", name: "Legal Advisory" },
      { id: "rel-public", name: "Public Relations" },
    ],
  },
  {
    id: "education",
    name: "Education, Research and Development",
    color: "280 89% 60%",
    subdepartments: [
      { id: "edu-teaching", name: "Teaching and Education Contents" },
      { id: "edu-research", name: "Research" },
      { id: "edu-development", name: "Development and Updates" },
    ],
  },
  {
    id: "it",
    name: "IT and Technical Support",
    color: "340 82% 52%",
    subdepartments: [
      { id: "it-troubleshoot", name: "Troubleshoots" },
      { id: "it-documentation", name: "Documentation Creation" },
    ],
  },
];

export const users: User[] = [
  {
    id: "U001",
    email: "admin@casi360.com",
    password: "admin123",
    name: "Adebayo Ogunlesi",
    role: "super_admin",
    departmentId: "management",
    subdepartmentId: "mgmt-strategy",
    avatar: "",
    jobTitle: "Super Administrator",
  },
  {
    id: "U002",
    email: "management@casi360.com",
    password: "mgmt1234",
    name: "Ngozi Okafor",
    role: "dept_head",
    departmentId: "management",
    subdepartmentId: "mgmt-hr",
    avatar: "",
    jobTitle: "HR Manager",
  },
  {
    id: "U003",
    email: "finance@casi360.com",
    password: "fin1234",
    name: "Amara Eze",
    role: "dept_head",
    departmentId: "finance",
    subdepartmentId: "fin-budget",
    avatar: "",
    jobTitle: "Finance Director",
  },
  {
    id: "U004",
    email: "sales@casi360.com",
    password: "sales1234",
    name: "Folake Adeyemi",
    role: "dept_head",
    departmentId: "sales",
    subdepartmentId: "sales-advertising",
    avatar: "",
    jobTitle: "Sales & Marketing Lead",
  },
  {
    id: "U005",
    email: "relations@casi360.com",
    password: "rel1234",
    name: "Ibrahim Musa",
    role: "dept_head",
    departmentId: "relations",
    subdepartmentId: "rel-crm",
    avatar: "",
    jobTitle: "Customer Relations Manager",
  },
  {
    id: "U006",
    email: "education@casi360.com",
    password: "edu1234",
    name: "Chioma Nwosu",
    role: "dept_head",
    departmentId: "education",
    subdepartmentId: "edu-research",
    avatar: "",
    jobTitle: "Research & Development Lead",
  },
  {
    id: "U007",
    email: "it@casi360.com",
    password: "it1234",
    name: "Tunde Bakare",
    role: "dept_head",
    departmentId: "it",
    subdepartmentId: "it-troubleshoot",
    avatar: "",
    jobTitle: "IT Support Manager",
  },
];

export const getDepartment = (id: string) => departments.find((d) => d.id === id);
export const getDepartmentColor = (id: string) => getDepartment(id)?.color ?? "0 0% 50%";

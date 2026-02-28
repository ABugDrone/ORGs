import React from "react";
import type { Period } from "@/types/reports";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PeriodFilterProps {
  selected: Period;
  onChange: (period: Period) => void;
}

const periods: { value: Period; label: string }[] = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annual", label: "Annual" },
];

const PeriodFilter: React.FC<PeriodFilterProps> = ({ selected, onChange }) => {
  return (
    <Tabs value={selected} onValueChange={(value) => onChange(value as Period)}>
      <TabsList className="w-full sm:w-auto">
        {periods.map((period) => (
          <TabsTrigger
            key={period.value}
            value={period.value}
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            {period.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default PeriodFilter;

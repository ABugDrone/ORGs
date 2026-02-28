import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useSearchContext } from '@/context/SearchContext';
import type { SearchFilters as Filters } from '@/types/search';

export function SearchFilters() {
  const { filters, updateFilters, clearFilters } = useSearchContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeFilterCount = Object.values(filters).filter(v => 
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== ''
  ).length;

  const formats = ['PDF', 'DOCX', 'XLSX', 'TXT', 'PNG', 'JPG'];
  
  const departments = JSON.parse(localStorage.getItem('departments') || '[]');

  return (
    <div className="w-full md:w-64 border-r bg-background p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-semibold">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? 'Show' : 'Hide'}
        </Button>
      </div>

      {!isCollapsed && (
        <>
          <div className="space-y-2">
            <Label>Name</Label>
            <Input
              placeholder="Filter by name..."
              value={filters.name || ''}
              onChange={(e) => updateFilters({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>File ID</Label>
            <Input
              placeholder="Filter by file ID..."
              value={filters.fileId || ''}
              onChange={(e) => updateFilters({ fileId: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <div className="space-y-2">
              {formats.map((format) => (
                <div key={format} className="flex items-center space-x-2">
                  <Checkbox
                    id={`format-${format}`}
                    checked={filters.formats?.includes(format) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.formats || [];
                      updateFilters({
                        formats: checked
                          ? [...current, format]
                          : current.filter(f => f !== format)
                      });
                    }}
                  />
                  <label htmlFor={`format-${format}`} className="text-sm">
                    {format}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Department</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {departments.map((dept: any) => (
                <div key={dept.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`dept-${dept.id}`}
                    checked={filters.departmentIds?.includes(dept.id) || false}
                    onCheckedChange={(checked) => {
                      const current = filters.departmentIds || [];
                      updateFilters({
                        departmentIds: checked
                          ? [...current, dept.id]
                          : current.filter(d => d !== dept.id)
                      });
                    }}
                  />
                  <label htmlFor={`dept-${dept.id}`} className="text-sm">
                    {dept.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="w-full"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          )}
        </>
      )}
    </div>
  );
}

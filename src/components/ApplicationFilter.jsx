import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, X } from 'lucide-react';
import { format, subDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { statusOptions } from '@/lib/jobApplicationStore';

const ApplicationFilter = ({ onFilterChange, onReset }) => {
  const [filters, setFilters] = useState({
    company: '',
    base: '',
    status: '',
    applicationDateStart: null,
    applicationDateEnd: null,
    updateDateStart: null,
    updateDateEnd: null
  });

  const handleInputChange = (field, value) => {
    // 处理状态选择的特殊值
    const processedValue = field === 'status' && value === 'all' ? '' : value;
    const newFilters = { ...filters, [field]: processedValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateSelect = (field, date) => {
    const newFilters = { ...filters, [field]: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleQuickDateSelect = (field, days) => {
    const date = subDays(new Date(), days);
    const dateField = field === 'application' ? 'applicationDateStart' : 'updateDateStart';
    const newFilters = { ...filters, [dateField]: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const resetValues = {
      company: '',
      base: '',
      status: '',
      applicationDateStart: null,
      applicationDateEnd: null,
      updateDateStart: null,
      updateDateEnd: null
    };
    setFilters(resetValues);
    onReset(resetValues);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* 公司名称 */}
        <div>
          <Label htmlFor="company">公司名称</Label>
          <Input
            id="company"
            placeholder="搜索公司..."
            value={filters.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
          />
        </div>

        {/* Base地 */}
        <div>
          <Label htmlFor="base">Base地</Label>
          <Input
            id="base"
            placeholder="搜索Base地..."
            value={filters.base}
            onChange={(e) => handleInputChange('base', e.target.value)}
          />
        </div>

        {/* 状态 */}
        <div>
          <Label htmlFor="status">当前状态</Label>
          <Select value={filters.status || 'all'} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger>
              <SelectValue placeholder="选择状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部状态</SelectItem>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 投递日期 */}
        <div>
          <Label>投递日期</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.applicationDateStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.applicationDateStart ? format(filters.applicationDateStart, "yyyy-MM-dd") : "开始日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.applicationDateStart}
                  onSelect={(date) => handleDateSelect('applicationDateStart', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.applicationDateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.applicationDateEnd ? format(filters.applicationDateEnd, "yyyy-MM-dd") : "结束日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.applicationDateEnd}
                  onSelect={(date) => handleDateSelect('applicationDateEnd', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex space-x-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('application', 7)}
            >
              近一周
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('application', 30)}
            >
              近一月
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('application', 90)}
            >
              近三月
            </Button>
          </div>
        </div>

        {/* 更新日期 */}
        <div>
          <Label>更新日期</Label>
          <div className="flex space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.updateDateStart && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.updateDateStart ? format(filters.updateDateStart, "yyyy-MM-dd") : "开始日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.updateDateStart}
                  onSelect={(date) => handleDateSelect('updateDateStart', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.updateDateEnd && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.updateDateEnd ? format(filters.updateDateEnd, "yyyy-MM-dd") : "结束日期"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={filters.updateDateEnd}
                  onSelect={(date) => handleDateSelect('updateDateEnd', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex space-x-1 mt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('update', 7)}
            >
              近一周
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('update', 30)}
            >
              近一月
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleQuickDateSelect('update', 90)}
            >
              近三月
            </Button>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={resetFilters}>
          <X className="mr-2 h-4 w-4" />
          清除筛选
        </Button>
      </div>
    </div>
  );
};

export default ApplicationFilter;

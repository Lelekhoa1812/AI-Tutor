import { useFormContext, Controller } from "react-hook-form";
import { type OnboardingData } from "@/types/onboarding";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function RoleGradeStep() {
  const { control, formState: { errors } } = useFormContext<OnboardingData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="role">Role</Label>
        <Controller
          name="roleGrade.role"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              onValueChange={onChange}
              value={value}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.roleGrade?.role && (
          <p className="text-sm text-destructive">{errors.roleGrade.role.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="grade">Grade</Label>
        <Controller
          name="roleGrade.grade"
          control={control}
          render={({ field: { onChange, value } }) => (
            <Select
              onValueChange={(newValue) => onChange(parseInt(newValue))}
              value={value?.toString()}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your grade" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                  <SelectItem key={grade} value={grade.toString()}>
                    Grade {grade}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.roleGrade?.grade && (
          <p className="text-sm text-destructive">{errors.roleGrade.grade.message}</p>
        )}
      </div>
    </div>
  );
} 
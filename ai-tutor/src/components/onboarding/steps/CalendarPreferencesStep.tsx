import { useFormContext } from "react-hook-form";
import { type OnboardingData } from "@/types/onboarding";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function CalendarPreferencesStep() {
  const { register, formState: { errors } } = useFormContext<OnboardingData>();

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="daysPerWeek">Days per Week</Label>
        <Input
          type="number"
          min={1}
          max={7}
          {...register("calendarPreferences.daysPerWeek", { valueAsNumber: true })}
        />
        {errors.calendarPreferences?.daysPerWeek && (
          <p className="text-sm text-destructive">
            {errors.calendarPreferences.daysPerWeek.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="hoursPerDay">Hours per Day</Label>
        <Input
          type="number"
          min={1}
          max={24}
          {...register("calendarPreferences.hoursPerDay", { valueAsNumber: true })}
        />
        {errors.calendarPreferences?.hoursPerDay && (
          <p className="text-sm text-destructive">
            {errors.calendarPreferences.hoursPerDay.message}
          </p>
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        <p>Please specify how many days per week and hours per day you'd like to dedicate to learning.</p>
      </div>
    </div>
  );
} 
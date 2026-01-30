import { useState } from "react";
import { DateRangePicker } from "@cloudflare/kumo";

export function DateRangePickerBasicDemo() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <DateRangePicker
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <div className="text-sm text-kumo-subtle">
        {startDate && endDate ? (
          <span>
            Selected: {startDate.toLocaleDateString()} -{" "}
            {endDate.toLocaleDateString()}
          </span>
        ) : startDate ? (
          <span>Start: {startDate.toLocaleDateString()} (select end date)</span>
        ) : (
          <span>Select a date range</span>
        )}
      </div>
    </div>
  );
}

export function DateRangePickerSizesDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">Small</p>
        <DateRangePicker
          size="sm"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Base (default)
        </p>
        <DateRangePicker
          size="base"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">Large</p>
        <DateRangePicker
          size="lg"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
    </div>
  );
}

export function DateRangePickerVariantsDemo() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Default variant
        </p>
        <DateRangePicker
          variant="default"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
      <div>
        <p className="mb-2 text-sm font-medium text-kumo-default">
          Subtle variant
        </p>
        <DateRangePicker
          variant="subtle"
          onStartDateChange={() => {}}
          onEndDateChange={() => {}}
        />
      </div>
    </div>
  );
}

export function DateRangePickerTimezoneDemo() {
  return (
    <DateRangePicker
      timezone="London, UK (GMT+0)"
      onStartDateChange={() => {}}
      onEndDateChange={() => {}}
    />
  );
}

export function DateRangePickerControlledDemo() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const formatDateRange = () => {
    if (!startDate && !endDate) return "No dates selected";
    if (startDate && !endDate)
      return `From: ${startDate.toLocaleDateString()} (select end date)`;
    if (startDate && endDate) {
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()} (${diffDays} days)`;
    }
    return "";
  };

  return (
    <div className="flex flex-col gap-4">
      <DateRangePicker
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
      />
      <div className="rounded-lg bg-kumo-control p-3 text-sm text-kumo-default">
        <strong>Selection:</strong> {formatDateRange()}
      </div>
    </div>
  );
}

import { ReactNode, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Matcher } from 'react-day-picker';

import { cn } from '@/utils/theme.util';
import { padNumber } from '@/utils/number.util';
import { TimePickerHourData, TimePickerMinuteData } from '@/data/dateTimePicker.data';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { InputLabelElement } from '@/components/elements/InputLabelElement';
import { ButtonElement } from './ButtonElement';
import { SelectElement } from './SelectElement';

type DatePickerElementProps<T extends 'number' | 'iso'> = {
	type: 'date' | 'time' | 'datetime';
	value?: Date | string | number;
	onChange: (date: T extends 'number' ? number : string) => void;
	outputFormat: T;
	label?: ReactNode;
	message?: string;
	isError?: boolean;
	disabledDate?: Matcher | Matcher[] | undefined;
	hideLabel?: boolean;
	dateTriggerClassName?: string;
	timeTriggerClassName?: string;
	containerClassName?: string;
	errorClassName?: string;
};

type DisabledTimeType = { value: number; type: 'hour' | 'min'; state: 'before' | 'after' };

export const DatePickerElement = <T extends 'number' | 'iso'>({
	type,
	value,
	onChange,
	outputFormat,
	label,
	message,
	isError,
	disabledDate,
	hideLabel,
	dateTriggerClassName,
	timeTriggerClassName,
	containerClassName,
	errorClassName,
}: DatePickerElementProps<T>) => {
	const [date, setDate] = useState<Date | undefined>(undefined);
	const [reRender, setReRender] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [isOpen, setIsOpen] = useState(false);
	const [disabledTime, setDisabledTime] = useState<DisabledTimeType[] | undefined>(undefined);

	const onUpdateValue = (type: 'date' | 'hour' | 'minute', selectedValue: Date | string | undefined) => {
		if (!selectedValue) return;

		setErrorMessage('');
		const activeDate = date || new Date();
		const currentMinute = activeDate.getMinutes() || 0;

		let newDate = activeDate;
		if (type === 'date' && selectedValue instanceof Date) {
			newDate = selectedValue;
			newDate.setHours(new Date().getHours() + 1);
			newDate.setMinutes(currentMinute);
		} else if (type === 'hour' && typeof selectedValue === 'string') {
			newDate.setHours(Number(selectedValue));
		} else if (type === 'minute') {
			newDate.setMinutes(Number(selectedValue));
		}

		newDate.setSeconds(0);
		newDate.setMilliseconds(0);

		setDate(newDate);
		setReRender((prev) => !prev);
		if (!disabledDate) {
			if (outputFormat === 'number') {
				onChange(newDate.getTime() as T extends 'number' ? number : string);
			} else {
				onChange(newDate.toISOString() as T extends 'number' ? number : string);
			}
			return setIsOpen(false);
		}

		const disabledDateKeys = Object.keys(disabledDate);

		if (disabledDateKeys[0] === 'after') {
			const disabledDateValue = new Date(disabledDate['after' as keyof Matcher]).getTime();
			const selectedDateValue = new Date(newDate).getTime();

			if (selectedDateValue < disabledDateValue) {
				if (outputFormat === 'number') {
					onChange(newDate.getTime() as T extends 'number' ? number : string);
				} else {
					onChange(newDate.toISOString() as T extends 'number' ? number : string);
				}
				return setIsOpen(false);
			}
			return setErrorMessage(
				`Selection cannot be after ${new Date(disabledDateValue).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}`,
			);
		}

		if (disabledDateKeys[0] === 'before') {
			const disabledDateValue = new Date(disabledDate['before' as keyof Matcher]).getTime();
			const selectedDateValue = new Date(newDate).getTime();

			if (selectedDateValue > disabledDateValue) {
				if (outputFormat === 'number') {
					onChange(newDate.getTime() as T extends 'number' ? number : string);
				} else {
					onChange(newDate.toISOString() as T extends 'number' ? number : string);
				}
				return setIsOpen(false);
			}
			return setErrorMessage(
				`Selection cannot be before ${new Date(disabledDateValue).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}`,
			);
		}
	};

	useEffect(() => {
		if (!date || !disabledDate) return;

		const disabledDateKeys = Object.keys(disabledDate);

		if (disabledDateKeys[0] === 'after') {
			const disabledDateValue = new Date(disabledDate['after' as keyof Matcher]).getDate();
			const disabledMonthValue = new Date(disabledDate['after' as keyof Matcher]).getMonth();
			const disabledYearValue = new Date(disabledDate['after' as keyof Matcher]).getFullYear();
			const disabledHourValue = new Date(disabledDate['after' as keyof Matcher]).getHours();
			const disabledMinValue = new Date(disabledDate['after' as keyof Matcher]).getMinutes();

			const selectedDate = new Date(date).getDate();
			const selectedMonth = new Date(date).getMonth();
			const selectedYear = new Date(date).getFullYear();
			const selectedHour = new Date(date).getHours();

			if (selectedYear < disabledYearValue) return setDisabledTime(undefined);
			if (selectedMonth < disabledMonthValue) return setDisabledTime(undefined);
			if (selectedDate < disabledDateValue) return setDisabledTime(undefined);

			if (selectedDate === disabledDateValue) {
				const disabledTimeValue: DisabledTimeType[] =
					selectedHour < disabledHourValue
						? [{ value: disabledHourValue, type: 'hour', state: 'after' }]
						: [
								{ value: disabledHourValue, type: 'hour', state: 'after' },
								{ value: disabledMinValue, type: 'min', state: 'after' },
							];

				setDisabledTime(disabledTimeValue);
			}
		}

		if (disabledDateKeys[0] === 'before') {
			const disabledDateValue = new Date(disabledDate['before' as keyof Matcher]).getDate();
			const disabledMonthValue = new Date(disabledDate['before' as keyof Matcher]).getMonth();
			const disabledYearValue = new Date(disabledDate['before' as keyof Matcher]).getFullYear();
			const disabledHourValue = new Date(disabledDate['before' as keyof Matcher]).getHours();
			const disabledMinValue = new Date(disabledDate['before' as keyof Matcher]).getMinutes();

			const selectedDate = new Date(date).getDate();
			const selectedMonth = new Date(date).getMonth();
			const selectedYear = new Date(date).getFullYear();
			const selectedHour = new Date(date).getHours();

			if (selectedYear > disabledYearValue) return setDisabledTime(undefined);
			if (selectedMonth > disabledMonthValue) return setDisabledTime(undefined);
			if (selectedDate > disabledDateValue) return setDisabledTime(undefined);

			if (selectedDate === disabledDateValue) {
				const disabledTimeValue: DisabledTimeType[] =
					selectedHour > disabledHourValue
						? [{ value: disabledHourValue, type: 'hour', state: 'before' }]
						: [
								{ value: disabledHourValue, type: 'hour', state: 'before' },
								{ value: disabledMinValue, type: 'min', state: 'before' },
							];

				setDisabledTime(disabledTimeValue);
			}
		}
	}, [date, reRender]);

	useEffect(() => {
		if (!value) return setDate(undefined);
	}, [value]);

	useEffect(() => {
		if (!value) return setDate(undefined);

		const dateValue = new Date(value);
		if (isNaN(dateValue.getTime())) return setDate(undefined);

		dateValue.setMinutes(dateValue.getMinutes() || 0);
		dateValue.setSeconds(0);
		dateValue.setMilliseconds(0);
		return setDate(dateValue);
	}, []);

	return (
		<div className={containerClassName}>
			<div className="flex items-center gap-2">
				<Popover open={isOpen} onOpenChange={setIsOpen}>
					<PopoverTrigger asChild>
						<div className="flex h-max grow flex-col gap-1">
							{label && <InputLabelElement label={label} />}

							<ButtonElement
								title="Pick a date"
								variant={'outline'}
								className={cn(
									'w-full shrink-0 border-2 border-border px-3',
									!date && 'text-muted-foreground',
									dateTriggerClassName,
								)}
							>
								<CalendarIcon className="mr-2 size-4 shrink-0" />
								{date ? format(date, 'PPP') : <span>Pick a date</span>}
							</ButtonElement>
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-auto p-0">
						<Calendar
							mode="single"
							selected={date}
							onSelect={(value) => onUpdateValue('date', value)}
							disabled={disabledDate}
							initialFocus
						/>
					</PopoverContent>
				</Popover>

				{type === 'datetime' && (
					<div className="flex items-center gap-2">
						<SelectElement
							value={date ? padNumber(date.getHours()) : undefined}
							onChange={(value) => onUpdateValue('hour', value)}
							triggerText={'HH'}
							content={TimePickerHourData}
							disabledValues={{ type: 'time', value: disabledTime?.find((item) => item.type === 'hour') }}
							label={hideLabel ? undefined : 'Hour'}
							triggerClassName={timeTriggerClassName}
						/>
						<SelectElement
							value={date ? padNumber(date.getMinutes()) : undefined}
							onChange={(value) => onUpdateValue('minute', value)}
							triggerText={'MM'}
							content={TimePickerMinuteData}
							disabledValues={{ type: 'time', value: disabledTime?.find((item) => item.type === 'min') }}
							label={hideLabel ? undefined : 'Min'}
							triggerClassName={timeTriggerClassName}
						/>
					</div>
				)}
			</div>

			{(message || errorMessage) && (
				<p
					className={cn(
						'input-message mt-1',
						`${isError || errorMessage ? 'input-error-message' : 'input-success-message'}`,
						errorClassName,
					)}
				>
					{message || errorMessage}
				</p>
			)}
		</div>
	);
};

// ========== Disabled Date Matchers ==========
// const dateMatcher: Matcher = new Date(); // Will match today's date
// const arrayMatcher: Matcher = [new Date(2019, 1, 2), new Date(2019, 1, 4)]; // Will match the days in array
// const afterMatcher: DateAfter = { after: new Date(2019, 1, 2) }; // Will match days after the given date
// const beforeMatcher: DateBefore = { before: new Date(2019, 1, 2) }; // Will match days before the given date
// const dayOfWeekMatcher: DayOfWeek = { dayOfWeek: 0 }; // Will match Sundays
// const intervalMatcher: DateInterval = { after: new Date(2019, 1, 2), before: new Date(2019, 1, 5) }; // Will match the included days, except the two dates
// const rangeMatcher: DateRange = { from: new Date(2019, 1, 2), to: new Date(2019, 1, 5) }; // Will match the included days, including the two dates
// const functionMatcher: Matcher = (day: Date) => day.getMonth() === 2; // Will match when the function return true

import { nowInAppTimeZone } from "@/lib/dayjs";
import { BadRequestError } from "../errors/bad-request-error";

interface GetWeekRangeRequest {
	week?: string | number;
}

interface WeekRange {
	week: number;
	firstDayOfWeek: Date;
	lastDayOfWeek: Date;
}

// Calcula semanas completas de domingo a sábado e bloqueia qualquer semana futura.
export const getWeekRange = ({ week }: GetWeekRangeRequest = {}): WeekRange => {
	const weekOffset = week === undefined ? 0 : Number(week);

	if (!Number.isInteger(weekOffset) || weekOffset > 0) {
		throw new BadRequestError(
			"week must be an integer less than or equal to zero"
		);
	}

	const currentSunday = nowInAppTimeZone().startOf("day").day(0);
	const firstDay = currentSunday.add(weekOffset, "week");

	return {
		week: weekOffset,
		firstDayOfWeek: firstDay.toDate(),
		lastDayOfWeek: firstDay.add(6, "day").endOf("day").toDate(),
	};
};

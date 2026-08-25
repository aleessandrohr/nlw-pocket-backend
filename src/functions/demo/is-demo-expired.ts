import { nowInAppTimeZone } from "@/lib/dayjs";

interface DemoExpiration {
	isDemo: boolean;
	demoExpiresAt: Date | null;
}

// Bloqueia somente demos sem prazo válido ou cujo prazo já terminou.
export const isDemoExpired = ({ isDemo, demoExpiresAt }: DemoExpiration) => {
	if (!isDemo) return false;

	return !demoExpiresAt || !nowInAppTimeZone().isBefore(demoExpiresAt);
};

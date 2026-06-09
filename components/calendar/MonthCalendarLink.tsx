import { useI18n } from '../../lib/i18n';
import OutlinePillButton from '../ui/OutlinePillButton';

type MonthCalendarLinkProps = {
  onPress: () => void;
};

/** Result page entry below StatsCards (D-02). */
export default function MonthCalendarLink({ onPress }: MonthCalendarLinkProps) {
  const { strings } = useI18n();
  const calendarUi = strings.ui.calendar;

  return (
    <OutlinePillButton
      label={calendarUi.viewMonthLink}
      variant="outline"
      onPress={onPress}
      accessibilityLabel={calendarUi.viewMonthA11y}
      className="mt-5 w-full"
    />
  );
}

import { Pressable, Text, type PressableProps } from 'react-native';

type Variant = 'outline' | 'primary';

type OutlinePillButtonProps = PressableProps & {
  label: string;
  variant?: Variant;
};

export default function OutlinePillButton({
  label,
  variant = 'outline',
  disabled,
  className,
  ...props
}: OutlinePillButtonProps & { className?: string }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      className={[
        'min-h-[44px] items-center justify-center rounded-full px-6 py-3',
        isPrimary ? 'bg-primary' : 'border border-hairline bg-transparent',
        disabled ? 'opacity-50' : 'active:opacity-85',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      <Text
        className={[
          'text-base font-normal',
          isPrimary ? 'text-on-primary' : 'text-ink',
        ].join(' ')}
      >
        {label}
      </Text>
    </Pressable>
  );
}

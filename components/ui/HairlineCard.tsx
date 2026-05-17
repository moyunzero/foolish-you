import { View, type ViewProps } from 'react-native';

type HairlineCardProps = ViewProps & {
  className?: string;
};

export default function HairlineCard({
  children,
  className,
  ...props
}: HairlineCardProps) {
  return (
    <View
      className={['rounded-lg border border-hairline bg-canvas-card p-6', className]
        .filter(Boolean)
        .join(' ')}
      {...props}
    >
      {children}
    </View>
  );
}

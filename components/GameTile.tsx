import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '~/lib/cn';

interface GameTileProps extends ViewProps {
  className?: string;
  children?: React.ReactNode;
}

export const GameTile: React.FC<GameTileProps> = ({ className, children, ...props }) => {
  return (
    <View className={cn('tile items-center justify-center', className)} {...props}>
      {children}
    </View>
  );
};

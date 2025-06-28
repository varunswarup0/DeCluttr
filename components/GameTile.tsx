import React from 'react';
import { View } from 'react-native';
import { cn } from '~/lib/cn';

interface GameTileProps {
  className?: string;
  children?: React.ReactNode;
}

export const GameTile: React.FC<GameTileProps> = ({ className, children }) => {
  return <View className={cn('tile items-center justify-center', className)}>{children}</View>;
};

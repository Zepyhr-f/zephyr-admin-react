import React from 'react';
import * as Icons from '@ant-design/icons';

interface IconMapperProps {
  iconName?: string;
  style?: React.CSSProperties;
  className?: string;
}

export const IconMapper: React.FC<IconMapperProps> = ({ iconName, style, className }) => {
  if (!iconName) {
    return null;
  }
  
  // @ts-ignore
  const IconComponent = Icons[iconName] as React.ElementType;
  
  if (!IconComponent) {
    return null;
  }

  return <IconComponent style={style} className={className} />;
};

export const getIconElement = (iconName?: string): React.ReactNode => {
  if (!iconName) return null;
  // @ts-ignore
  const IconComponent = Icons[iconName] as React.ElementType;
  if (!IconComponent) return null;
  return <IconComponent />;
};

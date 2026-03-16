import React from 'react';

export interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

const maxWidthStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full',
};

export const Container: React.FC<ContainerProps> = ({
  children,
  className = '',
  maxWidth = 'full',
}) => {
  return (
    <div className={`mx-auto ${maxWidthStyles[maxWidth]} ${className}`}>
      {children}
    </div>
  );
};

export const Section: React.FC<SectionProps> = ({
  children,
  className = '',
  title,
}) => {
  return (
    <section className={`py-8 ${className}`}>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      )}
      {children}
    </section>
  );
};

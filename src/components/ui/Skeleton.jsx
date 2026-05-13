import React from 'react';
import { twMerge } from 'tailwind-merge';
import { clsx } from 'clsx';

const SHAPES = {
  rect:   'rounded-xl',
  circle: 'rounded-full',
  pill:   'rounded-full',
  text:   'rounded-md h-4',
};

const Skeleton = ({
  shape = 'rect',
  width,
  height,
  className,
  style,
  ...props
}) => (
  <span
    aria-hidden
    className={twMerge(
      clsx(
        'block animate-pulse bg-[var(--surface-hover)]',
        SHAPES[shape] || SHAPES.rect,
      ),
      className,
    )}
    style={{ width, height, ...style }}
    {...props}
  />
);

export const SkeletonText = ({ lines = 3, className }) => (
  <div className={twMerge('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        shape="text"
        className={i === lines - 1 ? 'w-2/3' : 'w-full'}
      />
    ))}
  </div>
);

export default Skeleton;

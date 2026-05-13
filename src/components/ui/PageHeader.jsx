import React from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

const PageHeader = ({
  title,
  subtitle,
  icon: Icon,
  breadcrumbs,
  actions,
  className,
}) => (
  <div
    className={twMerge(
      'flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm',
      className,
    )}
  >
    <div className="flex items-center gap-4 min-w-0">
      {Icon && (
        <span className="w-11 h-11 rounded-xl bg-primary-500/10 text-primary-500 flex items-center justify-center shrink-0">
          <Icon size={20} />
        </span>
      )}
      <div className="min-w-0">
        {Array.isArray(breadcrumbs) && breadcrumbs.length > 0 && (
          <nav className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-muted)]">
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              const node = crumb.href && !isLast ? (
                <Link href={crumb.href} className="hover:text-primary-500 transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className={isLast ? 'text-[var(--foreground)]' : ''}>{crumb.label}</span>
              );
              return (
                <React.Fragment key={`${crumb.label}-${idx}`}>
                  {node}
                  {!isLast && <ChevronRight size={10} className="opacity-50" />}
                </React.Fragment>
              );
            })}
          </nav>
        )}
        <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight leading-none mb-0.5 truncate">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">
            {subtitle}
          </p>
        )}
      </div>
    </div>
    {actions && <div className="flex items-center flex-wrap gap-3">{actions}</div>}
  </div>
);

export default PageHeader;

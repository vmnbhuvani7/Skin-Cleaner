import React from 'react';
import { IndianRupee } from 'lucide-react';
import Input from './Input';

const CurrencyInput = React.forwardRef(({ label, error, className, ...props }, ref) => {
  return (
    <Input
      ref={ref}
      type="number"
      icon={IndianRupee}
      label={label}
      error={error}
      className={className}
      {...props}
    />
  );
});

CurrencyInput.displayName = 'CurrencyInput';

export default CurrencyInput;

// components/Button.tsx
import React from 'react'

// 1. Extend React.ButtonHTMLAttributes<HTMLButtonElement>
// 2. Add your own `variant` prop
export interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline'
}

const Button: React.FC<CustomButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...restProps           // includes `type`, `onClick`, etc.
}) => {
  const baseClasses = 'px-4 py-2 rounded font-semibold'
  const variantClasses =
    variant === 'outline'
      ? 'border border-indigo-600 text-indigo-600 hover:bg-indigo-50'
      : 'bg-indigo-600 text-white hover:bg-indigo-700'

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...restProps}       // spreads `type="submit"`, `onClick`, etc.
    >
      {children}
    </button>
  )
}

export default Button


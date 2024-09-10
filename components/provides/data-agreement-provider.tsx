'use client';
import Link from 'next/link';
import React, { createContext, useContext, useState } from 'react';
import { Checkbox } from '../ui/checkbox';

interface DataAgreementContextType {
  isAgreed: boolean;
  setIsAgreed: React.Dispatch<React.SetStateAction<boolean>>;
}

const DataAgreementContext = createContext<DataAgreementContextType | undefined>(undefined);

export const useDataAgreement = () => {
  const context = useContext(DataAgreementContext);
  if (context === undefined) {
    throw new Error('useDataAgreement must be used within a DataAgreementProvider');
  }
  return context;
};

export const DataAgreementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAgreed, setIsAgreed] = useState(false);

  return (
    <DataAgreementContext.Provider value={{ isAgreed, setIsAgreed }}>
      {children}
    </DataAgreementContext.Provider>
  );
};

export const AgreementCheckbox: React.FC = () => {
  const { isAgreed, setIsAgreed } = useDataAgreement();
  
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="terms"
        checked={isAgreed}
        onCheckedChange={(checked) => setIsAgreed(checked as boolean)}
      />
      <label
        htmlFor="terms"
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-fourth"
      >
        I agree to the processing of personal data and have read the{' '}
        <Link target='_blank' href="https://eoassist.com/privacy-policy" className="text-blue-500 hover:underline">
          Privacy Policy
        </Link>
      </label>
    </div>
  );
};
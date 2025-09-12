'use client';

import { useDomainInfo } from '@/hooks/use-domain-info';

export function DomainInfoDisplay() {
  const domainInfo = useDomainInfo();

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-sm font-semibold mb-2">Domain Information</h3>
      <div className="space-y-1 text-xs">
        <div>
          <span className="font-medium">Zone:</span>{' '}
          <span className={`px-2 py-0.5 rounded ${
            domainInfo.zone === 'ru' ? 'bg-red-100 text-red-700' :
            domainInfo.zone === 'com' ? 'bg-blue-100 text-blue-700' :
            domainInfo.zone === 'store' ? 'bg-green-100 text-green-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            .{domainInfo.zone}
          </span>
        </div>
        <div>
          <span className="font-medium">Full Domain:</span> {domainInfo.fullDomain || 'N/A'}
        </div>
        <div>
          <span className="font-medium">Base Domain:</span> {domainInfo.baseDomain || 'N/A'}
        </div>
        {domainInfo.subdomain && (
          <div>
            <span className="font-medium">Subdomain:</span> {domainInfo.subdomain}
          </div>
        )}
      </div>
    </div>
  );
}
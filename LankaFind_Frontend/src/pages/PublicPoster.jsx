import React from 'react';
import QRPoster from '../components/QRPoster';
import PageHeader from '../components/PageHeader';

function PublicPoster() {
  const homeUrl = window.location.origin;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 text-center">
        <PageHeader
          icon="🖨️"
          title="LankaFind Awareness Poster"
          subtitle="Print this and stick it up at police stations, university notice boards, bus/train stations, or anywhere people lose or find things."
          accent="from-blue-600 to-indigo-500"
        />

        <div className="flex justify-center">
          <QRPoster
            url={homeUrl}
            title="Lost or Found Something?"
            subtitle="Scan to report it on LankaFind"
            accentColor="#2563eb"
          />
        </div>
      </div>
    </div>
  );
}

export default PublicPoster;

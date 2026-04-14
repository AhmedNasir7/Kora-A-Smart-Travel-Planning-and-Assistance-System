'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';

interface Document {
  id: string;
  name: string;
  category: string;
  status: 'verified' | 'pending' | 'expired';
  expiryDate: string;
  uploadDate: string;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', name: 'Passport', category: 'Identity', status: 'verified', expiryDate: '2027-05-20', uploadDate: '2024-01-15' },
    { id: '2', name: 'Travel Visa', category: 'Visa', status: 'verified', expiryDate: '2026-12-31', uploadDate: '2024-01-15' },
    { id: '3', name: 'Travel Insurance', category: 'Insurance', status: 'pending', expiryDate: '2026-06-15', uploadDate: '2024-02-10' },
    { id: '4', name: 'Flight Booking', category: 'Travel', status: 'verified', expiryDate: '2026-03-20', uploadDate: '2024-01-20' },
    { id: '5', name: 'Hotel Confirmation', category: 'Accommodation', status: 'pending', expiryDate: '', uploadDate: '2024-02-05' },
  ]);

  const [filter, setFilter] = useState<'all' | 'verified' | 'pending' | 'expired'>('all');

  const filteredDocuments = documents.filter((doc) => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30';
      case 'pending':
        return 'bg-[#FF7B54]/15 text-[#FF7B54] border-[#FF7B54]/30';
      case 'expired':
        return 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30';
      default:
        return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Pending Review';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  return (
    <main className="min-h-screen bg-[#13151A]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header variant="dashboard" />

        <div className="max-w-6xl mx-auto px-6 py-12 mt-20">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-3">Documents</p>
              <h1 className="text-5xl font-bold text-white mb-4">Travel Documents</h1>
              <p className="text-[#A0A5B8]">{documents.length} documents uploaded</p>
            </div>
            <button className="px-8 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2">
              <span className="text-xl">+</span> Upload Document
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-6 border-b border-[#2A2D35] mb-8 pb-0">
            {(['all', 'verified', 'pending', 'expired'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-1 py-3 text-sm font-medium transition-all duration-300 relative ${
                  filter === tab ? 'text-[#FF7B54]' : 'text-[#A0A5B8] hover:text-white'
                }`}
              >
                {tab === 'all' && 'All'}
                {tab === 'verified' && 'Verified'}
                {tab === 'pending' && 'Pending'}
                {tab === 'expired' && 'Expired'}
                {filter === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F]" />}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-6 hover:border-[#FF7B54]/30 transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7B54]/10 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#FF7B54]/15 rounded-lg flex items-center justify-center group-hover:bg-[#FF7B54]/25 transition-colors duration-200">
                      <svg className="w-5 h-5 text-[#FF7B54]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">{doc.name}</h3>
                      <p className="text-xs text-[#7A7E8C]">{doc.category}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(doc.status)}`}>
                    {getStatusLabel(doc.status)}
                  </div>
                </div>

                <div className="space-y-3 my-6 pt-4 border-t border-[#2A2D35]">
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-[#7A7E8C]">Uploaded</p>
                    <p className="text-[#A0A5B8]">{new Date(doc.uploadDate).toLocaleDateString()}</p>
                  </div>
                  {doc.expiryDate && (
                    <div className="flex items-center justify-between text-xs">
                      <p className="text-[#7A7E8C]">Expires</p>
                      <p className="text-[#A0A5B8]">{new Date(doc.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-[#2A2D35]">
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-[#A0A5B8] hover:text-white hover:bg-[#2A2D35] rounded-lg transition-all duration-200">
                    View
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs font-medium text-[#A0A5B8] hover:text-white hover:bg-[#2A2D35] rounded-lg transition-all duration-200">
                    Download
                  </button>
                  <button className="px-3 py-2 text-xs font-medium text-[#A0A5B8] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-lg transition-all duration-200">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-20">
              <p className="text-[#A0A5B8] mb-4">No documents found in this category</p>
              <button className="text-[#FF7B54] hover:text-[#FF9F6F] font-semibold">
                Upload your first document →
              </button>
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import {
  apiService,
  DocumentItem,
  DocumentListResponse,
  DocumentStatus,
} from '@/lib/api';
import { resolvePreferredTrip, sanitizeTripId } from '@/lib/trip-context';

const CATEGORY_TABS = [
  'All',
  'ID',
  'Ticket',
  'Booking',
  'Insurance',
  'Visa',
  'Health',
] as const;

type DocumentCategory = (typeof CATEGORY_TABS)[number];

type TripContext = {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
};

const DEMO_FALLBACK_DOCUMENTS: DocumentItem[] = [
  {
    id: '1',
    name: 'Passport',
    category: 'ID',
    status: 'verified',
    expiryDate: '2028-04-15',
    uploadDate: '2024-01-15',
    tripId: null,
  },
  {
    id: '2',
    name: 'Flight Ticket - TK 432',
    category: 'Ticket',
    status: 'verified',
    expiryDate: '',
    uploadDate: '2024-01-20',
    tripId: null,
  },
  {
    id: '3',
    name: 'Hotel Reservation - Shinjuku',
    category: 'Booking',
    status: 'verified',
    expiryDate: '',
    uploadDate: '2024-01-21',
    tripId: null,
  },
  {
    id: '4',
    name: 'Travel Insurance',
    category: 'Insurance',
    status: 'pending',
    expiryDate: '',
    uploadDate: '2024-02-05',
    tripId: null,
  },
  {
    id: '5',
    name: 'Visa Application',
    category: 'Visa',
    status: 'pending',
    expiryDate: '',
    uploadDate: '2024-02-06',
    tripId: null,
  },
  {
    id: '6',
    name: "Driver's License",
    category: 'ID',
    status: 'expired',
    expiryDate: '2026-11-01',
    uploadDate: '2024-02-07',
    tripId: null,
  },
  {
    id: '7',
    name: 'Train Pass - JR Rail',
    category: 'Ticket',
    status: 'verified',
    expiryDate: '',
    uploadDate: '2024-02-08',
    tripId: null,
  },
  {
    id: '8',
    name: 'Vaccination Record',
    category: 'Health',
    status: 'verified',
    expiryDate: '',
    uploadDate: '2024-02-09',
    tripId: null,
  },
];

function normalizeCategory(raw: string): DocumentCategory {
  const value = raw.trim().toLowerCase();
  if (value === 'id' || value === 'identity') return 'ID';
  if (value.includes('ticket') || value.includes('flight') || value.includes('train')) return 'Ticket';
  if (value.includes('booking') || value.includes('hotel') || value.includes('reservation') || value.includes('accommodation')) return 'Booking';
  if (value.includes('insurance')) return 'Insurance';
  if (value.includes('visa')) return 'Visa';
  if (value.includes('health') || value.includes('vaccine') || value.includes('medical')) return 'Health';
  return 'Booking';
}

function toDisplayStatus(status: DocumentStatus): 'secured' | 'missing' {
  return status === 'verified' ? 'secured' : 'missing';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripIdParam, setTripIdParam] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);

  useEffect(() => {
    setTripIdParam(sanitizeTripId(new URLSearchParams(window.location.search).get('tripId')));
    setQueryReady(true);
  }, []);

  useEffect(() => {
    if (!queryReady) {
      return;
    }

    let mounted = true;

    const loadDocuments = async () => {
      setLoading(true);
      setError(null);

      try {
        const resolvedTrip = tripIdParam
          ? await apiService.getTrip(tripIdParam)
          : await resolvePreferredTrip();

        if (!resolvedTrip) {
          if (!mounted) {
            return;
          }

          setActiveTrip(null);
          setDocuments(DEMO_FALLBACK_DOCUMENTS);
          setError('No trips are available yet');
          return;
        }

        const response: DocumentListResponse = await apiService.getDocuments('all', resolvedTrip.id);
        if (!mounted) return;

        setActiveTrip({
          id: resolvedTrip.id,
          destination: resolvedTrip.destination,
          country: resolvedTrip.country,
          startDate: resolvedTrip.startDate,
          endDate: resolvedTrip.endDate,
        });
        setDocuments(response.items);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : 'Failed to load documents');
        setDocuments(tripIdParam ? [] : DEMO_FALLBACK_DOCUMENTS);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDocuments();

    return () => {
      mounted = false;
    };
  }, [queryReady, tripIdParam]);

  const filteredDocuments = useMemo(() => {
    if (categoryFilter === 'All') {
      return documents;
    }

    return documents.filter(
      (doc) => normalizeCategory(doc.category) === categoryFilter,
    );
  }, [documents, categoryFilter]);

  const uploadedCount = useMemo(
    () => documents.filter((doc) => toDisplayStatus(doc.status) === 'secured').length,
    [documents],
  );

  const tripTitle = activeTrip ? `${activeTrip.destination} Documents` : 'Documents';
  const tripSubtitle = activeTrip
    ? `${activeTrip.country} • ${activeTrip.startDate} - ${activeTrip.endDate}`
    : 'Your travel documents.';

  const formatDate = (value: string): string => {
    if (!value) {
      return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().slice(0, 10);
  };

  return (
    <main className="min-h-screen bg-[#040B18]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.06)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.03)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header variant="dashboard" />

        <div className="max-w-6xl mx-auto px-6 py-12 mt-20">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-10">
            <div>
              <p className="text-xs text-[#FF7B54] tracking-wide mb-2">Document Vault</p>
              <h1 className="text-5xl font-bold text-white mb-3">{tripTitle}</h1>
              <p className="text-[#8A92A4] mb-2">{tripSubtitle}</p>
              <p className="text-[#8A92A4]">{uploadedCount}/{Math.max(documents.length, 1)} documents uploaded</p>
            </div>
            <button className="px-6 py-3 bg-[#FF7B54] hover:bg-[#FF9F6F] text-[#0F141F] text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l-3 3m3-3l3 3M5 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
              </svg>
              Upload Document
            </button>
          </div>

          {error && (
            <div className="mb-6 text-sm text-[#FFB49F] border border-[#FF7B54]/30 bg-[#FF7B54]/10 rounded-lg px-4 py-3">
              {error}. Showing fallback documents.
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex items-center gap-3 mb-8 flex-wrap">
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all duration-200 border ${
                  categoryFilter === tab
                    ? 'text-[#FF7B54] border-[#FF7B54]/30 bg-[#FF7B54]/10'
                    : 'text-[#7D8598] border-transparent hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Documents Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-48 rounded-xl border border-[#1A2436] bg-[#0B1424]/60 animate-pulse"
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-[#0B1424]/70 border border-[#162033] rounded-xl p-4 hover:border-[#FF7B54]/20 transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-[#1A2436] flex items-center justify-center text-[#6D778C]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3h7l5 5v13a1 1 0 01-1 1H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 3v5h5" />
                    </svg>
                  </div>
                  <span
                    className={`text-[10px] font-medium ${
                      toDisplayStatus(doc.status) === 'secured'
                        ? 'text-[#16C784]'
                        : 'text-[#EAB308]'
                    }`}
                  >
                    {toDisplayStatus(doc.status) === 'secured' ? 'Secured' : 'Missing'}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  <h3 className="text-sm font-semibold text-white leading-snug">{doc.name}</h3>
                  <p className="text-xs text-[#7D8598]">{normalizeCategory(doc.category)}</p>
                  <p className="text-xs text-[#5B657A]">{activeTrip ? activeTrip.destination : doc.tripId ? 'Trip linked' : 'All Trips'}</p>
                  {doc.expiryDate ? (
                    <p className="text-xs text-[#7D8598]">Expires: {formatDate(doc.expiryDate)}</p>
                  ) : null}
                </div>

                <div className="pt-3 border-t border-[#162033] text-xs">
                  {toDisplayStatus(doc.status) === 'secured' ? (
                    <button className="text-[#7D8598] hover:text-white transition-colors duration-150 inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                      </svg>
                      View
                    </button>
                  ) : (
                    <button className="text-[#FF7B54] hover:text-[#FF9F6F] transition-colors duration-150 inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l-3 3m3-3l3 3M5 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
                      </svg>
                      Upload
                    </button>
                  )}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="h-full min-h-[192px] rounded-xl border border-dashed border-[#233149] bg-transparent hover:border-[#FF7B54]/35 transition-colors duration-200 flex flex-col items-center justify-center text-[#667089] hover:text-[#9AA6BE]"
            >
              <span className="text-2xl leading-none mb-2">+</span>
              <span className="text-sm">Add document</span>
            </button>
            </div>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#8A92A4] mb-4">No documents found in this category</p>
              <button className="text-[#FF7B54] hover:text-[#FF9F6F] font-semibold text-sm">
                Upload your first document
              </button>
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>
    </main>
  );
}

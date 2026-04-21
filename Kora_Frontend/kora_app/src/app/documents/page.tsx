'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { DocumentModal, type DocumentFormData } from '@/components/dashboard/DocumentModal';
import { ConfirmationDialog } from '@/components/dashboard/ConfirmationDialog';
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
  'Visa',
  'Ticket',
  'Booking',
  'Insurance',
  'Health',
  'Other',
] as const;

type DocumentCategory = (typeof CATEGORY_TABS)[number];

type TripContext = {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
};

function normalizeCategory(raw: string): DocumentCategory {
  const value = raw.trim().toLowerCase();
  if (value === 'passport' || value === 'id' || value === 'identity' || value === 'license') return 'ID';
  if (value === 'visa') return 'Visa';
  if (value.includes('ticket') || value.includes('flight') || value.includes('train')) return 'Ticket';
  if (value.includes('booking') || value.includes('hotel') || value.includes('reservation') || value.includes('accommodation')) return 'Booking';
  if (value.includes('insurance')) return 'Insurance';
  if (value.includes('health') || value.includes('vaccine') || value.includes('medical') || value.includes('certificate')) return 'Health';
  if (value === 'other') return 'Other';
  return 'Other';
}

function toDisplayStatus(status: DocumentStatus): 'secured' | 'missing' {
  return status === 'verified' ? 'secured' : 'missing';
}

function toDocumentType(category: string): string {
  const normalized = category.trim().toLowerCase();
  if (normalized === 'id') return 'Passport';
  if (normalized === 'visa') return 'Visa';
  if (normalized === 'ticket') return 'Ticket';
  if (normalized === 'booking') return 'Booking';
  if (normalized === 'insurance') return 'Insurance';
  if (normalized === 'health') return 'Certificate';
  return 'Other';
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory>('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tripIdParam, setTripIdParam] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    documentId?: string;
  }>({ isOpen: false });

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
      setDocuments([]);
      setActiveTrip(null);

      try {
        const resolvedTrip = tripIdParam
          ? await apiService.getTrip(tripIdParam)
          : await resolvePreferredTrip();

        if (!resolvedTrip) {
          if (!mounted) {
            return;
          }

          setActiveTrip(null);
          setDocuments([]);
          setError(null);
          setLoading(false);
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
        setDocuments([]);
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

  const missingCount = useMemo(
    () => documents.filter((doc) => toDisplayStatus(doc.status) === 'missing').length,
    [documents],
  );

  const handleAddDocument = async (formData: DocumentFormData) => {
    if (!activeTrip) return;

    setIsDocumentLoading(true);
    try {
      const payload = {
        title:
          formData.fileName ||
          selectedDocument?.name ||
          `${formData.documentType} Document`,
        fileName:
          formData.fileName ||
          selectedDocument?.name ||
          `${formData.documentType} Document`,
        fileType: formData.documentType,
        tripId: activeTrip.id,
        ...(formData.fileUrl ? { fileUrl: formData.fileUrl } : {}),
      };

      if (selectedDocument) {
        await apiService.updateDocument(selectedDocument.id, payload);
      } else {
        await apiService.createDocument(payload);
      }

      // Reload documents
      const response = await apiService.getDocuments('all', activeTrip.id);
      setDocuments(response.items);
      setIsDocumentModalOpen(false);
      setSelectedDocument(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add document');
    } finally {
      setIsDocumentLoading(false);
    }
  };

  const handleDeleteDocument = (documentId: string) => {
    setDeleteConfirmation({ isOpen: true, documentId });
  };

  const handleConfirmDeleteDocument = async () => {
    if (!deleteConfirmation.documentId) return;
    const id = deleteConfirmation.documentId;
    try {
      await apiService.deleteDocument(id);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
      setDeleteConfirmation({ isOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete document');
    }
  };

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
    <main className="min-h-screen bg-[#13151A]">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.06)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.03)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header variant="dashboard" />

        <div className="max-w-5xl mx-auto px-6 py-12 mt-16 flex-1 w-full">
          {/* Header Section */}
          <div className="mb-12 flex items-start justify-between">
            <div>
              <p className="text-sm text-[#FF7B54] font-semibold mb-2">Documents</p>
              <h1 className="text-4xl font-bold text-white mb-3">{tripTitle}</h1>
              <p className="text-[#A0A5B8]">{tripSubtitle}</p>
              {loading && <p className="text-xs text-[#7A7E8C] mt-2">Loading documents...</p>}
              {error && <p className="text-xs text-[#FF9F6F] mt-2">{error}</p>}
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedDocument(null);
                setIsDocumentModalOpen(true);
              }}
              className="px-6 py-2.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-full transition-all duration-200 hover:shadow-lg hover:shadow-[#FF7B54]/50 flex items-center gap-2 text-sm shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Upload Document
            </button>
          </div>

          {error && (
            <div className="mb-6 text-sm text-[#FFB49F] border border-[#FF7B54]/30 bg-[#FF7B54]/10 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Stats Tablets */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#16C784] mb-1">{uploadedCount}</div>
              <div className="text-xs text-[#A0A5B8]">Secured</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#EAB308] mb-1">{missingCount}</div>
              <div className="text-xs text-[#A0A5B8]">Missing</div>
            </div>
            <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-[#A0A5B8] mb-1">{documents.length}</div>
              <div className="text-xs text-[#A0A5B8]">Total</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-1 mb-8 items-center overflow-x-auto pb-2">
            {CATEGORY_TABS.map((tab) => (
              <button
                type="button"
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  categoryFilter === tab
                    ? 'bg-[#FF7B54] text-white'
                    : 'bg-transparent text-[#A0A5B8] hover:text-white'
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

                <div className="pt-3 border-t border-[#162033] text-xs flex items-center justify-between">
                  <div>
                    {toDisplayStatus(doc.status) === 'secured' ? (
                      <button className="text-[#7D8598] hover:text-white transition-colors duration-150 inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7S3.732 16.057 2.458 12z" />
                        </svg>
                        View
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDocument(doc);
                          setIsDocumentModalOpen(true);
                        }}
                        className="text-[#FF7B54] hover:text-[#FF9F6F] transition-colors duration-150 inline-flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 16V8m0 0l-3 3m3-3l3 3M5 16v1a2 2 0 002 2h10a2 2 0 002-2v-1" />
                        </svg>
                        Upload
                      </button>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-[#7D8598] hover:text-[#FF7B54] transition-colors duration-150 ml-2"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Empty State */}
          {filteredDocuments.length === 0 && (
            <div className="text-center py-16">
              <p className="text-[#8A92A4] mb-4">No documents found in this category</p>
            </div>
          )}
        </div>

        <DocumentModal
          isOpen={isDocumentModalOpen}
          onClose={() => {
            setIsDocumentModalOpen(false);
            setSelectedDocument(null);
          }}
          onSubmit={handleAddDocument}
          isLoading={isDocumentLoading}
          initialData={
            selectedDocument
              ? {
                  documentType: toDocumentType(selectedDocument.category),
                  fileUrl: '',
                  fileName: selectedDocument.name,
                }
              : undefined
          }
        />

        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          title="Delete Document"
          message="Are you sure you want to delete this document? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous
          onConfirm={handleConfirmDeleteDocument}
          onCancel={() => setDeleteConfirmation({ isOpen: false })}
        />

        <DashboardFooter />
      </div>
    </main>
  );
}

'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
import { PackingItemModal, type PackingItemFormData } from '@/components/dashboard/PackingItemModal';
import { ConfirmationDialog } from '@/components/dashboard/ConfirmationDialog';
import {
  apiService,
  CreatePackingItemPayload,
  PackingCategory,
  PackingCategorySummary,
  PackingItem,
  PackingOverviewResponse,
} from '@/lib/api';
import { resolvePreferredTrip, sanitizeTripId } from '@/lib/trip-context';

type TripContext = {
  id: string;
  destination: string;
  country: string;
  startDate: string;
  endDate: string;
};

function CategoryIcon({ icon }: { icon: PackingCategorySummary['icon'] }) {
  if (icon === 'electronics') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="12" rx="2" strokeWidth="1.8" />
        <path d="M8 20h8" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (icon === 'health') {
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path d="M10 14l-2 2a3 3 0 11-4-4l3-3a3 3 0 014 4L9 15" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 10l2-2a3 3 0 114 4l-3 3a3 3 0 01-4-4l2-2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M8 7V5a4 4 0 118 0v2" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M5 8h14l-1 11a2 2 0 01-2 2H8a2 2 0 01-2-2L5 8z" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}

export default function PackingPage() {
  const [overview, setOverview] = useState<PackingOverviewResponse | null>(null);
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);
  const [availableTrips, setAvailableTrips] = useState<Array<{ id: string; destination: string; country: string }>>([]);
  const [selectedCategory, setSelectedCategory] = useState<PackingCategory>('Clothing');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedTripId, setResolvedTripId] = useState<string | null>(null);
  const [tripIdParam, setTripIdParam] = useState<string | null>(null);
  const [queryReady, setQueryReady] = useState(false);
  const [modalValidationError, setModalValidationError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    item: '',
    category: 'Clothing' as PackingCategory,
  });
  const [isPackingItemLoading, setIsPackingItemLoading] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    itemId?: string;
  }>({ isOpen: false });

  useEffect(() => {
    setTripIdParam(sanitizeTripId(new URLSearchParams(window.location.search).get('tripId')));
    setQueryReady(true);
  }, []);

  const loadOverview = async (
    category?: PackingCategory,
    tripId?: string | null,
  ) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getPackingOverview(
        category || selectedCategory,
        tripId || resolvedTripId || undefined,
      );
      setOverview(response);
      setSelectedCategory(response.selectedCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packing data');
      setOverview(null);
      if (category) {
        setSelectedCategory(category);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!queryReady) {
      return;
    }

    let mounted = true;

    const loadTripPacking = async () => {
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
          setResolvedTripId(null);
          setOverview(null);
          setError('No trips are available yet');
          return;
        }

        const response = await apiService.getPackingOverview(selectedCategory, resolvedTrip.id);
        if (!mounted) {
          return;
        }

        setActiveTrip({
          id: resolvedTrip.id,
          destination: resolvedTrip.destination,
          country: resolvedTrip.country,
          startDate: resolvedTrip.startDate,
          endDate: resolvedTrip.endDate,
        });
        setResolvedTripId(resolvedTrip.id);
        setOverview(response);
        setSelectedCategory(response.selectedCategory);
        setFormData((prev) => ({ ...prev, category: response.selectedCategory }));

        // Load available trips for the selector
        try {
          const tripsResponse = await apiService.getTrips();
          if (mounted) {
            setAvailableTrips(
              tripsResponse.items.map((trip) => ({
                id: trip.id,
                destination: trip.destination,
                country: trip.country,
              }))
            );
          }
        } catch (tripsErr) {
          // Silently fail if trips can't be loaded
          console.error('Failed to load trips for selector:', tripsErr);
        }
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load packing data');
        setOverview(null);

        // Still load available trips for the selector even on error
        try {
          const tripsResponse = await apiService.getTrips();
          if (mounted) {
            setAvailableTrips(
              tripsResponse.items.map((trip) => ({
                id: trip.id,
                destination: trip.destination,
                country: trip.country,
              }))
            );
          }
        } catch (tripsErr) {
          console.error('Failed to load trips for selector:', tripsErr);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadTripPacking();

    return () => {
      mounted = false;
    };
  }, [queryReady, tripIdParam]);

  const selectedItems = useMemo<PackingItem[]>(
    () => overview?.items || [],
    [overview?.items],
  );

  const handleCategorySelect = async (category: PackingCategory) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, category }));
    await loadOverview(category, resolvedTripId);
  };

  const handleTripSelect = async (tripId: string) => {
    setLoading(true);
    try {
      const trip = await apiService.getTrip(tripId);
      const response = await apiService.getPackingOverview(selectedCategory, tripId);
      
      setActiveTrip({
        id: trip.id,
        destination: trip.destination,
        country: trip.country,
        startDate: trip.startDate,
        endDate: trip.endDate,
      });
      setResolvedTripId(tripId);
      setOverview(response);
      setSelectedCategory(response.selectedCategory);
      setFormData((prev) => ({ ...prev, category: response.selectedCategory }));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trip packing data');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = async (id: string) => {
    try {
      const response = await apiService.togglePackingItem(id, resolvedTripId || undefined);
      setOverview(response);
      setSelectedCategory(response.selectedCategory);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedItemName = formData.item.trim();
    if (!trimmedItemName) {
      setModalValidationError('Item name is required.');
      return;
    }

    setModalValidationError(null);
    const payload: CreatePackingItemPayload = {
      name: trimmedItemName,
      category: formData.category,
    };

    try {
      const response = await apiService.createPackingItem({
        ...payload,
        tripId: resolvedTripId || undefined,
      });
      setOverview(response);
      setSelectedCategory(response.selectedCategory);
      setFormData({ item: '', category: response.selectedCategory });
      setModalValidationError(null);
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create item');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'item' && modalValidationError) {
      setModalValidationError(null);
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPackingItem = async (formData: PackingItemFormData) => {
    setIsPackingItemLoading(true);
    try {
      const response = await apiService.createPackingItem({
        name: formData.itemName,
        category: formData.category as PackingCategory,
        tripId: resolvedTripId || undefined,
      });
      setOverview(response);
      setSelectedCategory(response.selectedCategory);
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add packing item');
    } finally {
      setIsPackingItemLoading(false);
    }
  };

  const handleDeleteItem = (itemId: string) => {
    setDeleteConfirmation({ isOpen: true, itemId });
  };

  const handleConfirmDeleteItem = async () => {
    if (!deleteConfirmation.itemId) return;
    const id = deleteConfirmation.itemId;
    try {
      const response = await apiService.deletePackingItem(id);
      setOverview(response);
      setDeleteConfirmation({ isOpen: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    }
  };

  const tripTitle = activeTrip ? `${activeTrip.destination}, ${activeTrip.country}` : 'Packing Lists';
  const tripSubtitle = activeTrip
    ? `${activeTrip.startDate} - ${activeTrip.endDate}`
    : 'Choose a trip to view its packing checklist.';

  // Show loading/error state if overview not loaded
  if (overview === null && !loading) {
    return (
      <main className="min-h-screen bg-[#13151A] flex flex-col select-none">
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
          <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col">
          <Header variant="dashboard" />

          <div className="max-w-5xl mx-auto px-6 py-12 mt-16 flex-1 w-full flex flex-col">
            {/* Header Section */}
            <div className="mb-12 flex items-start justify-between">
              <div>
                <p className="text-sm text-[#FF7B54] font-semibold mb-2">Packing</p>
                <h1 className="text-4xl font-bold text-white mb-3">{tripTitle}</h1>
                <p className="text-[#A0A5B8]">{tripSubtitle}</p>
              </div>
              <select
                value={resolvedTripId || ''}
                onChange={(e) => e.target.value && handleTripSelect(e.target.value)}
                disabled={availableTrips.length === 0}
                className="px-4 py-2.5 bg-[#1A1D26] border border-[#FF7B54]/50 hover:border-[#FF7B54] rounded-lg text-white text-sm focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-2 focus:ring-[#FF7B54]/30 cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-[#2A2D35]/50"
              >
                <option value="">{availableTrips.length === 0 ? 'No trips available' : 'Select a trip...'}</option>
                {availableTrips.map((trip) => (
                  <option key={trip.id} value={trip.id}>
                    {trip.destination}, {trip.country}
                  </option>
                ))}
              </select>
            </div>

            {/* Empty State */}
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <p className="text-[#A0A5B8] text-lg mb-2">Nothing to show</p>
                <p className="text-[#7A7E8C] text-sm">{error || 'No packing data available'}</p>
              </div>
            </div>
          </div>

          <DashboardFooter />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#13151A] flex flex-col select-none">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header variant="dashboard" />

        <div className="max-w-5xl mx-auto px-6 py-12 mt-16 flex-1 w-full flex flex-col">
          {/* Header Section */}
          <div className="mb-12 flex items-start justify-between">
            <div>
              <p className="text-sm text-[#FF7B54] font-semibold mb-2">Packing</p>
              <h1 className="text-4xl font-bold text-white mb-3">{tripTitle}</h1>
              <p className="text-[#A0A5B8]">{tripSubtitle}</p>
              {loading && <p className="text-xs text-[#7A7E8C] mt-2">Loading packing data...</p>}
              {error && <p className="text-xs text-[#FF9F6F] mt-2">{error}</p>}
            </div>
            <select
              value={resolvedTripId || ''}
              onChange={(e) => e.target.value && handleTripSelect(e.target.value)}
              disabled={availableTrips.length === 0}
              className="px-4 py-2.5 bg-[#13151A] border border-[#2A2D35] rounded-lg text-white text-sm hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 cursor-pointer shrink-0 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">{availableTrips.length === 0 ? 'No trips available' : 'Select a trip...'}</option>
              {availableTrips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.destination}, {trip.country}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Tablets */}
          {overview && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#FF7B54] mb-1">{overview.progress}%</div>
                <div className="text-xs text-[#A0A5B8]">Progress</div>
              </div>
              <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#00B96B] mb-1">
                  {overview.items?.filter((item) => item.packed).length || 0}
                </div>
                <div className="text-xs text-[#A0A5B8]">Packed</div>
              </div>
              <div className="bg-[#1A1D26] border border-[#2A2D35] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[#FFB49F] mb-1">
                  {overview.items?.length || 0}
                </div>
                <div className="text-xs text-[#A0A5B8]">Total</div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8]">Loading packing data...</p>
            </div>
          ) : overview ? (
            <>
          {/* Two Column Layout */}
          <div className="flex gap-12 flex-1">
            {/* Left Sidebar - Categories */}
            <div className="w-90 shrink-0 space-y-2 pt-8">
              {overview.categories.map((cat) => {
                return (
                  <button
                    type="button"
                    key={cat.name}
                    onClick={() => handleCategorySelect(cat.name)}
                    onMouseDown={(event) => event.preventDefault()}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-xl border transition-all duration-200 text-left ${
                      selectedCategory === cat.name
                        ? 'bg-[#FF7B54]/15 border-[#FF7B54]'
                        : 'bg-transparent border-transparent text-[#768199] hover:border-[#253148]'
                    }`}
                  >
                    <span className={`${selectedCategory === cat.name ? 'text-[#FF7B54]' : 'text-[#6B7488]'}`}>
                      <CategoryIcon icon={cat.icon} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${selectedCategory === cat.name ? 'text-[#FF7B54]' : 'text-[#7D8598]'}`}>
                        {cat.name}
                      </p>
                    </div>
                    <p className={`${selectedCategory === cat.name ? 'text-[#FF7B54]' : 'text-[#7D8598]'}`}>
                      {cat.packed}/{cat.total}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Right Content - Items Card */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#0B1424]/70 border border-[#1D2C42] rounded-xl p-8">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6 gap-8">
                <h2 className="text-2xl font-semibold text-[#FF7B54]">{selectedCategory}</h2>
                <button 
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  onMouseDown={(event) => event.preventDefault()}
                  className="text-[#FF7B54] hover:text-[#FF9F6F] transition-colors text-xl font-medium whitespace-nowrap ml-4">
                  + Add item
                </button>
              </div>

              {/* Items List */}
              {loading ? (
                <div className="space-y-3">
                  {[...Array(4)].map((_, index) => (
                    <div key={`loading-${index}`} className="h-8 bg-[#172131] rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4 pt-6">
                  {selectedItems.map((item) => (
                    <div
                      key={item.id}
                      className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-150 group ${
                        item.packed 
                          ? 'hover:bg-[#1A2A3A]/40' 
                          : 'hover:bg-[#0F1B2E]/60'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          void toggleItem(item.id);
                        }}
                        onMouseDown={(event) => event.preventDefault()}
                        className="flex items-center gap-4 text-left flex-1"
                        aria-label={`Toggle ${item.name}`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 transition-all duration-150 shrink-0 ${
                            item.packed
                              ? 'bg-[#00B96B] border-[#00B96B]'
                              : 'border-[#7A8499] hover:border-[#9CA5B8]'
                          }`}
                        />
                        <p className={`text-3xl font-semibold ${item.packed ? 'text-[#5D677D] line-through' : 'text-white'}`}>
                          {item.name}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[#7D8598] hover:text-[#FF7B54] shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty State */}
              {selectedItems.length === 0 && (
                <div className="text-center py-16">
                  <p className="text-[#7D8598]">No items in {selectedCategory} yet.</p>
                </div>
              )}
            </div>
          </div>

            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-[#A0A5B8]">No trips available. Create a trip to manage packing.</p>
            </div>
          )}
        </div>

        <DashboardFooter />
      </div>

      {/* Add Packing Item Modal */}
      <PackingItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddPackingItem}
        isLoading={isPackingItemLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirmation.isOpen}
        title="Delete Item"
        message="Are you sure you want to delete this item from your packing list? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous
        onConfirm={handleConfirmDeleteItem}
        onCancel={() => setDeleteConfirmation({ isOpen: false })}
      />
    </main>
  );
}

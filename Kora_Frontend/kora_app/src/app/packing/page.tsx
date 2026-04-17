'use client';

import { useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';
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

const FALLBACK_OVERVIEW: PackingOverviewResponse = {
  trip: {
    title: 'Packing List',
    subtitle: 'Choose a trip to view its packing checklist.',
  },
  progress: 0,
  categories: [
    { name: 'Clothing', icon: 'clothing', packed: 0, total: 0 },
    { name: 'Electronics', icon: 'electronics', packed: 0, total: 0 },
    { name: 'Health', icon: 'health', packed: 0, total: 0 },
    { name: 'Essentials', icon: 'essentials', packed: 0, total: 0 },
  ],
  selectedCategory: 'Clothing',
  items: [],
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
  const [overview, setOverview] = useState<PackingOverviewResponse>(FALLBACK_OVERVIEW);
  const [activeTrip, setActiveTrip] = useState<TripContext | null>(null);
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
      setOverview(FALLBACK_OVERVIEW);
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
          setOverview(FALLBACK_OVERVIEW);
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
      } catch (err) {
        if (!mounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load packing data');
        setOverview(FALLBACK_OVERVIEW);
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
    () => overview.items,
    [overview.items],
  );

  const handleCategorySelect = async (category: PackingCategory) => {
    setSelectedCategory(category);
    setFormData((prev) => ({ ...prev, category }));
    await loadOverview(category, resolvedTripId);
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

  const tripTitle = activeTrip ? `${activeTrip.destination}, ${activeTrip.country}` : overview.trip.title;
  const tripSubtitle = activeTrip
    ? `${activeTrip.startDate} - ${activeTrip.endDate}`
    : overview.trip.subtitle;

  return (
    <main className="min-h-screen bg-[#040B18] flex flex-col select-none">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-[rgba(255,123,84,0.08)] blur-3xl" />
        <div className="absolute bottom-32 left-20 w-80 h-80 rounded-full bg-[rgba(255,123,84,0.05)] blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col">
        <Header variant="dashboard" />

        <div className="max-w-7xl mx-auto px-6 py-12 mt-16 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="mb-8">
            <p className="text-[32px] leading-none text-[#FF7B54] font-semibold mb-2">Packing Lists</p>
            <h1 className="text-6xl font-bold text-white mb-2">{tripTitle}</h1>
            <p className="text-[#7D8598]">{tripSubtitle}</p>
          </div>

          {error && (
            <div className="mb-6 text-sm text-[#FFB49F] border border-[#FF7B54]/30 bg-[#FF7B54]/10 rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Progress Bar */}
          <div className="bg-[#1A2333] rounded-3xl px-7 py-5 mb-8">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[30px] font-semibold text-white">Progress</h2>
              <p className="text-4xl font-semibold text-[#FF7B54]">{overview.progress}%</p>
            </div>
            <div className="w-full bg-[#2B3344] rounded-full h-3 overflow-hidden">
              <div
                className="bg-[#FF7B54] h-full rounded-full transition-all duration-500"
                style={{ width: `${overview.progress}%` }}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-12 flex-1">
            {/* Left Sidebar - Categories */}
            <div className="w-[360px] flex-shrink-0 space-y-2 pt-8">
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
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        void toggleItem(item.id);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      className={`w-full flex items-center gap-4 text-left px-4 py-3 rounded-lg transition-all duration-150 ${
                        item.packed 
                          ? 'hover:bg-[#1A2A3A]/40' 
                          : 'hover:bg-[#0F1B2E]/60'
                      }`}
                      aria-label={`Toggle ${item.name}`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border-2 transition-all duration-150 flex-shrink-0 ${
                          item.packed
                            ? 'bg-[#00B96B] border-[#00B96B]'
                            : 'border-[#7A8499] hover:border-[#9CA5B8]'
                        }`}
                      />
                      <p className={`text-3xl font-semibold ${item.packed ? 'text-[#5D677D] line-through' : 'text-white'}`}>
                        {item.name}
                      </p>
                    </button>
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
        </div>

        <DashboardFooter />
      </div>

      {/* Add Packing Item Modal */}
      {showAddModal && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-500"
            onClick={() => setShowAddModal(false)}
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-[#121A29] border border-[#2A2F3D] rounded-2xl p-8 max-w-xl w-full shadow-2xl shadow-black/50 transition-all duration-500 ease-out">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-4xl font-semibold text-white">Add Packing Item</h2>
                <button
                  type="button"
                  onClick={() => {
                    setModalValidationError(null);
                    setShowAddModal(false);
                  }}
                  className="text-[#64708A] hover:text-white transition-colors duration-200 p-1"
                >
                  ✕
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleAddItem} className="space-y-6" autoComplete="off" noValidate>
                {/* Item Name */}
                <div>
                  <label className="block text-2xl font-semibold text-white mb-3">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="item"
                    value={formData.item}
                    onChange={handleInputChange}
                    placeholder="e.g. Swimwear"
                    autoComplete="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-4 py-3 bg-[#13151A] border border-[#FF7B54] rounded-xl text-white placeholder-[#7A7E8C] focus:outline-none"
                  />
                  {modalValidationError && (
                    <p className="mt-2 text-sm text-[#FFB49F]">{modalValidationError}</p>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-2xl font-semibold text-white mb-3">
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#222C3D] border border-[#222C3D] rounded-xl text-white focus:outline-none cursor-pointer"
                  >
                    {overview.categories.map((cat) => (
                      <option key={cat.name} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Buttons */}
                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full px-6 py-3.5 bg-[#FF7B54] hover:bg-[#FF9F6F] text-white font-semibold rounded-xl transition-colors duration-150"
                  >
                    Add Items
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

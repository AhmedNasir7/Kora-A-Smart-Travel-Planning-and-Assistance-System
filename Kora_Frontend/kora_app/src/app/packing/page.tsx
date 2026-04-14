'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { DashboardFooter } from '@/components/dashboard';

interface PackingItem {
  id: string;
  category: string;
  item: string;
  packed: boolean;
  priority: 'high' | 'medium' | 'low';
}

const CATEGORIES = [
  { name: 'Clothing', icon: '👕' },
  { name: 'Electronics', icon: '📦' },
  { name: 'Health', icon: '⚕️' },
  { name: 'Essentials', icon: '⭐' },
  { name: 'Work', icon: '💼' },
  { name: 'Weather', icon: '☂️' },
];

export default function PackingPage() {
  const [items, setItems] = useState<PackingItem[]>([
    { id: '1', category: 'Clothing', item: 'T-shirts (×4)', packed: true, priority: 'high' },
    { id: '2', category: 'Clothing', item: 'Jeans (×2)', packed: true, priority: 'high' },
    { id: '3', category: 'Clothing', item: 'Light jacket', packed: false, priority: 'medium' },
    { id: '4', category: 'Clothing', item: 'Sneakers', packed: false, priority: 'medium' },
    { id: '5', category: 'Clothing', item: 'Underwear (×5)', packed: true, priority: 'high' },
    { id: '6', category: 'Clothing', item: 'Socks (×4)', packed: false, priority: 'medium' },
    { id: '7', category: 'Electronics', item: 'Charger', packed: false, priority: 'high' },
    { id: '8', category: 'Electronics', item: 'Adapter', packed: false, priority: 'high' },
    { id: '9', category: 'Electronics', item: 'Headphones', packed: true, priority: 'medium' },
    { id: '10', category: 'Electronics', item: 'Power bank', packed: true, priority: 'medium' },
    { id: '11', category: 'Electronics', item: 'Cable', packed: false, priority: 'low' },
    { id: '12', category: 'Health', item: 'Toothbrush', packed: true, priority: 'high' },
    { id: '13', category: 'Health', item: 'Medications', packed: true, priority: 'high' },
    { id: '14', category: 'Health', item: 'First aid kit', packed: false, priority: 'medium' },
    { id: '15', category: 'Health', item: 'Sunscreen', packed: false, priority: 'medium' },
    { id: '16', category: 'Essentials', item: 'Passport', packed: true, priority: 'high' },
    { id: '17', category: 'Essentials', item: 'Wallet', packed: true, priority: 'high' },
    { id: '18', category: 'Essentials', item: 'Travel insurance', packed: false, priority: 'high' },
    { id: '19', category: 'Essentials', item: 'Boarding pass', packed: false, priority: 'high' },
    { id: '20', category: 'Work', item: 'Laptop', packed: false, priority: 'high' },
    { id: '21', category: 'Work', item: 'Notebook', packed: false, priority: 'low' },
    { id: '22', category: 'Work', item: 'Pen', packed: false, priority: 'low' },
    { id: '23', category: 'Weather', item: 'Umbrella', packed: false, priority: 'low' },
    { id: '24', category: 'Weather', item: 'Rain jacket', packed: false, priority: 'medium' },
  ]);

  const [selectedCategory, setSelectedCategory] = useState('Clothing');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    item: '',
    category: 'Clothing',
    priority: 'medium' as 'high' | 'medium' | 'low',
  });

  const getCategoryCount = (category: string) => {
    const total = items.filter(i => i.category === category).length;
    const packed = items.filter(i => i.category === category && i.packed).length;
    return { packed, total };
  };

  const selectedItems = items.filter(i => i.category === selectedCategory);
  const selectedPacked = selectedItems.filter(i => i.packed).length;
  const totalCount = items.length;
  const packedCount = items.filter(i => i.packed).length;

  const toggleItem = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, packed: !item.packed } : item)));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: PackingItem = {
      id: Date.now().toString(),
      item: formData.item,
      category: formData.category,
      packed: false,
      priority: formData.priority,
    };
    setItems([...items, newItem]);
    setFormData({ item: '', category: 'Clothing', priority: 'medium' });
    setShowAddModal(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value as any }));
  };

  return (
    <main className="min-h-screen bg-[#13151A] flex flex-col">
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
          <div className="mb-12">
            <p className="text-sm text-[#FF7B54] font-semibold mb-2">Packing</p>
            <h1 className="text-5xl font-bold text-white mb-2">Packing List</h1>
            <p className="text-[#A0A5B8]">Tokyo, Japan — Mar 15-22</p>
          </div>

          {/* Progress Bar */}
          <div className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-8 mb-12 shadow-lg hover:shadow-xl hover:shadow-[#FF7B54]/10 transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-white mb-1">Overall Progress</h2>
                <p className="text-sm text-[#A0A5B8]">{packedCount} of {totalCount} items packed</p>
              </div>
              <p className="text-4xl font-bold text-[#FF7B54]">{Math.round((packedCount / totalCount) * 100)}%</p>
            </div>
            <div className="w-full bg-[#2A2D35] rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] h-full rounded-full transition-all duration-700 shadow-lg shadow-[#FF7B54]/50"
                style={{ width: `${(packedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="flex gap-8 flex-1">
            {/* Left Sidebar - Categories */}
            <div className="w-128 flex-shrink-0 space-y-3">
              {CATEGORIES.map((cat) => {
                const { packed, total } = getCategoryCount(cat.name);
                const itemCount = total === 0 ? '0/0' : `${packed}/${total}`;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-sm flex items-center gap-3 px-4 py-4 rounded-xl border transition-all duration-300 text-left ${
                      selectedCategory === cat.name
                        ? 'bg-[#FF7B54]/15 border-[#FF7B54] shadow-lg shadow-[#FF7B54]/20'
                        : 'bg-transparent border-[#2A2D35] hover:border-[#3A3F4A]'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold whitespace-nowrap ${selectedCategory === cat.name ? 'text-[#FF7B54]' : 'text-white'}`}>
                        {cat.name}
                      </p>
                      <p className={`text-xs ${selectedCategory === cat.name ? 'text-[#FF7B54]/70' : 'text-[#7A7E8C]'}`}>
                        {itemCount}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Right Content - Items Card */}
            <div className="flex-1 flex flex-col min-w-0 bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-2xl p-8 shadow-lg">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">{selectedCategory}</h2>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="text-[#FF7B54] hover:text-[#FF9F6F] transition-colors text-sm font-semibold">
                  + Add item
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 w-2xl flex-1 overflow-y-auto pr-10">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-5 p-5 bg-[#13151A] border border-[#2A2D35] rounded-xl hover:border-[#FF7B54]/50 transition-all duration-300 group hover:shadow-lg hover:shadow-[#FF7B54]/10"
                  >
                    <input
                      type="checkbox"
                      checked={item.packed}
                      onChange={() => toggleItem(item.id)}
                      className="w-6 h-6 rounded-lg accent-[#FF7B54] cursor-pointer flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-base font-medium transition-all duration-200 ${item.packed ? 'text-[#7A7E8C] line-through' : 'text-white'}`}>
                        {item.item}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {item.priority === 'high' && (
                        <span className="text-xs px-3 py-1.5 bg-[#FF7B54]/20 text-[#FF7B54] rounded-full font-semibold whitespace-nowrap">
                          Essential
                        </span>
                      )}
                      {item.priority === 'medium' && (
                        <span className="text-xs px-3 py-1.5 bg-[#A0A5B8]/20 text-[#A0A5B8] rounded-full font-semibold whitespace-nowrap">
                          Important
                        </span>
                      )}
                      {item.priority === 'low' && (
                        <span className="text-xs px-3 py-1.5 bg-[#7A7E8C]/20 text-[#7A7E8C] rounded-full font-semibold whitespace-nowrap">
                          Optional
                        </span>
                      )}
                      <button className="text-[#A0A5B8] hover:text-[#FF7B54] opacity-0 group-hover:opacity-100 transition-all duration-300 text-lg hover:scale-125">
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {selectedItems.length === 0 && (
                <div className="text-center py-20">
                  <p className="text-[#A0A5B8]">No items in {selectedCategory} yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <DashboardFooter />
      </div>

      {/* Add Packing Item Modal */}
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-500"
          style={{ 
            opacity: showAddModal ? 1 : 0,
            pointerEvents: showAddModal ? 'auto' : 'none'
          }}
          onClick={() => setShowAddModal(false)}
        />
        
        {/* Modal */}
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
          <div 
            className="bg-gradient-to-br from-[#1A1D26] to-[#13151A] border border-[#2A2D35] rounded-3xl p-8 max-w-md w-full pointer-events-auto shadow-2xl shadow-black/50 transition-all duration-500 ease-out"
            style={{ 
              opacity: showAddModal ? 1 : 0,
              transform: showAddModal ? 'scale(1) translateY(0)' : 'scale(0.85) translateY(40px)'
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <p className="text-xs text-[#FF7B54] font-bold tracking-widest uppercase mb-2">Add Item</p>
                <h2 className="text-2xl font-bold text-white">New Packing Item</h2>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#A0A5B8] hover:text-white transition-colors duration-200 p-2 hover:bg-[#2A2D35] rounded-lg ml-4 flex-shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddItem} className="space-y-6">
              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  name="item"
                  value={formData.item}
                  onChange={handleInputChange}
                  placeholder="e.g. Swimwear"
                  className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white placeholder-[#7A7E8C] hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-[#13151A] border border-[#2A2D35] rounded-xl text-white hover:border-[#2A2D35]/80 focus:border-[#FF7B54] focus:outline-none transition-all duration-300 focus:ring-1 focus:ring-[#FF7B54]/30 focus:shadow-lg focus:shadow-[#FF7B54]/10 cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Importance/Priority */}
              <div>
                <label className="block text-xs font-bold text-[#FF7B54] uppercase tracking-widest mb-3">
                  Importance
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: 'high' }))}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border ${
                      formData.priority === 'high'
                        ? 'bg-[#FF7B54]/20 border-[#FF7B54] text-[#FF7B54] shadow-lg shadow-[#FF7B54]/20'
                        : 'bg-transparent border-[#2A2D35] text-[#A0A5B8] hover:border-[#FF7B54]/50'
                    }`}
                  >
                    Essential
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: 'medium' }))}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border ${
                      formData.priority === 'medium'
                        ? 'bg-[#A0A5B8]/20 border-[#A0A5B8] text-[#A0A5B8] shadow-lg shadow-[#A0A5B8]/20'
                        : 'bg-transparent border-[#2A2D35] text-[#A0A5B8] hover:border-[#A0A5B8]/50'
                    }`}
                  >
                    Important
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: 'low' }))}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-all duration-300 border ${
                      formData.priority === 'low'
                        ? 'bg-[#7A7E8C]/20 border-[#7A7E8C] text-[#7A7E8C] shadow-lg shadow-[#7A7E8C]/20'
                        : 'bg-transparent border-[#2A2D35] text-[#A0A5B8] hover:border-[#7A7E8C]/50'
                    }`}
                  >
                    Optional
                  </button>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3.5 bg-gradient-to-r from-[#FF7B54] to-[#FF9F6F] hover:from-[#FF9F6F] hover:to-[#FFA880] text-white font-bold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-[#FF7B54]/50 hover:scale-105 active:scale-95"
                >
                  Add Item
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-6 py-3.5 bg-[#2A2D35] hover:bg-[#3A3F4A] text-white font-semibold rounded-full transition-all duration-300 hover:shadow-lg hover:shadow-black/30 hover:scale-105 active:scale-95 border border-[#3A3F4A]"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </>
    </main>
  );
}

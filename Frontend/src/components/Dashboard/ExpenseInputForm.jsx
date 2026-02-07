import React, { useState, useEffect } from 'react';

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Other']

const ExpenseInputForm = ({ onSaveExpense, onClose, userId, expenseToEdit }) => {
  const [formData, setFormData] = useState({
    userId,
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        userId,
        description: expenseToEdit.description || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'Food',
        date: expenseToEdit.date || new Date().toISOString().split('T')[0],
        notes: expenseToEdit.notes || ''
      });
    }
  }, [expenseToEdit, userId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.amount || parseFloat(formData.amount) <= 0) newErrors.amount = 'Please enter a valid amount';
    if (!formData.date) newErrors.date = 'Date is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSaveExpense({
        ...formData,
        userId,
        amount: parseFloat(formData.amount),
        _id: expenseToEdit?._id
      });
      onClose();
    } catch (error) {
      console.error('Error submitting expense:', error);
      setErrors({ submit: 'Failed to submit expense. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{expenseToEdit ? 'Edit Expense' : 'Add Expense'}</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">✕</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.description ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm`}
                placeholder="e.g., Grocery shopping"
              />
              {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description}</p>}
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount ($) *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full pl-8 pr-4 py-3 rounded-xl border-2 ${errors.amount ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm`}
                />
              </div>
              {errors.amount && <p className="mt-1 text-xs text-red-600">{errors.amount}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-4 py-3 rounded-xl border-2 ${errors.date ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm`}
              />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Notes (Optional)</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Additional details..."
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition text-sm resize-none"
              />
            </div>

            {errors.submit && <div className="p-3 rounded-lg bg-red-50 border border-red-200"><p className="text-sm text-red-600">{errors.submit}</p></div>}

            <div className="flex space-x-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition-colors text-sm">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm">
                {isSubmitting ? 'Saving...' : expenseToEdit ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseInputForm;

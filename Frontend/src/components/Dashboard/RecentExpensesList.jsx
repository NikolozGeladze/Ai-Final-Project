import React, { useState } from 'react';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const getCategoryIcon = (category) => {
  const icons = {
    Food: "M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z",
    Transport: "M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2",
    Entertainment: "M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    Shopping: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
    Utilities: "M13 10V3L4 14h7v7l9-11h-7z",
    Education: "M12 3v18m9-9H3m18 0l-9-6-9 6 9 6 9-6z",
    Other: "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
  };
  return icons[category] || icons.Other;
};

const RecentExpensesList = ({ expenses, onDeleteExpense, onEditClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortByPrice, setSortByPrice] = useState('none'); // 'asc' or 'desc'

  // Filter expenses based on search & category
  let filteredExpenses = expenses.filter(exp => 
    selectedCategory === 'All' || exp.category === selectedCategory
  );

  // Apply price sorting if selected
  if (sortByPrice === 'asc') {
    filteredExpenses.sort((a, b) => Number(a.amount) - Number(b.amount));
  } else if (sortByPrice === 'desc') {
    filteredExpenses.sort((a, b) => Number(b.amount) - Number(a.amount));
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Expenses</h3>

        <div className="flex items-center space-x-2">
          {/* Search */}
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Category + Sort Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              const value = e.target.value;
              if (value === "PriceLow") setSortByPrice('asc');
              else if (value === "PriceHigh") setSortByPrice('desc');
              else {
                setSortByPrice('none');
                setSelectedCategory(value);
              }
            }}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="All">All</option>
            {['Food', 'Transport', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Other'].map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
            <option value="PriceLow">Sort by Price: Low to High</option>
            <option value="PriceHigh">Sort by Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No expenses found.</p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense._id}
              className="flex items-center justify-between p-3 rounded-lg border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getCategoryIcon(expense.category)} />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{expense.description}</p>
                  <p className="text-xs text-gray-500">{expense.category} • {expense.date}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-gray-900">${Number(expense.amount || 0).toFixed(2)}</span>
                <button
                  onClick={() => onEditClick(expense)}
                  className="text-blue-500 hover:text-blue-700 transition-colors p-1 rounded"
                  title="Edit"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDeleteExpense(expense._id)}
                  className="text-red-400 hover:text-red-600 transition-colors p-1 rounded"
                  title="Delete"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentExpensesList;

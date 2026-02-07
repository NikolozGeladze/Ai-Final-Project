import React from 'react'

const CustomTooltip = ({ active, payload, label, expenses, linear }) => {
  const COLORS = ['#EF4444', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#9CA3AF'];
  if (linear) {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const [labelMonthName, labelYear] = label.split(' ');
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        const monthName = expenseDate.toLocaleString('default', { month: 'short' });
        const year = expenseDate.getFullYear().toString();
        return monthName === labelMonthName && year === labelYear;
      });

      return (
        <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <p className="flex flex-col text-sm text-gray-600 mb-1">
            <label>
              <span className="text-blue-500">● </span>
              Total: ${data.total.toFixed(2)}
            </label>
            {monthExpenses.map((expense, index) => (
              <label key={index}>
                <span style={{ color: COLORS[index % COLORS.length] }}>● </span>
                {expense.category}: ${expense.amount.toFixed(2)}
              </label>
            ))}
          </p>
          {data.categories && data.categories.length > 0 && (
            <div className="text-sm text-gray-500">
              {data.categories.map((cat, index) => (
                <p key={index}>
                  {cat.category}: ${cat.amount.toFixed(2)}
                </p>
              ))}
            </div>
          )}
        </div>
      )
    }

    return null;
  }
}
  export default CustomTooltip;

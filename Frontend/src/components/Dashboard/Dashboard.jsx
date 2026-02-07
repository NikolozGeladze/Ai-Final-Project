import React, { useState, useEffect } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts'
import SummaryCard from './SummaryCard'
import ChartCard from './ChartCard'
import CustomTooltip from './CustomTooltip'
import CustomPieTooltip from './CustomPieTooltip'
import AIInsightsCard from './AIInsightsCard'
import ExpenseInputForm from './ExpenseInputForm'
import RecentExpensesList from './RecentExpensesList'
import axios from 'axios'

const COLORS = ['#EF4444', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#9CA3AF'];

const CATEGORIES = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Education', 'Utilities', 'Other'];

const getCategoryColor = (category) => {
  const index = CATEGORIES.indexOf(category);
  return index !== -1 ? COLORS[index] : COLORS[COLORS.length - 1];
};
const calculateChartData = (expenses) => {
  const validExpenses = expenses.filter(exp => exp && exp.category && typeof exp.amount === 'number')
  const categoryTotals = {}

  validExpenses.forEach(exp => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  const monthlySpendingData = CATEGORIES.map(category => ({
    category,
    amount: categoryTotals[category] || 0
  }))

  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)

  const expenseDistributionData = CATEGORIES.map(category => ({
    name: category,
    value: categoryTotals[category] || 0,
    percentage: total > 0 ? ((categoryTotals[category] || 0) / total * 100).toFixed(1) : 0
  })).filter(item => item.value > 0)

  return { monthlySpendingData, expenseDistributionData }
}

// Safely calculate 6-month trends
const calculateSpendingTrends = (expenses) => {
  const validExpenses = expenses.filter(exp => exp && exp.date && typeof exp.amount === 'number')
  const trendsMap = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = d.toLocaleString('default', { month: 'short', year: 'numeric' })
    trendsMap[key] = 0
  }

  validExpenses.forEach(exp => {
    const month = new Date(exp.date).toLocaleString('default', { month: 'short', year: 'numeric' })
    if (trendsMap[month] !== undefined) trendsMap[month] += exp.amount
  })

  return Object.entries(trendsMap).map(([month, total]) => ({ month, total }))
}

const Dashboard = ({ fetchExpenses, addExpense, deleteExpense, userId, currentUser, loadAIInsights, logout }) => {
  const [expenseToEdit, setExpenseToEdit] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [monthlySpendingData, setMonthlySpendingData] = useState([])
  const [expenseDistributionData, setExpenseDistributionData] = useState([])
  const [spendingTrendsData, setSpendingTrendsData] = useState([])
  const [activePieIndex, setActivePieIndex] = useState(null)
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [insights, setInsights] = useState([])
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showDateDropdown, setShowDateDropdown] = useState(false);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const filteredExpenses = expenses.filter(exp => {
    const matchesCategory = selectedCategory === 'All' || exp.category === selectedCategory;
    const matchesSearch = exp.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const dateFilteredExpenses = expenses.filter(exp => {
    if (!exp.date) return false;

    const expenseDate = new Date(exp.date);

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    if (from && expenseDate < from) return false;
    if (to && expenseDate > to) return false;

    return true;
  });

  useEffect(() => {
    const { monthlySpendingData, expenseDistributionData } =
      calculateChartData(dateFilteredExpenses);

    setMonthlySpendingData(monthlySpendingData);
    setExpenseDistributionData(expenseDistributionData);
    setSpendingTrendsData(calculateSpendingTrends(dateFilteredExpenses));

  }, [fromDate, toDate, expenses]);


  // Fetch and update expenses
  const updateExpenses = async () => {
    if (!userId) return
    const data = await fetchExpenses(userId)
    if (data && Array.isArray(data)) {
      const filteredData = data.filter(exp => exp && typeof exp.amount === 'number')
      setExpenses(filteredData)

      const { monthlySpendingData, expenseDistributionData } = calculateChartData(filteredData)
      setMonthlySpendingData(monthlySpendingData)
      setExpenseDistributionData(expenseDistributionData)
      setSpendingTrendsData(calculateSpendingTrends(filteredData))
    }
  }

  useEffect(() => {
    updateExpenses()
  }, [userId])

  const handleSaveExpense = async (expense) => {
    try {
      let updatedExpenses

      if (expense._id) {
        const response = await axios.put(
          `http://localhost:5000/api/expenses/${expense._id}`,
          expense,
          { withCredentials: true }
        )
        if (!response.data.expense) throw new Error('Invalid expense returned from backend')
        updatedExpenses = expenses.map(e => e._id === expense._id ? response.data.expense : e)
      } else {
        const response = await addExpense({ ...expense, userId })
        if (!response.expense) throw new Error('Invalid expense returned from backend')
        updatedExpenses = [response.expense, ...expenses]
      }

      setExpenses(updatedExpenses)
      const { monthlySpendingData, expenseDistributionData } = calculateChartData(updatedExpenses)
      setMonthlySpendingData(monthlySpendingData)
      setExpenseDistributionData(expenseDistributionData)
      setSpendingTrendsData(calculateSpendingTrends(updatedExpenses))
      setShowExpenseForm(false)
      setExpenseToEdit(null)
    } catch (err) {
      console.error('Error saving expense:', err)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    const success = await deleteExpense(expenseId)
    if (success) {
      const updatedExpenses = expenses.filter(exp => exp._id !== expenseId)
      setExpenses(updatedExpenses)
      const { monthlySpendingData, expenseDistributionData } = calculateChartData(updatedExpenses)
      setMonthlySpendingData(monthlySpendingData)
      setExpenseDistributionData(expenseDistributionData)
      setSpendingTrendsData(calculateSpendingTrends(updatedExpenses))
    }
  }

  // ----- Calculations for summary cards -----
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const currentMonthExpenses = expenses.filter(exp => exp && exp.date).filter(exp => {
    const d = new Date(exp.date)
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear
  })

  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)
  const currentMonthTransactions = currentMonthExpenses.length

  const lastMonthDate = new Date(currentYear, currentMonth - 1, 1)
  const lastMonth = lastMonthDate.getMonth()
  const lastMonthYear = lastMonthDate.getFullYear()

  const lastMonthExpenses = expenses.filter(exp => exp && exp.date).filter(exp => {
    const d = new Date(exp.date)
    return d.getMonth() === lastMonth && d.getFullYear() === lastMonthYear
  })

  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0)

  let monthChange = 0
  if (lastMonthTotal > 0) {
    monthChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
  }

  const monthYearMap = {}
  expenses.forEach(exp => {
    if (!exp || !exp.date) return
    const d = new Date(exp.date)
    const key = `${d.getFullYear()}-${d.getMonth()}`
    monthYearMap[key] = (monthYearMap[key] || 0) + exp.amount
  })
  const totalMonths = Object.keys(monthYearMap).length || 1
  const avgMonthlySpend = expenses.length > 0
    ? Object.values(monthYearMap).reduce((sum, val) => sum + val, 0) / totalMonths
    : 0

  const categoryTotals = {}
  expenses.forEach(exp => {
    if (exp && exp.category) categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount
  })

  const top3Categories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([cat]) => cat)
    .join(', ') || 'No data yet'

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDateDropdown && !event.target.closest('.relative')) {
        setShowDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDateDropdown]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 lg:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">AI Expense Analyzer</h1>
          <p className="text-gray-600 mt-1">
            Track, analyze, and optimize your spending with AI-powered insights
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowExpenseForm(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">Add Expense</span>
          </button>
          <button
            onClick={() => logout()}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <SummaryCard
            title="Total Monthly Spending"
            value={`$${currentMonthTotal.toFixed(2)}`}
            subtitle={`${currentMonthTransactions} transactions`}
            color="blue"
          />
          <SummaryCard
            title="Top Categories"
            value={top3Categories.split(',')[0] || 'None'}
            subtitle={top3Categories}
            color="purple"
          />
          <SummaryCard
            title="vs Last Month"
            value={`${monthChange >= 0 ? '+' : ''}${monthChange.toFixed(1)}%`}
            subtitle={monthChange >= 0 ? 'Increased spending' : 'Reduced spending'}
            color={monthChange >= 0 ? 'orange' : 'green'}
          />
          <SummaryCard
            title="Avg Monthly Spend"
            value={`$${avgMonthlySpend.toFixed(2)}`}
            subtitle="Across all months"
            color="green"
          />
        </div>
        {/* Recent Expenses */}
        <RecentExpensesList
          expenses={expenses}
          onDeleteExpense={handleDeleteExpense}
          onEditClick={(expense) => {
            setExpenseToEdit(expense)
            setShowExpenseForm(true)
          }}
        />

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard height={380}>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
              <h1 className='font-semibold text-lg text-gray-800'>Spending by Category</h1>
              <div className="relative">
                <button
                  onClick={() => setShowDateDropdown(!showDateDropdown)}
                  className="flex items-center gap-2 border rounded-lg px-4 py-2 text-sm bg-white hover:bg-gray-50 transition"
                >
                  <span className="text-gray-700">
                    {fromDate || toDate ? `${fromDate || '...'} - ${toDate || '...'}` : 'Total'}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showDateDropdown ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showDateDropdown && (
                  <div className="absolute right-0 top-full mt-2 bg-white border rounded-lg shadow-lg p-4 z-10 min-w-[300px]">
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-gray-600 block mb-1">From</label>
                        <input
                          type="date"
                          value={fromDate}
                          onChange={(e) => setFromDate(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 block mb-1">To</label>
                        <input
                          type="date"
                          value={toDate}
                          onChange={(e) => setToDate(e.target.value)}
                          className="w-full border rounded-lg px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => {
                            setFromDate('');
                            setToDate('');
                            setShowDateDropdown(false);
                          }}
                          className="flex-1 text-sm bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
                        >
                          Reset
                        </button>
                        <button
                          onClick={() => setShowDateDropdown(false)}
                          className="flex-1 text-sm bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={monthlySpendingData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="category" tick={{ fontSize: 12 }} stroke="#6B7280" />
                <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                <Tooltip content={<CustomTooltip linear={false} />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} name="Amount">
                  {monthlySpendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard height={320}>
            <div className="flex justify-between items-center mb-3 flex-wrap gap-3">
              <h1 className='font-semibold text-lg text-gray-800'>Expense Distribution</h1>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => percentage > 0 ? `${name}: ${percentage}%` : ''}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                  onMouseEnter={(_, index) => setActivePieIndex(index)}
                  onMouseLeave={() => setActivePieIndex(null)}
                >
                  {expenseDistributionData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      opacity={activePieIndex === null || activePieIndex === index ? 1 : 0.6}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChartCard title="6-Month Spending Trends" height={320}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spendingTrendsData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6B7280" />
                  <Tooltip content={<CustomTooltip linear={true} expenses={expenses} />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: '#3B82F6', r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Total Spending"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          <div className="lg:col-span-1">
            <AIInsightsCard
              insights={insights}
              loadAIInsights={loadAIInsights}
              setInsights={setInsights}
            />
          </div>
        </div>
      </div>

      {showExpenseForm && (
        <ExpenseInputForm
          onSaveExpense={handleSaveExpense}
          onClose={() => {
            setShowExpenseForm(false)
            setExpenseToEdit(null)
          }}
          userId={userId}
          expenseToEdit={expenseToEdit}
        />
      )}
    </div>
  )
}

export default Dashboard

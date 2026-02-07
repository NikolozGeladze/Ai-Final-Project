import React from 'react'

const COLORS = ['#EF4444', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4', '#9CA3AF'];
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-lg border border-gray-200">
        <p className="text-sm font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-sm text-gray-600">Amount: ${payload[0].value}</p>
        <p className="text-sm text-gray-600">Percentage: {payload[0].payload.percentage}%</p>
      </div>
    )
  }
  return null
}

export default CustomPieTooltip
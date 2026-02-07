import React from 'react'

const ChartCard = ({ title, children, height = 300 }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        {children}
      </div>
    </div>
  )
}

export default ChartCard
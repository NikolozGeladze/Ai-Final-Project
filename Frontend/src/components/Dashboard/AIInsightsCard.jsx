import React, { useState } from "react";

const AIInsightsCard = ({ insights, loadAIInsights, setInsights }) => {
  const [loading, setLoading] = useState(false);

  const icons = {
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),

    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),

    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    )
  };

  const typeStyles = {
    warning: "bg-orange-50 border-orange-200 text-orange-700",
    success: "bg-green-50 border-green-200 text-green-700",
    info: "bg-blue-50 border-blue-200 text-blue-700"
  };


  // Generate AI
  const handleGenerate = async () => {
    setLoading(true);

    const data = await loadAIInsights();

    setInsights(data);

    setLoading(false);
  };


  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition-shadow duration-200">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">

        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-3">

            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3
                m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547
                A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531
                c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>

          </div>

          <h3 className="text-lg font-semibold text-gray-800">
            AI Insights & Tips
          </h3>
        </div>


        {/* Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-3 py-1.5 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? "Analyzing..." : "Generate AI"}
        </button>

      </div>


      {/* Empty */}
      {!insights?.length && !loading && (
        <p className="text-sm text-gray-500 text-center">
          No AI insights yet
        </p>
      )}


      {/* Results */}
      <div className="space-y-3">

        {insights?.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${typeStyles[insight.type]} flex items-start space-x-3`}
          >

            <div className="flex-shrink-0 mt-0.5">
              {icons[insight.type]}
            </div>

            <p className="text-sm font-medium">
              {insight.text}
            </p>

          </div>
        ))}

      </div>

    </div>
  );
};

export default AIInsightsCard;

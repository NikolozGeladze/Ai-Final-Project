import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Login = (props) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('') // reset previous error
    try {
      await props.login(formData)
    } catch (err) {
      // Display backend error message if available
      const msg = err.response?.data?.message || 'Login failed'
      setError(msg)
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] max-h-[700px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="lg:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 lg:p-8 relative overflow-hidden">
            <div className="relative z-10 flex flex-col h-full text-white">
              <div className="mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-9 h-9 bg-white bg-opacity-20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xl font-bold">BrandName</span>
                </div>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold mb-3 leading-tight">
                  Welcome Back!
                </h1>
                <p className="text-sm lg:text-base text-blue-100 mb-6">
                  Sign in to continue your journey and access all your favorite features.
                </p>
              </div>
            </div>
          </div>
          <div className="lg:w-7/12 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-md mx-auto h-full flex flex-col justify-center">
              <div className="mb-6">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Login In
                </h2>
                <p className="text-sm text-gray-600">Welcome back! Please enter your details</p>
              </div>
              {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="relative">
                  <label htmlFor="password" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <i style={{ transform: 'translateY(10px)' }} className="fa-solid fa-eye cursor-pointer"></i>
                    ) : (
                      <i style={{transform: 'translateY(10px)'}} className="fa-solid fa-eye-slash cursor-pointer"></i>
                    )}
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <label className="relative flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="rememberMe"
                      checked={formData.rememberMe}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border border-gray-300 rounded bg-white peer-checked:bg-blue-600 peer-checked:border-blue-600 flex items-center justify-center transition-colors duration-200">
                      <svg
                        className="w-3 h-3 text-white"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="white"
                        strokeWidth="6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="ml-2 text-xs text-gray-600">Remember me</span>
                  </label>

                  <a href="#" className="text-xs text-blue-600 font-semibold hover:underline hover:text-blue-700">
                    Forgot password?
                  </a>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Log In
                </button>
              </form>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-xs text-gray-600">
                Don't have an account?{' '}
                <Link to="/" className="text-blue-600 font-semibold hover:underline">Sign Up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login

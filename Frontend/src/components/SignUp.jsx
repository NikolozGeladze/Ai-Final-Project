import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const SignUp = (props) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('') // <-- error state

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError(''); // reset previous error

  // Check if passwords match
  if (formData.password !== formData.confirmPassword) {
    setError("Passwords do not match");
    return;
  }

  try {
    // Call signup API
    await props.signUp({
      username: formData.fullName,
      email: formData.email,
      password: formData.password
    });
  } catch (err) {
    // Catch backend errors (like already registered email)
    const msg = err.response?.data?.message || 'Sign up failed';
    setError(msg); // show error in the UI
  }
};


  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl h-[90vh] max-h-[800px] bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full">
          <div className="lg:w-5/12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 p-6 lg:p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
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
                  Start Your Journey Today
                </h1>
                <p className="text-sm lg:text-base text-blue-100 mb-6">
                  Join our community and unlock amazing features designed just for you.
                </p>

                <div className="space-y-3">
                  {[ /* Features omitted for brevity */].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-white border-opacity-20">
                <p className="text-xs lg:text-sm text-blue-100">
                  "This platform has transformed the way we work!"
                </p>
                <p className="text-xs text-blue-200 mt-1">— Sarah Johnson</p>
              </div>
            </div>
          </div>
          <div className="lg:w-7/12 p-6 lg:p-8 overflow-y-auto">
            <div className="max-w-md mx-auto h-full flex flex-col">
              <div className="mb-4">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
                  Create Account
                </h2>
                <p className="text-sm text-gray-600">Get started with your free account</p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-4 p-3 text-sm text-red-700 bg-red-100 rounded">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 flex-1">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition"
                    placeholder="John Doe"
                    required
                  />
                </div>

                {/* Email */}
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

                {/* Password */}
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
                    className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    style={{ transform: 'translateY(6px)' }}
                  >
                    {showPassword ? (
                      <i style={{ transform: 'translateY(-7px)' }} className="fa-solid fa-eye cursor-pointer"></i>
                    ) : (
                      <i style={{ transform: 'translateY(-7px)' }} className="fa-solid fa-eye-slash cursor-pointer"></i>
                    )}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <label htmlFor="confirmPassword" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 text-sm rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                    style={{ transform: 'translateY(6px)' }}
                  >
                    {showConfirmPassword ? (
                      <i style={{ transform: 'translateY(-7px)' }} className="fa-solid fa-eye cursor-pointer"></i>
                    ) : (
                      <i style={{ transform: 'translateY(-7px)' }} className="fa-solid fa-eye-slash cursor-pointer"></i>
                    )}
                  </button>
                </div>

                {/* Terms Checkbox */}
                <div className="flex items-center">
                  <label className="relative flex items-center cursor-pointer text-xs text-gray-600 gap-3">
                    <input type="checkbox" className="peer sr-only" required/>
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
                    <div>
                      I agree to the {}
                      <a style={{color: '#2563EB'}} href="https://drive.google.com/file/d/1ykplyf5bGQOBBM6PAzvDeOKxHqOIF6MK/view?usp=drive_link" target="_blank" rel="noopener noreferrer">
                       Terms
                      </a> and {}
                      <a style={{color: '#2563EB'}} href="https://drive.google.com/file/d/1rY9V6RcqXyGTY0K8cYAergFY9u3-wR22/view?usp=drive_link" target="_blank" rel="noopener noreferrer">
                       Privacy Policy
                      </a>
                    </div>
                  </label>
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold text-sm hover:from-blue-700 hover:to-blue-800 transition duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Create Account
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp

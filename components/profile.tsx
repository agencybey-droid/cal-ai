"use client"

import type React from "react"
import type { MacroGoals } from "../services/types"  // Adjust path if needed (e.g., to "../types")
import { Dispatch, SetStateAction } from "react"  // ADD: For precise setter type
import { SettingsIcon, LogOutIcon } from "./Icons"

interface ProfileProps {
  currentUserId: string | null;  // FIX: Renamed from 'userId', made nullable to match App.tsx state
  isAnonymousUser: boolean;      // ADD: Missing prop from App.tsx
  goals: MacroGoals;
  onGoalsChange: Dispatch<SetStateAction<MacroGoals>>;  // FIX: Use React's setter type for compatibility with setGoals
}

const Profile: React.FC<ProfileProps> = ({ 
  currentUserId,  // FIX: Renamed destructuring
  isAnonymousUser,  // ADD: Destructure new prop
  goals, 
  onGoalsChange 
}) => {
  const handleGoalChange = (key: keyof MacroGoals, value: number) => {
    const updatedGoals = { ...goals, [key]: value }
    onGoalsChange(updatedGoals)  // Now type-safe with setter
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.clear()
      window.location.reload()
    }
  }

  // OPTIONAL: Example usage of new props (e.g., disable save if anonymous)
  // if (isAnonymousUser) {
  //   // Render a note: "Upgrade to save to cloud"
  // }

  return (
    <div className="w-full animate-slide-up">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-orange-50 to-white p-6 sm:p-8 rounded-3xl shadow-md border border-orange-100 mb-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl sm:text-3xl font-bold text-white">📱</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Your Profile</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {isAnonymousUser ? "Anonymous Mode - Local Storage Only" : "Cloud Synced"}  {/* EXAMPLE: Use isAnonymousUser */}
            </p>
          </div>
        </div>
      </div>

      {/* Macro Goals Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-md border border-gray-200 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="w-6 h-6 text-orange-600" />
          <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Daily Macro Goals</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Calories Goal */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Daily Calorie Goal</label>
            <div className="relative">
              <input
                type="number"
                value={goals.calories}
                onChange={(e) => handleGoalChange("calories", Number(e.target.value))}
                className="w-full bg-gradient-to-br from-orange-50 to-white text-gray-900 px-4 py-3 rounded-xl border-2 border-orange-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:outline-none transition-all duration-300 font-semibold text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">kcal</span>
            </div>
          </div>

          {/* Protein Goal */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Protein Goal</label>
            <div className="relative">
              <input
                type="number"
                value={goals.protein}
                onChange={(e) => handleGoalChange("protein", Number(e.target.value))}
                className="w-full bg-gradient-to-br from-green-50 to-white text-gray-900 px-4 py-3 rounded-xl border-2 border-green-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-all duration-300 font-semibold text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">g</span>
            </div>
          </div>

          {/* Carbs Goal */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Carbs Goal</label>
            <div className="relative">
              <input
                type="number"
                value={goals.carbs}
                onChange={(e) => handleGoalChange("carbs", Number(e.target.value))}
                className="w-full bg-gradient-to-br from-blue-50 to-white text-gray-900 px-4 py-3 rounded-xl border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-300 font-semibold text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">g</span>
            </div>
          </div>

          {/* Fat Goal */}
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Fat Goal</label>
            <div className="relative">
              <input
                type="number"
                value={goals.fat}
                onChange={(e) => handleGoalChange("fat", Number(e.target.value))}
                className="w-full bg-gradient-to-br from-red-50 to-white text-gray-900 px-4 py-3 rounded-xl border-2 border-red-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 focus:outline-none transition-all duration-300 font-semibold text-lg"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">g</span>
            </div>
          </div>
        </div>

        {/* Info Text */}
        <p className="text-xs sm:text-sm text-gray-500 mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          💡 Adjust your daily macro goals to match your fitness objectives. Changes are saved automatically to your
          phone.
        </p>
      </div>

      {/* Data Management Section */}
      <div className="bg-gradient-to-br from-red-50 to-white p-6 sm:p-8 rounded-3xl shadow-md border border-red-100">
        <div className="flex items-center gap-3 mb-4">
          <LogOutIcon className="w-6 h-6 text-red-600" />
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Data Management</h3>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          All your food logs and profile data are stored locally on your phone using browser storage.
          {currentUserId && !isAnonymousUser && " Cloud sync enabled."}  {/* EXAMPLE: Use currentUserId and isAnonymousUser */}
        </p>
        <button
          onClick={handleClearData}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 active:from-red-700 active:to-red-800 text-white font-bold py-3 sm:py-4 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg"
        >
          <LogOutIcon className="w-5 h-5" />
          Clear All Data
        </button>
      </div>
    </div>
  )
}

export default Profile
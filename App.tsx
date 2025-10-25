"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import CalendarView from "./components/CalendarView"
import MacroTracker from "./components/MacroTracker"
import Insights from "./components/Insights"
import LogFoodModal from "./components/LogFoodModal"
import LogFoodActions from "./components/LogFoodActions"
import BottomNav from "./components/BottomNav"
import Profile from "./components/profile"
import UserQuizModal from "./components/UserQuizModal"
import type { FoodItem, MacroGoals } from "./types"
import type { LogEntry } from "./services/localStorageService"
import {
  addLogEntry,
  deleteLogEntry,
  subscribeToLogEntries,
  getUserProfile,
  updateUserProfile,
} from "./services/localStorageService"
import { getFormattedDate, isSameDay } from "./utils/dateUtils"
import { XIcon, PlusIcon } from "./components/Icons"

type ModalTab = "camera" | "upload" | "search"

const STORAGE_USER_ID = "local-user"

const App: React.FC = () => {
  const [userInitialized, setUserInitialized] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [loggedFoods, setLoggedFoods] = useState<LogEntry[]>([])
  const [goals, setGoals] = useState<MacroGoals>({ calories: 2000, protein: 150, carbs: 250, fat: 65 })
  const [modalConfig, setModalConfig] = useState<{ isOpen: boolean; initialTab: ModalTab }>({
    isOpen: false,
    initialTab: "camera",
  })
  const [activeSection, setActiveSection] = useState<"main" | "insights" | "calendar" | "profile">("main")
  const [showQuizModal, setShowQuizModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const formattedDate = getFormattedDate(selectedDate)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    const initializeUser = async () => {
      try {
        const profile = await getUserProfile(STORAGE_USER_ID)
        if (!profile) {
          setShowQuizModal(true) // Show quiz if no profile exists
        } else if (profile.macroGoals) {
          setGoals(profile.macroGoals)
        }
      } catch (e) {
        console.error("Failed to initialize user", e)
        setError("Failed to initialize user profile.")
      }
      setUserInitialized(true)
    }

    initializeUser()
  }, [])

  // Page transition effect
  useEffect(() => {
    setIsTransitioning(true)
    const timeout = setTimeout(() => setIsTransitioning(false), 300)
    return () => clearTimeout(timeout)
  }, [activeSection])

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await getUserProfile(STORAGE_USER_ID)
        if (profile?.macroGoals) {
          setGoals(profile.macroGoals)
        }
      } catch (e) {
        console.error("Failed to load user profile", e)
        setError("Failed to load user profile. Using local data.")
      }
    }

    loadUserProfile()
  }, [])

  useEffect(() => {
    const saveGoals = async () => {
      try {
        await updateUserProfile(STORAGE_USER_ID, { macroGoals: goals })
      } catch (e) {
        console.error("Failed to save goals", e)
        setError("Failed to save goals.")
      }
    }

    saveGoals()
  }, [goals])

  useEffect(() => {
    unsubRef.current = subscribeToLogEntries(STORAGE_USER_ID, (entries) => {
      setLoggedFoods(entries)
    })
    return () => {
      unsubRef.current?.()
    }
  }, [])

  const handleAddFood = async (foods: FoodItem[]) => {  // FIX: Accept FoodItem[], async Promise<void>
    if (!foods || foods.length === 0) return;  // Guard empty array

    const newEntries: LogEntry[] = [];  // Collect for batch state update

    try {
      for (const food of foods) {
        const entry: LogEntry = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),  // Unique ID per item
          name: food.name,
          portion: food.portion || '1 serving',  // Fallback if optional in types
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          timestamp: Date.now(),
        };
        newEntries.push(entry);

        await addLogEntry(STORAGE_USER_ID, entry);  // Service appends to localStorage
      }

      // Batch update state (optimistic; subscribeToLogEntries will sync if needed)
      setLoggedFoods((prev) => [...prev, ...newEntries]);
    } catch (e) {
      console.error("Failed to add food logs:", e);
      setError("Failed to add some items. Check storage and retry.");
    }
  }

  const handleRemoveFood = async (id: string) => {
    try {
      await deleteLogEntry(STORAGE_USER_ID, id)
    } catch (e) {
      console.error("Failed to remove food log", e)
      setError("Failed to remove food log.")
    }
  }

  const handleOpenModal = (tab: ModalTab) => {
    setModalConfig({ isOpen: true, initialTab: tab })
  }

  const handleCloseModal = () => {
    setModalConfig({ isOpen: false, initialTab: "camera" })
  }

  const handleNavChange = (section: "main" | "insights" | "calendar" | "profile") => {
    setActiveSection(section)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div
        className={`container mx-auto p-4 sm:p-6 transition-opacity duration-300 ${isTransitioning ? "opacity-50" : "opacity-100"}`}
      >
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-800 border border-red-200 rounded-lg animate-slide-up">
            {error}
            <button onClick={() => setError(null)} className="ml-2 text-sm underline">
              Dismiss
            </button>
          </div>
        )}

        <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {activeSection === "main" && (
            <div className="lg:col-span-2 flex items-center justify-center min-h-[60vh]">
              <LogFoodActions onAction={handleOpenModal} />
            </div>
          )}

          {activeSection === "insights" && (
            <div className="lg:col-span-2">
              <Insights loggedFoods={loggedFoods} goals={goals} />
            </div>
          )}

          {activeSection === "calendar" && (
            <>
              <div className="lg:col-span-2">
                <CalendarView selectedDate={selectedDate} onDateChange={setSelectedDate} loggedFoods={loggedFoods} />
              </div>

              <div className="lg:col-span-1">
                <MacroTracker
                  loggedFoods={loggedFoods.filter((item) => {
                    const ts = item.timestamp
                    return typeof ts === "number" ? isSameDay(new Date(ts), selectedDate) : true
                  })}
                  goals={goals}
                />

                <div className="bg-gray-50 p-6 rounded-2xl shadow-md border border-gray-200 mt-6 animate-slide-up">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-orange-600">Food Log</h2>
                    <button
                      onClick={() => handleOpenModal("search")}
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-all duration-300"
                    >
                      <PlusIcon className="w-4 h-4 inline-block mr-1" /> Add
                    </button>
                  </div>

                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-300 scrollbar-track-gray-100">
                    {loggedFoods.filter((item) => {
                      const ts = item.timestamp
                      return typeof ts === "number" ? isSameDay(new Date(ts), selectedDate) : true
                    }).length > 0 ? (
                      loggedFoods
                        .filter((item) => {
                          const ts = item.timestamp
                          return typeof ts === "number" ? isSameDay(new Date(ts), selectedDate) : true
                        })
                        .map((item) => (
                          <div
                            key={item.id}
                            className="bg-white p-4 rounded-lg grid grid-cols-3 items-center gap-2 border border-gray-200 hover:border-orange-300 transition-all duration-300"
                          >
                            <div className="col-span-2">
                              <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-500">
                                {item.portion} - {item.calories} kcal
                              </p>
                            </div>
                            <div className="text-right text-xs text-gray-600 flex items-center justify-end">
                              P:{item.protein} C:{item.carbs} F:{item.fat}
                              <button
                                onClick={() => handleRemoveFood(item.id)}
                                className="text-gray-400 hover:text-red-600 ml-3 transition-colors flex-shrink-0"
                              >
                                <XIcon className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-400 text-center py-8">No food logged for this day.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "profile" && (
            <div className="lg:col-span-2">
              <Profile currentUserId={STORAGE_USER_ID} isAnonymousUser={false} goals={goals} onGoalsChange={setGoals} />
            </div>
          )}

          {(activeSection === "main" || activeSection === "insights") && (
            <div className="space-y-6">
              <MacroTracker loggedFoods={loggedFoods} goals={goals} />
            </div>
          )}
        </main>

        {modalConfig.isOpen && (
          <LogFoodModal onClose={handleCloseModal} onAddFood={handleAddFood} initialTab={modalConfig.initialTab} />
        )}

        {showQuizModal && (
          <UserQuizModal
            onClose={() => setShowQuizModal(false)}
            onComplete={(newGoals) => {
              setGoals(newGoals)
              setShowQuizModal(false)
            }}
          />
        )}

        {!modalConfig.isOpen && !showQuizModal && (
          <BottomNav active={activeSection} onChange={handleNavChange} onOpenModal={handleOpenModal} />
        )}
      </div>
    </div>
  )
}

export default App

"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Star, Lock, Trophy, CheckCircle } from "lucide-react"

interface LevelSelectScreenProps {
  currentLevel: number
  bestMoves: Record<number, number>
  onSelectLevel: (level: number) => void
  onBack: () => void
}

export function LevelSelectScreen({ currentLevel, bestMoves, onSelectLevel, onBack }: LevelSelectScreenProps) {
  const [selectedPage, setSelectedPage] = useState(0)
  const [levelsPerPage, setLevelsPerPage] = useState(12)
  const [windowHeight, setWindowHeight] = useState(0)
  const totalLevels = 30 // Total number of available levels
  const totalPages = Math.ceil(totalLevels / levelsPerPage)

  // Calculate which levels are unlocked (current level + 2 more)
  const unlockedLevels = currentLevel + 2

  // Set window height after component mounts
  useEffect(() => {
    setWindowHeight(window.innerHeight)

    // Handle window resize
    const handleResize = () => {
      setWindowHeight(window.innerHeight)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Generate background particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 60 + 20,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-8 overflow-hidden"
    >
      {/* Enhanced animated background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-blue-600 to-purple-800 overflow-hidden">
        {/* Animated wave pattern */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wave-pattern" width="200" height="200" patternUnits="userSpaceOnUse">
              <path
                d="M0 25C25 25 25 0 50 0C75 0 75 25 100 25C125 25 125 0 150 0C175 0 175 25 200 25V50C175 50 175 75 150 75C125 75 125 50 100 50C75 50 75 75 50 75C25 75 25 50 0 50V25Z"
                fill="rgba(255, 255, 255, 0.2)"
              >
                <animate
                  attributeName="d"
                  dur="15s"
                  repeatCount="indefinite"
                  values="
                    M0 25C25 25 25 0 50 0C75 0 75 25 100 25C125 25 125 0 150 0C175 0 175 25 200 25V50C175 50 175 75 150 75C125 75 125 50 100 50C75 50 75 75 50 75C25 75 25 50 0 50V25Z;
                    M0 35C25 35 25 10 50 10C75 10 75 35 100 35C125 35 125 10 150 10C175 10 175 35 200 35V60C175 60 175 85 150 85C125 85 125 60 100 60C75 60 75 85 50 85C25 85 25 60 0 60V35Z;
                    M0 25C25 25 25 0 50 0C75 0 75 25 100 25C125 25 125 0 150 0C175 0 175 25 200 25V50C175 50 175 75 150 75C125 75 125 50 100 50C75 50 75 75 50 75C25 75 25 50 0 50V25Z
                  "
                />
              </path>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#wave-pattern)" />
        </svg>

        {/* Floating particles */}
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10 backdrop-blur-sm"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -50, 0],
              x: [0, Math.random() * 30 - 15, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Light rays */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={`ray-${i}`}
            className="absolute bg-white/10"
            style={{
              width: `${Math.random() * 300 + 100}px`,
              height: `${Math.random() * 1000 + 500}px`,
              left: `${Math.random() * 100}%`,
              top: `-200px`,
              transformOrigin: "top center",
              transform: `rotate(${Math.random() * 20 - 10}deg)`,
            }}
            animate={{
              opacity: [0.05, 0.15, 0.05],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />
        ))}

        {/* Water tube decorations */}
        <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-20">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0C50 0 0 50 0 75C0 88.8071 22.3858 100 50 100C77.6142 100 100 88.8071 100 75C100 50 50 0 50 0Z"
              fill="rgba(59, 130, 246, 0.5)"
            />
          </svg>
        </div>
        <div className="absolute -top-10 -right-10 w-40 h-40 opacity-20 rotate-180">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0C50 0 0 50 0 75C0 88.8071 22.3858 100 50 100C77.6142 100 100 88.8071 100 75C100 50 50 0 50 0Z"
              fill="rgba(168, 85, 247, 0.5)"
            />
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="relative w-full max-w-4xl px-4 mb-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={onBack} className="text-white">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-white text-center">Select Level</h1>
          <div className="w-20"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Level grid */}
      <div className="w-full max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/20 backdrop-blur-md rounded-xl p-6 border border-white/30 shadow-xl"
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: levelsPerPage }).map((_, i) => {
              const levelNumber = i + 1 + selectedPage * levelsPerPage
              const isUnlocked = levelNumber <= unlockedLevels
              const isCompleted = bestMoves[levelNumber] !== undefined
              const isCurrent = levelNumber === currentLevel

              return (
                <motion.div
                  key={levelNumber}
                  whileHover={isUnlocked ? { scale: 1.05 } : {}}
                  whileTap={isUnlocked ? { scale: 0.95 } : {}}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-xl ${
                    isUnlocked
                      ? isCompleted
                        ? "bg-gradient-to-br from-green-500/80 to-green-700/80 cursor-pointer"
                        : isCurrent
                          ? "bg-gradient-to-br from-blue-500/80 to-blue-700/80 cursor-pointer"
                          : "bg-gradient-to-br from-purple-500/80 to-purple-700/80 cursor-pointer"
                      : "bg-gray-500/50 cursor-not-allowed"
                  } border border-white/30 shadow-lg overflow-hidden`}
                  onClick={() => isUnlocked && onSelectLevel(levelNumber)}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id={`grid-${levelNumber}`} width="10" height="10" patternUnits="userSpaceOnUse">
                          <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill={`url(#grid-${levelNumber})`} />
                    </svg>
                  </div>

                  {/* Level number */}
                  <span className="text-2xl font-bold text-white">{levelNumber}</span>

                  {/* Status indicators */}
                  {!isUnlocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Lock className="h-6 w-6 text-white/80" />
                    </div>
                  )}

                  {isCompleted && (
                    <div className="absolute top-1 right-1">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                  )}

                  {isCurrent && (
                    <motion.div
                      className="absolute inset-0 border-2 border-white rounded-xl"
                      animate={{ opacity: [0.4, 0.8, 0.4] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                    />
                  )}

                  {/* Best score */}
                  {isCompleted && (
                    <div className="absolute bottom-1 text-xs text-white/90 font-medium">
                      {bestMoves[levelNumber]} moves
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <Button
                  key={i}
                  variant={selectedPage === i ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedPage(i)}
                  className={selectedPage === i ? "bg-blue-500" : "bg-white/50"}
                >
                  {i + 1}
                </Button>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full max-w-4xl px-4 mt-6"
      >
        <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30 shadow-xl">
          <div className="flex flex-wrap justify-around gap-4">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500 p-2 rounded-full">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm">Current Level</p>
                <p className="text-white font-bold">{currentLevel}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-green-500 p-2 rounded-full">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm">Completed</p>
                <p className="text-white font-bold">
                  {Object.keys(bestMoves).length} / {totalLevels}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-yellow-500 p-2 rounded-full">
                <Star className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-white text-sm">Best Score</p>
                <p className="text-white font-bold">
                  {Object.values(bestMoves).length > 0 ? Math.min(...Object.values(bestMoves)) : "-"} moves
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Falling water drops */}
      {typeof window !== "undefined" &&
        Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={`drop-${i}`}
            className="fixed w-2 h-3 z-10 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
            }}
            animate={{
              y: [0, windowHeight + 20],
              x: [0, Math.sin(i) * 50],
              opacity: [0, 0.7, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Number.POSITIVE_INFINITY,
              delay: Math.random() * 5,
              ease: "easeIn",
            }}
          >
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 0C4 0 0 5 0 8C0 10.2091 1.79086 12 4 12C6.20914 12 8 10.2091 8 8C8 5 4 0 4 0Z"
                fill="rgba(255, 255, 255, 0.4)"
              />
            </svg>
          </motion.div>
        ))}
    </motion.div>
  )
}


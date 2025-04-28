"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tube } from "./tube"
import { Button } from "@/components/ui/button"
import { RefreshCw, Undo, Award, Volume2, VolumeX, HelpCircle, Settings } from "lucide-react"
import confetti from "canvas-confetti"
import { IntroScreen } from "./intro-screen"
import { WaterDrop } from "./water-drop"
import { LevelSelectScreen } from "./level-select-screen"

// Define color palette for water segments with gradient pairs
const COLORS = [
  { base: "bg-red-500", light: "bg-red-400", dark: "bg-red-600", rgb: "239, 68, 68" },
  { base: "bg-blue-500", light: "bg-blue-400", dark: "bg-blue-600", rgb: "59, 130, 246" },
  { base: "bg-green-500", light: "bg-green-400", dark: "bg-green-600", rgb: "34, 197, 94" },
  { base: "bg-yellow-500", light: "bg-yellow-400", dark: "bg-yellow-600", rgb: "234, 179, 8" },
  { base: "bg-purple-500", light: "bg-purple-400", dark: "bg-purple-600", rgb: "168, 85, 247" },
  { base: "bg-pink-500", light: "bg-pink-400", dark: "bg-pink-600", rgb: "236, 72, 153" },
  { base: "bg-orange-500", light: "bg-orange-400", dark: "bg-orange-600", rgb: "249, 115, 22" },
  { base: "bg-teal-500", light: "bg-teal-400", dark: "bg-teal-600", rgb: "20, 184, 166" },
]

// Number of segments in each tube
const SEGMENTS_PER_TUBE = 4

// Generate a random level
const generateLevel = (numTubes: number, numColors: number) => {
  // Create empty tubes
  const tubes: string[][] = Array(numTubes)
    .fill(null)
    .map(() => [])

  // Fill tubes with random colors
  const totalSegments = (numTubes - 2) * SEGMENTS_PER_TUBE
  const segmentsPerColor = totalSegments / numColors

  // Create an array with all color segments
  let allSegments: string[] = []
  for (let i = 0; i < numColors; i++) {
    for (let j = 0; j < segmentsPerColor; j++) {
      allSegments.push(COLORS[i].base)
    }
  }

  // Shuffle the segments
  allSegments = allSegments.sort(() => Math.random() - 0.5)

  // Distribute segments to tubes
  for (let i = 0; i < numTubes - 2; i++) {
    tubes[i] = allSegments.slice(i * SEGMENTS_PER_TUBE, (i + 1) * SEGMENTS_PER_TUBE)
  }

  return tubes
}

// Check if the game is complete
const isGameComplete = (tubes: string[][]) => {
  return tubes.every(
    (tube) => tube.length === 0 || (tube.length === SEGMENTS_PER_TUBE && tube.every((segment) => segment === tube[0])),
  )
}

// Check if a pour is valid
const isValidPour = (fromTube: string[], toTube: string[]) => {
  if (fromTube.length === 0) return false
  if (toTube.length === SEGMENTS_PER_TUBE) return false

  const topColorFrom = fromTube[fromTube.length - 1]

  // If destination tube is empty, pour is valid
  if (toTube.length === 0) return true

  // If top colors match, pour is valid
  const topColorTo = toTube[toTube.length - 1]
  return topColorFrom === topColorTo
}

// Count consecutive same colors at the top of the tube
const countConsecutiveColors = (tube: string[]) => {
  if (tube.length === 0) return 0

  const topColor = tube[tube.length - 1]
  let count = 0

  for (let i = tube.length - 1; i >= 0; i--) {
    if (tube[i] === topColor) {
      count++
    } else {
      break
    }
  }

  return count
}

// Get RGB values from color name
const getRgbFromColor = (color: string) => {
  const colorObj = COLORS.find((c) => c.base === color)
  return colorObj ? colorObj.rgb : "255, 255, 255"
}

export default function WaterSortPuzzle() {
  const [tubes, setTubes] = useState<string[][]>([])
  const [selectedTubeIndex, setSelectedTubeIndex] = useState<number | null>(null)
  const [moves, setMoves] = useState(0)
  const [gameComplete, setGameComplete] = useState(false)
  const [isPouring, setIsPouring] = useState(false)
  const [moveHistory, setMoveHistory] = useState<string[][][]>([])
  const [level, setLevel] = useState(1)
  const [showIntro, setShowIntro] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [bestMoves, setBestMoves] = useState<Record<number, number>>({})
  const [waterDrops, setWaterDrops] = useState<
    {
      id: number
      fromPos: { x: number; y: number }
      toPos: { x: number; y: number }
      color: string
      delay: number
    }[]
  >([])
  const [nextDropId, setNextDropId] = useState(0)
  const [pouringTubes, setPouringTubes] = useState<{
    fromIndex: number
    toIndex: number
  } | null>(null)

  const [gameTheme, setGameTheme] = useState<"water" | "lava" | "slime">("water")
  const [showHint, setShowHint] = useState(false)
  const [hintTimeout, setHintTimeout] = useState<NodeJS.Timeout | null>(null)
  const [comboCount, setComboCount] = useState(0)
  const [showCombo, setShowCombo] = useState(false)
  const [confettiColors, setConfettiColors] = useState<string[]>([
    "#ff0000",
    "#00ff00",
    "#0000ff",
    "#ffff00",
    "#ff00ff",
    "#00ffff",
  ])
  const [levelStartTime, setLevelStartTime] = useState<number | null>(null)
  const [levelTime, setLevelTime] = useState<number | null>(null)
  const [showLevelSelect, setShowLevelSelect] = useState(false)

  // Refs for tube elements
  const tubeRefs = useRef<(HTMLDivElement | null)[]>([])

  // Sound effects
  const pourSoundRef = useRef<HTMLAudioElement | null>(null)
  const completeSoundRef = useRef<HTMLAudioElement | null>(null)
  const selectSoundRef = useRef<HTMLAudioElement | null>(null)
  const successSoundRef = useRef<HTMLAudioElement | null>(null)

  // Initialize sounds
  useEffect(() => {
    pourSoundRef.current = new Audio("/placeholder.svg?height=1&width=1") // Replace with actual sound URL
    completeSoundRef.current = new Audio("/placeholder.svg?height=1&width=1") // Replace with actual sound URL
    selectSoundRef.current = new Audio("/placeholder.svg?height=1&width=1") // Replace with actual sound URL
    successSoundRef.current = new Audio("/placeholder.svg?height=1&width=1") // Replace with actual sound URL

    // Preload sounds
    pourSoundRef.current.load()
    completeSoundRef.current.load()
    selectSoundRef.current.load()
    successSoundRef.current.load()

    return () => {
      pourSoundRef.current = null
      completeSoundRef.current = null
      selectSoundRef.current = null
      successSoundRef.current = null
    }
  }, [])

  // Load best moves from localStorage
  useEffect(() => {
    const savedBestMoves = localStorage.getItem("waterSortBestMoves")
    if (savedBestMoves) {
      setBestMoves(JSON.parse(savedBestMoves))
    }
  }, [])

  // Save best moves to localStorage
  useEffect(() => {
    if (gameComplete && (!bestMoves[level] || moves < bestMoves[level])) {
      const newBestMoves = { ...bestMoves, [level]: moves }
      setBestMoves(newBestMoves)
      localStorage.setItem("waterSortBestMoves", JSON.stringify(newBestMoves))
    }
  }, [gameComplete, moves, level, bestMoves])

  // Play sound helper
  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound && soundEnabled) {
      sound.currentTime = 0
      sound.play().catch((e) => console.log("Error playing sound:", e))
    }
  }

  // Initialize the game
  useEffect(() => {
    if (!showIntro) {
      startNewGame()
    }
  }, [level, showIntro])

  // Check for game completion
  useEffect(() => {
    if (tubes.length > 0 && isGameComplete(tubes) && !gameComplete) {
      setGameComplete(true)

      // Play completion sound
      playSound(successSoundRef.current)

      // Trigger confetti effect
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: confettiColors,
      })
    }
  }, [tubes, gameComplete])

  const startNewGame = () => {
    const numTubes = Math.min(5 + Math.floor(level / 2), 10) // Increase tubes with level, max 10
    const numColors = numTubes - 2
    const newTubes = generateLevel(numTubes, numColors)
    setTubes(newTubes)
    setSelectedTubeIndex(null)
    setMoves(0)
    setGameComplete(false)
    setMoveHistory([])
    setPouringTubes(null)
    // Reset tube refs array
    tubeRefs.current = Array(numTubes).fill(null)

    setLevelStartTime(Date.now())
    setLevelTime(null)
    setComboCount(0)
    setShowCombo(false)
  }

  const getHint = () => {
    if (isPouring || gameComplete) return

    // Find a valid move
    for (let i = 0; i < tubes.length; i++) {
      if (tubes[i].length === 0) continue

      for (let j = 0; j < tubes.length; j++) {
        if (i === j) continue

        if (isValidPour(tubes[i], tubes[j])) {
          // Show hint
          setShowHint(true)
          setPouringTubes({
            fromIndex: i,
            toIndex: j,
          })

          // Clear previous timeout
          if (hintTimeout) {
            clearTimeout(hintTimeout)
          }

          // Hide hint after 2 seconds
          const timeout = setTimeout(() => {
            setShowHint(false)
            setPouringTubes(null)
          }, 2000)

          setHintTimeout(timeout)
          return
        }
      }
    }
  }

  const handleTubeClick = (index: number) => {
    if (isPouring || gameComplete) return

    if (selectedTubeIndex === null) {
      // Select tube
      setSelectedTubeIndex(index)
      playSound(selectSoundRef.current)
    } else if (selectedTubeIndex === index) {
      // Deselect tube
      setSelectedTubeIndex(null)
    } else {
      // Try to pour from selected tube to this tube
      const fromTube = [...tubes[selectedTubeIndex]]
      const toTube = [...tubes[index]]

      if (isValidPour(fromTube, toTube)) {
        // Save current state to history
        setMoveHistory([...moveHistory, JSON.parse(JSON.stringify(tubes))])

        // Perform the pour
        setIsPouring(true)
        playSound(pourSoundRef.current)

        // Calculate how many segments to pour (consecutive same colors)
        const count = countConsecutiveColors(fromTube)
        const topColor = fromTube[fromTube.length - 1]

        // Set pouring tubes for animation
        setPouringTubes({
          fromIndex: selectedTubeIndex,
          toIndex: index,
        })

        // Get tube element positions for animation
        const fromTubeEl = tubeRefs.current[selectedTubeIndex]
        const toTubeEl = tubeRefs.current[index]

        if (fromTubeEl && toTubeEl) {
          const fromRect = fromTubeEl.getBoundingClientRect()
          const toRect = toTubeEl.getBoundingClientRect()

          // Wait for tube tilt animation to start before creating water drops
          setTimeout(() => {
            // Create water drops for animation - more drops for a more fluid effect
            const newDrops = []

            // Calculate exact positions for top layer transfer
            const sourceWaterTop = fromRect.top + 50 - fromTube.length * 14 + 5
            const destWaterTop = toRect.top + 50 - toTube.length * 14 + 5

            // Create more drops with varied positions for a more realistic pour
            for (let i = 0; i < 25; i++) {
              // Add slight randomness to drop positions for natural look
              const randomOffsetX = Math.random() * 6 - 3
              const randomOffsetY = Math.random() * 4 - 2

              newDrops.push({
                id: nextDropId + i,
                fromPos: {
                  x: fromRect.left + fromRect.width / 2 + randomOffsetX,
                  y: sourceWaterTop + randomOffsetY,
                },
                toPos: {
                  x: toRect.left + toRect.width / 2 + randomOffsetX,
                  y: destWaterTop + randomOffsetY,
                },
                color: topColor,
                delay: i * 0.03, // Faster drops for more fluid motion
              })
            }

            setWaterDrops(newDrops)
            setNextDropId(nextDropId + 25)
          }, 300)
        }

        // Create new tubes array with the pour
        const newTubes = [...tubes]

        // Remove segments from source tube
        newTubes[selectedTubeIndex] = newTubes[selectedTubeIndex].slice(0, -count)

        // Add segments to destination tube with delay
        setTimeout(() => {
          setTubes((prevTubes) => {
            const updatedTubes = [...prevTubes]
            for (let i = 0; i < count; i++) {
              updatedTubes[index] = [...updatedTubes[index], topColor]
            }
            return updatedTubes
          })

          // Reset pouring tubes
          setTimeout(() => {
            setPouringTubes(null)
          }, 300)

          // Reset selection and increment moves after animation
          setTimeout(() => {
            setSelectedTubeIndex(null)
            setMoves(moves + 1)
            setIsPouring(false)
            setWaterDrops([])

            setTubes((prevTubes) => {
              const updatedTubes = [...prevTubes]
              if (isGameComplete([...updatedTubes])) {
                setGameComplete(true)
                setLevelTime(Date.now() - (levelStartTime || Date.now()))

                // Set confetti colors based on tubes
                const colors = tubes
                  .filter((tube) => tube.length > 0)
                  .map((tube) => {
                    const colorName = tube[0].replace("bg-", "").replace("-500", "")
                    switch (colorName) {
                      case "red":
                        return "#ef4444"
                      case "blue":
                        return "#3b82f6"
                      case "green":
                        return "#22c55e"
                      case "yellow":
                        return "#eab308"
                      case "purple":
                        return "#a855f7"
                      case "pink":
                        return "#ec4899"
                      case "orange":
                        return "#f97316"
                      case "teal":
                        return "#14b8a6"
                      default:
                        return "#ffffff"
                    }
                  })

                if (colors.length > 0) {
                  setConfettiColors(colors)
                }
              } else {
                // Check for combo (consecutive successful moves)
                setComboCount((prev) => prev + 1)
                if (comboCount >= 2) {
                  setShowCombo(true)
                  setTimeout(() => setShowCombo(false), 1500)
                }
              }
              return updatedTubes
            })
          }, 600)
        }, 1000) // Wait for animation to complete

        // Update source tube immediately
        setTubes(newTubes)
      } else {
        // Invalid move, just deselect
        setSelectedTubeIndex(null)
      }
    }
  }

  const undoMove = () => {
    if (moveHistory.length > 0) {
      const previousState = moveHistory[moveHistory.length - 1]
      setTubes(previousState)
      setMoveHistory(moveHistory.slice(0, -1))
      setMoves(moves + 1) // Count undo as a move
      setSelectedTubeIndex(null)
    }
  }

  const nextLevel = () => {
    setLevel(level + 1)
  }

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled)
  }

  if (showIntro) {
    return (
      <IntroScreen
        onStart={() => {
          setShowIntro(false)
          setShowLevelSelect(true)
        }}
      />
    )
  }

  if (showLevelSelect) {
    return (
      <LevelSelectScreen
        currentLevel={level}
        bestMoves={bestMoves}
        onSelectLevel={(selectedLevel) => {
          setLevel(selectedLevel)
          setShowLevelSelect(false)
        }}
        onBack={() => setShowIntro(true)}
      />
    )
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Dynamic background */}
      <div
        className={`fixed inset-0 -z-10 overflow-hidden transition-colors duration-1000 ${
          gameTheme === "water"
            ? "bg-gradient-to-b from-blue-50 to-purple-100"
            : gameTheme === "lava"
              ? "bg-gradient-to-b from-orange-50 to-red-100"
              : "bg-gradient-to-b from-green-50 to-teal-100"
        }`}
      >
        {/* Theme-based background elements */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="pattern" width="200" height="200" patternUnits="userSpaceOnUse">
                <path
                  d="M0 25C25 25 25 0 50 0C75 0 75 25 100 25C125 25 125 0 150 0C175 0 175 25 200 25V50C175 50 175 75 150 75C125 75 125 50 100 50C75 50 75 75 50 75C25 75 25 50 0 50V25Z"
                  fill={
                    gameTheme === "water"
                      ? "rgba(59, 130, 246, 0.3)"
                      : gameTheme === "lava"
                        ? "rgba(249, 115, 22, 0.3)"
                        : "rgba(20, 184, 166, 0.3)"
                  }
                >
                  <animate
                    attributeName="d"
                    dur="10s"
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
            <rect width="100%" height="100%" fill="url(#pattern)" />
          </svg>
        </div>

        {/* Enhanced background patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        {/* Floating bubbles with theme colors */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`bubble-${i}`}
            className={`absolute rounded-full backdrop-blur-sm border border-white/20 ${
              gameTheme === "water" ? "bg-blue-500/10" : gameTheme === "lava" ? "bg-orange-500/10" : "bg-teal-500/10"
            }`}
            style={{
              width: `${Math.random() * 60 + 20}px`,
              height: `${Math.random() * 60 + 20}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -Math.random() * 300 - 100],
              x: [0, Math.random() * 100 - 50],
              rotate: [0, Math.random() * 360],
              opacity: [0.4, 0.1],
            }}
            transition={{
              duration: Math.random() * 20 + 15,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Light rays */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={`ray-${i}`}
              className={`absolute bg-gradient-to-b ${
                gameTheme === "water"
                  ? "from-blue-300/40"
                  : gameTheme === "lava"
                    ? "from-orange-300/40"
                    : "from-teal-300/40"
              } to-transparent`}
              style={{
                width: `${Math.random() * 200 + 100}px`,
                height: `${Math.random() * 800 + 400}px`,
                left: `${Math.random() * 100}%`,
                top: `-200px`,
                transformOrigin: "top center",
                transform: `rotate(${Math.random() * 20 - 10}deg)`,
              }}
              animate={{
                opacity: [0.1, 0.3, 0.1],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>

        {/* Decorative elements */}
        <div className="absolute -bottom-20 -left-20 w-80 h-80 opacity-10">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0C50 0 0 50 0 75C0 88.8071 22.3858 100 50 100C77.6142 100 100 88.8071 100 75C100 50 50 0 50 0Z"
              fill={
                gameTheme === "water"
                  ? "rgba(59, 130, 246, 0.5)"
                  : gameTheme === "lava"
                    ? "rgba(249, 115, 22, 0.5)"
                    : "rgba(20, 184, 166, 0.5)"
              }
            />
          </svg>
        </div>
        <div className="absolute -top-20 -right-20 w-80 h-80 opacity-10 rotate-180">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M50 0C50 0 0 50 0 75C0 88.8071 22.3858 100 50 100C77.6142 100 100 88.8071 100 75C100 50 50 0 50 0Z"
              fill={
                gameTheme === "water"
                  ? "rgba(168, 85, 247, 0.5)"
                  : gameTheme === "lava"
                    ? "rgba(239, 68, 68, 0.5)"
                    : "rgba(16, 185, 129, 0.5)"
              }
            />
          </svg>
        </div>

        {/* Falling drops */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`drop-${i}`}
            className="absolute w-2 h-3 pointer-events-none"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
            }}
            animate={{
              y: [0, window.innerHeight + 20],
              x: [0, Math.sin(i) * 50],
              opacity: [0, 0.4, 0],
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
                fill={
                  gameTheme === "water"
                    ? "rgba(59, 130, 246, 0.4)"
                    : gameTheme === "lava"
                      ? "rgba(249, 115, 22, 0.4)"
                      : "rgba(20, 184, 166, 0.4)"
                }
              />
            </svg>
          </motion.div>
        ))}
      </div>

      <div className="w-full max-w-4xl">
        {/* Improve the UI with a better header and controls */}
        <div className="flex justify-between items-center w-full mb-6">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-2 rounded-full ${
                gameTheme === "water" ? "bg-blue-500" : gameTheme === "lava" ? "bg-orange-500" : "bg-teal-500"
              }`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 0C12 0 0 12 0 18C0 21.3137 5.37258 24 12 24C18.6274 24 24 21.3137 24 18C24 12 12 0 12 0Z"
                  fill="white"
                />
              </svg>
            </motion.div>
            <h1 className="text-3xl font-bold text-blue-800">Water Sort Puzzle</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLevelSelect(true)}
              className="bg-white/80 shadow-md"
            >
              Levels
            </Button>
            <Button variant="outline" size="icon" onClick={toggleSound} className="bg-white/80 shadow-md">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowSettings(true)}
              className="bg-white/80 shadow-md"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <div
              className={`ml-2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                gameTheme === "water"
                  ? "bg-blue-100 text-blue-800"
                  : gameTheme === "lava"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-teal-100 text-teal-800"
              }`}
            >
              {gameTheme === "water" ? "Water" : gameTheme === "lava" ? "Lava" : "Slime"} Theme
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowTutorial(true)}
              className="bg-white/80 shadow-md"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-between w-full mb-6 bg-white/50 backdrop-blur-sm p-4 rounded-xl shadow-md">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={startNewGame}
              className="bg-white shadow-md hover:bg-blue-50"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={undoMove}
              disabled={moveHistory.length === 0 || isPouring}
              className="bg-white shadow-md hover:bg-blue-50"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={getHint}
              disabled={isPouring || gameComplete}
              className="bg-white shadow-md hover:bg-blue-50"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col items-center justify-center bg-white px-6 py-2 rounded-lg shadow-md">
              <span className="text-sm text-gray-500">Level</span>
              <span className="font-bold text-blue-800 text-xl">{level}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-white px-6 py-2 rounded-lg shadow-md">
              <span className="text-sm text-gray-500">Moves</span>
              <span className="font-bold text-blue-800 text-xl">{moves}</span>
              {bestMoves[level] && <span className="text-xs text-gray-500">Best: {bestMoves[level]}</span>}
            </div>
          </div>
        </div>
        <div className="w-full mt-4 bg-white/30 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              gameTheme === "water" ? "bg-blue-500" : gameTheme === "lava" ? "bg-orange-500" : "bg-teal-500"
            }`}
            style={{ width: `${Math.min(100, (level / 10) * 100)}%` }}
          ></div>
        </div>

        {/* Improve the game container with better styling */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8 p-6 bg-white/40 backdrop-blur-md rounded-xl shadow-lg relative border border-white/50"
          style={{
            boxShadow: "0 8px 32px rgba(31, 38, 135, 0.15)",
            backdropFilter: "blur(8px)",
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Add a decorative pattern to the background */}
          <div className="absolute inset-0 opacity-5 rounded-xl overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          {tubes.map((tube, index) => (
            <div key={index} ref={(el) => (tubeRefs.current[index] = el)}>
              <Tube
                segments={tube}
                isSelected={selectedTubeIndex === index}
                onClick={() => handleTubeClick(index)}
                isPouringFrom={pouringTubes?.fromIndex === index}
                isPouringTo={pouringTubes?.toIndex === index}
                pouringToIndex={pouringTubes?.toIndex}
                tubeIndex={index}
                theme={gameTheme}
                isHint={showHint && (pouringTubes?.fromIndex === index || pouringTubes?.toIndex === index)}
              />
            </div>
          ))}

          {/* Water drops animation */}
          {waterDrops.map((drop) => (
            <WaterDrop
              key={drop.id}
              fromPos={drop.fromPos}
              toPos={drop.toPos}
              color={getRgbFromColor(drop.color)}
              delay={drop.delay}
              theme={gameTheme}
            />
          ))}
        </motion.div>
      </div>

      <AnimatePresence>
        {gameComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div
              className={`bg-white rounded-xl p-8 shadow-2xl flex flex-col items-center max-w-sm mx-4 border-t-4 ${
                gameTheme === "water"
                  ? "border-blue-500"
                  : gameTheme === "lava"
                    ? "border-orange-500"
                    : "border-teal-500"
              }`}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.2, 1], opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Award className="w-20 h-20 text-yellow-500 mb-4" />
              </motion.div>
              <h2 className="text-3xl font-bold text-blue-800 mb-2">Level Complete!</h2>
              <p className="text-gray-600 mb-2 text-center">
                You completed level {level} in {moves} moves!
              </p>
              {levelTime && (
                <p className="text-gray-600 mb-2 text-center">Time: {Math.floor(levelTime / 1000)} seconds</p>
              )}
              {bestMoves[level] && bestMoves[level] === moves && (
                <p className="text-green-600 font-bold mb-6">New Best Score!</p>
              )}
              {bestMoves[level] && bestMoves[level] !== moves && (
                <p className="text-gray-500 mb-6">Best: {bestMoves[level]} moves</p>
              )}
              <div className="flex gap-4">
                <Button variant="outline" onClick={startNewGame} className="px-6">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Replay
                </Button>
                <Button
                  onClick={nextLevel}
                  className={`bg-gradient-to-r ${
                    gameTheme === "water"
                      ? "from-blue-500 to-purple-600"
                      : gameTheme === "lava"
                        ? "from-orange-500 to-red-600"
                        : "from-teal-500 to-green-600"
                  } px-6`}
                >
                  Next Level
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md mx-4">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">How to Play</h2>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <span className="block w-4 h-4 bg-blue-500 rounded-full"></span>
                  </div>
                  <p>Click on a tube to select it.</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <span className="block w-4 h-4 bg-blue-500 rounded-full"></span>
                  </div>
                  <p>Click on another tube to pour water from the selected tube.</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <span className="block w-4 h-4 bg-blue-500 rounded-full"></span>
                  </div>
                  <p>You can only pour water if the colors match or if the destination tube is empty.</p>
                </li>
                <li className="flex items-start gap-2">
                  <div className="bg-blue-100 p-1 rounded-full mt-1">
                    <span className="block w-4 h-4 bg-blue-500 rounded-full"></span>
                  </div>
                  <p>The goal is to sort all water so each tube contains only one color or is empty.</p>
                </li>
              </ul>
              <div className="flex justify-center">
                <Button onClick={() => setShowTutorial(false)}>Got it!</Button>
              </div>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
          >
            <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md mx-4">
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Settings</h2>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span>Sound Effects</span>
                  <Button variant={soundEnabled ? "default" : "outline"} onClick={toggleSound} size="sm">
                    {soundEnabled ? "On" : "Off"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <span>Current Level</span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => level > 1 && setLevel(level - 1)}
                      disabled={level <= 1}
                    >
                      -
                    </Button>
                    <span className="w-8 text-center">{level}</span>
                    <Button variant="outline" size="sm" onClick={() => setLevel(level + 1)}>
                      +
                    </Button>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="font-semibold mb-2">Best Scores</h3>
                  <div className="max-h-40 overflow-y-auto">
                    {Object.entries(bestMoves).length > 0 ? (
                      Object.entries(bestMoves)
                        .sort(([a], [b]) => Number.parseInt(a) - Number.parseInt(b))
                        .map(([lvl, score]) => (
                          <div key={lvl} className="flex justify-between py-1">
                            <span>Level {lvl}</span>
                            <span className="font-medium">{score} moves</span>
                          </div>
                        ))
                    ) : (
                      <p className="text-gray-500 text-sm">No scores yet. Complete levels to see your best scores!</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem("waterSortBestMoves")
                    setBestMoves({})
                  }}
                >
                  Reset Scores
                </Button>
                <Button onClick={() => setShowSettings(false)}>Close</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {showCombo && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -20 }}
          className={`fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 px-6 py-3 rounded-full font-bold text-2xl ${
            gameTheme === "water"
              ? "bg-blue-500 text-white"
              : gameTheme === "lava"
                ? "bg-orange-500 text-white"
                : "bg-teal-500 text-white"
          } shadow-lg z-50`}
        >
          Combo x{comboCount}!
        </motion.div>
      )}
      {/* Add a footer with game info */}
      <div className="w-full max-w-4xl mb-4">
        <div className="text-center text-sm text-gray-500">
          <p>Water Sort Puzzle • Enhanced Edition • v2.0</p>
        </div>
      </div>
    </div>
  )
}


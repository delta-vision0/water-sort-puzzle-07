"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"

interface IntroScreenProps {
  onStart: () => void
}

export function IntroScreen({ onStart }: IntroScreenProps) {
  const [showButton, setShowButton] = useState(false)
  const [tubeAnimations, setTubeAnimations] = useState<
    {
      height: number
      color: string
      delay: number
    }[]
  >([])
  const [windowHeight, setWindowHeight] = useState(0)
  const [windowWidth, setWindowWidth] = useState(0)

  useEffect(() => {
    // Create tube animations
    const animations = [
      { height: 60, color: "bg-red-500", delay: 0.2 },
      { height: 40, color: "bg-blue-500", delay: 0.4 },
      { height: 80, color: "bg-green-500", delay: 0.6 },
      { height: 50, color: "bg-purple-500", delay: 0.8 },
    ]
    setTubeAnimations(animations)

    // Show the play button after animations
    const timer = setTimeout(() => setShowButton(true), 2000)

    // Set window dimensions
    if (typeof window !== "undefined") {
      setWindowHeight(window.innerHeight)
      setWindowWidth(window.innerWidth)

      const handleResize = () => {
        setWindowHeight(window.innerHeight)
        setWindowWidth(window.innerWidth)
      }

      window.addEventListener("resize", handleResize)
      return () => {
        clearTimeout(timer)
        window.removeEventListener("resize", handleResize)
      }
    }

    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-600 to-purple-800">
        {/* Animated wave patterns */}
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

        {/* Light rays */}
        {Array.from({ length: 8 }).map((_, i) => (
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
      </div>
      <div className="relative mb-8">
        {/* Animated tubes */}
        <div className="flex gap-4 mb-8">
          {tubeAnimations.map((tube, i) => (
            <motion.div
              key={i}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                delay: i * 0.2,
                duration: 0.8,
                type: "spring",
                stiffness: 100,
              }}
              className="relative w-12 h-48 rounded-b-3xl overflow-hidden border-2 border-white/50 bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-md"
              style={{
                boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
              }}
            >
              {/* Glass tube 3D effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/10" />
                <div className="absolute top-0 left-0 w-[2px] h-full bg-white/70 rounded-full" />
                <div className="absolute top-0 right-0 w-[1px] h-full bg-white/30 rounded-full" />
                <div className="absolute top-0 inset-x-0 h-[2px] bg-white/70 rounded-full" />
              </div>
              {/* Water animations */}
              <motion.div
                initial={{ height: "0%" }}
                animate={{
                  height: ["0%", `${tube.height}%`, `${tube.height - 20}%`, `${tube.height - 10}%`],
                  y: [0, 0, 5, 0],
                }}
                transition={{
                  delay: tube.delay,
                  duration: 2,
                  times: [0, 0.6, 0.8, 1],
                  ease: "easeInOut",
                }}
                className={`absolute bottom-0 left-0 w-full ${tube.color} rounded-t-sm overflow-hidden`}
              >
                {/* Enhanced water appearance */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>
                <div className="absolute inset-x-0 bottom-0 h-1/4 bg-black/10"></div>
                {/* Enhanced water surface */}
                <>
                  <motion.div
                    className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-full transform -translate-y-1/2"
                    animate={{
                      scaleX: [1, 1.05, 1],
                      opacity: [0.4, 0.5, 0.4],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute top-0 inset-x-[25%] h-0.5 bg-white/60 rounded-full transform -translate-y-1/2"
                    animate={{
                      scaleX: [1, 0.8, 1],
                      x: [0, 2, 0],
                      opacity: [0.6, 0.7, 0.6],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.5,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                  />
                </>

                {/* Bubbles */}
                {Array.from({ length: 3 }).map((_, j) => (
                  <motion.div
                    key={j}
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
                    style={{
                      left: `${Math.random() * 80 + 10}%`,
                      bottom: `${Math.random() * 50}%`,
                    }}
                    animate={{
                      y: [0, -20],
                      opacity: [0.4, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: Math.random() * 3,
                    }}
                  />
                ))}
              </motion.div>
              {/* Glass reflection */}
              <div className="absolute top-0 left-1 w-2 h-full bg-white/20 rounded-full" />
              {/* Add tube base */}
              <div className="w-16 h-3 bg-gradient-to-b from-white/50 to-white/30 rounded-b-lg mt-0.5 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/10" />
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Animated pouring effect */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: [-100, 0, -100], opacity: [0, 1, 0] }}
          transition={{ delay: 1, duration: 2, times: [0, 0.5, 1] }}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-5"
              style={{
                left: `${Math.random() * 20 - 10}px`,
                top: `${i * 5}px`,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0], y: [0, 30] }}
              transition={{
                delay: 1 + i * 0.05,
                duration: 0.5,
                ease: "easeIn",
              }}
            >
              <svg width="12" height="20" viewBox="0 0 12 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M6 0C6 0 0 8 0 12C0 16.4183 2.68629 20 6 20C9.31371 20 12 16.4183 12 12C12 8 6 0 6 0Z"
                  fill="rgba(59, 130, 246, 0.8)"
                />
              </svg>
            </motion.div>
          ))}
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="relative mb-4"
        >
          <h1
            className="text-5xl font-bold text-center text-white tracking-tight"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}
          >
            Water Sort
          </h1>
          <motion.span
            className="block text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300 font-extrabold"
            animate={{
              textShadow: [
                "0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(59,130,246,0.3)",
                "0 0 10px rgba(255,255,255,0.5), 0 0 20px rgba(59,130,246,0.5)",
                "0 0 5px rgba(255,255,255,0.5), 0 0 10px rgba(59,130,246,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
          >
            Puzzle
          </motion.span>

          {/* 3D floating effect */}
          <motion.div
            className="absolute -z-10 inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur-xl"
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 1, 0],
              y: [0, -5, 0],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          />
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.5 }}
          className="text-blue-100 text-center text-lg mb-8"
        >
          Sort the colored water and test your puzzle skills
        </motion.p>

        {/* Play button */}
        {showButton && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex justify-center"
          >
            <Button
              onClick={onStart}
              size="lg"
              className="relative bg-gradient-to-r from-blue-400 to-purple-500 hover:from-blue-500 hover:to-purple-600 text-white px-8 py-6 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.4)] hover:shadow-[0_0_25px_rgba(79,70,229,0.6)] transition-all border border-white/20 z-10"
            >
              <Play className="mr-2 h-5 w-5" />
              Play Now
            </Button>
          </motion.div>
        )}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="absolute bottom-4 left-0 right-0 text-center text-blue-100/70 text-xs"
        ></motion.div>
      </div>

      {/* Floating bubbles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== "undefined" ? window.innerHeight : 800),
            scale: Math.random() * 0.5 + 0.5,
          }}
          animate={{
            y: [null, Math.random() * -200 - 100],
            x: [null, Math.random() * 100 - 50],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
          className="absolute rounded-full bg-white/10 backdrop-blur-sm"
          style={{
            width: `${Math.random() * 30 + 10}px`,
            height: `${Math.random() * 30 + 10}px`,
          }}
        />
      ))}
      {/* Falling water drops */}
      {typeof window !== "undefined" &&
        Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`drop-${i}`}
            className="absolute w-2 h-3"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-20px`,
            }}
            animate={{
              y: [0, windowHeight + 20],
              x: [0, Math.sin(i) * 50],
              opacity: [0, 1, 0],
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


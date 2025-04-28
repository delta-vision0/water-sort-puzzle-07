"use client"

import { motion } from "framer-motion"

interface TubeProps {
  segments: string[]
  isSelected: boolean
  onClick: () => void
  isPouringFrom?: boolean
  isPouringTo?: boolean
  pouringToIndex?: number | null
  tubeIndex: number
  theme?: "water" | "lava" | "slime" // Add this line
  isHint?: boolean // Add this line
}

export function Tube({
  segments,
  isSelected,
  onClick,
  isPouringFrom = false,
  isPouringTo = false,
  pouringToIndex,
  tubeIndex,
  theme = "water", // Add this line
  isHint = false, // Add this line
}: TubeProps) {
  // Calculate empty spaces
  const emptySpaces = 4 - segments.length

  // Calculate the rotation angle for pouring animation
  const getRotation = () => {
    if (isPouringFrom) {
      // Calculate direction based on target tube index
      if (pouringToIndex !== null && pouringToIndex !== undefined) {
        return pouringToIndex > tubeIndex ? 45 : -45 // Increased tilt angle for more dramatic pour
      }
      return 0
    } else if (isPouringTo) {
      // Slight wobble when receiving water
      return [-2, 2, 0]
    }
    return 0
  }

  // Calculate the translation for pouring animation
  const getTranslation = () => {
    if (isPouringFrom) {
      // Move more toward the target tube
      if (pouringToIndex !== null && pouringToIndex !== undefined) {
        return pouringToIndex > tubeIndex ? 30 : -30 // Increased movement
      }
      return 0
    }
    return 0
  }

  // Calculate the vertical lift for pouring animation
  const getLift = () => {
    if (isPouringFrom) {
      return -30 // Lift higher when pouring
    } else if (isPouringTo) {
      // Slight bounce when receiving water
      return [0, -5, 0]
    }
    return 0
  }

  return (
    <div className="flex flex-col items-center cursor-pointer" onClick={onClick}>
      <style jsx>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(234, 179, 8, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 179, 8, 0); }
        }
      `}</style>
      <motion.div
        className="relative"
        animate={{
          rotate: getRotation(),
          x: getTranslation(),
          y: getLift(),
          transition: {
            type: isPouringTo ? "keyframes" : "spring",
            stiffness: 300,
            damping: 20,
            duration: isPouringTo ? 0.5 : undefined,
          },
        }}
        whileHover={!isPouringFrom && !isPouringTo ? { y: -5, transition: { duration: 0.2 } } : undefined}
        style={{ transformOrigin: "bottom center" }}
      >
        <div
          className={`relative w-14 h-64 flex flex-col items-center justify-end rounded-b-3xl overflow-hidden border-2 ${
            isSelected
              ? `border-${theme === "water" ? "blue" : theme === "lava" ? "orange" : "teal"}-500 shadow-[0_0_15px_rgba(${theme === "water" ? "59,130,246" : theme === "lava" ? "249,115,22" : "20,184,166"},0.5)]`
              : isHint
                ? `border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)]`
                : "border-white/50"
          } bg-gradient-to-b from-white/40 to-white/20 backdrop-blur-md transition-all`}
          style={{
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
            perspective: "1000px",
            transformStyle: "preserve_3d",
            animation: isHint ? "pulse 1.5s infinite" : undefined,
          }}
        >
          {/* Glass tube 3D effect */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Main glass reflection */}
            <div
              className="absolute inset-0 bg-gradient-to-r from-white/50 via-transparent to-white/10"
              style={{ transform: "rotateY(-10deg)" }}
            />

            {/* Edge highlight */}
            <div className="absolute top-0 left-0 w-[2px] h-full bg-white/70 rounded-full" />
            <div className="absolute top-0 right-0 w-[1px] h-full bg-white/30 rounded-full" />

            {/* Top rim highlight */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-white/70 rounded-full" />

            {/* Circular reflection spots */}
            <div className="absolute top-[15%] left-[20%] w-3 h-3 rounded-full bg-white/20 blur-[2px]" />
            <div className="absolute top-[40%] right-[25%] w-2 h-2 rounded-full bg-white/15 blur-[1px]" />
          </div>

          {/* Empty spaces at the top */}
          <div className="absolute inset-0 flex flex-col justify-end">
            {/* Water segments from bottom to top */}
            {segments.map((color, i) => {
              // Extract the color name without the bg- prefix and -500 suffix
              const colorName = color.replace("bg-", "").replace("-500", "")

              return (
                <motion.div
                  key={`segment-${i}`}
                  className={`w-full h-14 relative overflow-hidden`}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 56 }} // 14rem = 56px
                  transition={{
                    duration: 0.5,
                    delay: i * 0.1,
                    type: "spring",
                    stiffness: 100,
                    damping: 15,
                  }}
                >
                  {/* Base color */}
                  <div className={`absolute inset-0 ${color}`}></div>

                  {/* Gradient overlay for more realistic water */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b from-${colorName}-400 to-${colorName}-600 opacity-80`}
                  ></div>

                  {/* Highlight effect */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2"></div>

                  {/* Inner glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5"></div>

                  {/* Depth effect */}
                  <div className="absolute inset-x-0 bottom-0 h-1/4 bg-black/10"></div>

                  {/* Water surface effect for top segment */}
                  {i === segments.length - 1 && (
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
                      {/* Additional surface details */}
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
                  )}

                  {/* Separation line */}
                  {i < segments.length - 1 && segments[i] !== segments[i + 1] && (
                    <div className="absolute bottom-0 inset-x-0 h-px bg-black/10"></div>
                  )}

                  {/* Water bubbles */}
                  {Math.random() > 0.5 && (
                    <motion.div
                      className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
                      style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 80 + 10}%`,
                      }}
                      animate={{
                        y: [0, -10],
                        opacity: [0.4, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatDelay: Math.random() * 5,
                      }}
                    />
                  )}
                </motion.div>
              )
            })}
          </div>

          {/* Glass reflection effects */}
          <div className="absolute top-0 left-0 w-3 h-full bg-gradient-to-r from-white/30 to-transparent rounded-full" />
          <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-l from-white/10 to-transparent rounded-full" />

          {/* Selected indicator */}
          <motion.div
            className={`absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-${
              theme === "water" ? "blue" : theme === "lava" ? "orange" : "teal"
            }-500 rounded-full`}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -10, opacity: 0 }}
          />

          {/* Tube liquid level indicator */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-200/30">
            {segments.map((_, i) => (
              <div
                key={`level-${i}`}
                className="absolute w-full h-px bg-gray-300/50"
                style={{ bottom: `${(i + 1) * 25}%` }}
              />
            ))}
          </div>
        </div>

        {/* Tube base with enhanced 3D effect */}
        <div
          className={`w-20 h-4 bg-gradient-to-b from-gray-200 to-gray-400 rounded-b-lg mt-0.5 shadow-lg relative overflow-hidden ${
            isHint ? "animate-pulse" : ""
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white/30 via-transparent to-black/20" />
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20" />
          <div className="absolute inset-x-[10%] bottom-0 h-[1px] bg-white/30 rounded-full" />
          <div className="absolute inset-y-0 left-[10%] w-[1px] bg-white/20 rounded-full" />
          <div className="absolute inset-y-0 right-[10%] w-[1px] bg-white/20 rounded-full" />
        </div>
        {isPouringTo && (
          <motion.div
            className="absolute top-0 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.3, 1] }}
          >
            {/* Splash effect */}
            {Array.from({ length: 8 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute bg-white/60 rounded-full"
                style={{
                  width: `${Math.random() * 4 + 2}px`,
                  height: `${Math.random() * 4 + 2}px`,
                  left: `${Math.random() * 30 - 15}px`,
                  top: `${Math.random() * 10}px`,
                }}
                initial={{ y: 0, opacity: 0.8 }}
                animate={{
                  y: -Math.random() * 15 - 5,
                  x: Math.random() * 20 - 10,
                  opacity: 0,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}


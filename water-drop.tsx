"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

// Add theme prop to the WaterDropProps interface
interface WaterDropProps {
  fromPos: { x: number; y: number }
  toPos: { x: number; y: number }
  color: string
  delay: number
  theme?: "water" | "lava" | "slime" // Add this line
}

// Update the function parameters to include the new prop
export function WaterDrop({ fromPos, toPos, color, delay, theme = "water" }: WaterDropProps) {
  const [path, setPath] = useState<{ x: number; y: number }[]>([])

  // Generate a curved path for the water drop
  useEffect(() => {
    const midX = (fromPos.x + toPos.x) / 2
    // Create more natural arc with higher control point and slight randomization
    const controlPointX = midX + (Math.random() * 50 - 25)
    const controlPointY = Math.min(fromPos.y, toPos.y) - Math.random() * 40 - 30 // Higher control point

    // Add slight gravity effect
    const gravity = 0.05

    // Create points along a quadratic bezier curve with gravity influence
    const points = []
    for (let t = 0; t <= 1; t += 0.05) {
      // Basic bezier curve
      const x = (1 - t) * (1 - t) * fromPos.x + 2 * (1 - t) * t * controlPointX + t * t * toPos.x
      let y = (1 - t) * (1 - t) * fromPos.y + 2 * (1 - t) * t * controlPointY + t * t * toPos.y

      // Add slight gravity effect in the second half of the animation
      if (t > 0.5) {
        y += gravity * Math.pow((t - 0.5) * 2, 2) * 100
      }

      points.push({ x, y })
    }

    setPath(points)
  }, [fromPos, toPos])

  if (path.length === 0) return null

  return (
    <motion.div
      className="fixed top-0 left-0 z-50 pointer-events-none"
      initial={{
        x: fromPos.x,
        y: fromPos.y,
        opacity: 0,
        scale: 0.5,
        rotate: Math.random() * 30 - 15, // Random initial rotation
      }}
      animate={{
        x: path.map((p) => p.x),
        y: path.map((p) => p.y),
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.5],
        rotate: [Math.random() * 30 - 15, Math.random() * 60 - 30, Math.random() * 30 - 15], // Dynamic rotation during flight
      }}
      transition={{
        duration: 0.8,
        delay,
        times: [0, 0.1, 0.9, 1],
        ease: "easeOut",
      }}
    >
      <div
        className="relative w-4 h-6 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          filter: "drop-shadow(0 2px 3px rgba(0,0,0,0.2))",
        }}
      >
        {/* Water drop shape with enhanced appearance */}
        <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Update the SVG defs to include theme-based effects */}
          {/* Find the defs section and update it to: */}
          <defs>
            <linearGradient id={`dropGradient-${fromPos.x}-${fromPos.y}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={`rgba(${color}, 1)`} />
              <stop offset="100%" stopColor={`rgba(${color}, 0.8)`} />
            </linearGradient>
            <filter id={`dropGlow-${fromPos.x}-${fromPos.y}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            {theme === "lava" && (
              <filter id={`dropFire-${fromPos.x}-${fromPos.y}`} x="-50%" y="-50%" width="200%" height="200%">
                <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
              </filter>
            )}
          </defs>
          {/* Update the path to include theme-based effects */}
          {/* Find the path element and update its attributes to: */}
          <path
            d="M8 0C8 0 0 10 0 16C0 20.4183 3.58172 24 8 24C12.4183 24 16 20.4183 16 16C16 10 8 0 8 0Z"
            fill={`url(#dropGradient-${fromPos.x}-${fromPos.y})`}
            filter={`url(#dropGlow-${fromPos.x}-${fromPos.y}) ${theme === "lava" ? `url(#dropFire-${fromPos.x}-${fromPos.y})` : ""}`}
          />

          {/* Enhanced highlights */}
          <div className="absolute top-1/4 left-1/4 w-1/2 h-1/3 bg-white/50 rounded-full transform rotate-45" />
          <div className="absolute top-1/3 left-1/3 w-1/3 h-1/4 bg-white/30 rounded-full" />

          {/* Trailing micro-drops */}
          <motion.div
            className="absolute top-full left-1/2 w-1.5 h-1.5 rounded-full bg-white/40 transform -translate-x-1/2"
            initial={{ y: -5, opacity: 0 }}
            animate={{ y: 5, opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.5, delay: 0.2 }}
          />

          {/* Additional micro-drop */}
          <motion.div
            className="absolute top-full left-1/3 w-1 h-1 rounded-full bg-white/30 transform"
            initial={{ y: -3, opacity: 0 }}
            animate={{ y: 3, opacity: [0, 0.5, 0] }}
            transition={{ duration: 0.4, delay: 0.3 }}
          />
        </svg>
      </div>
    </motion.div>
  )
}


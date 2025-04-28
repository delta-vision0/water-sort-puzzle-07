"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import the WaterSortPuzzle component with SSR disabled
const WaterSortPuzzle = dynamic(() => import("../water-sort-puzzle"), {
  ssr: false,
  loading: () => <LoadingScreen />,
})

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-purple-800">
      <div className="text-white text-center">
        <h1 className="text-3xl font-bold mb-4">Loading Water Sort Puzzle...</h1>
        <div className="w-16 h-16 border-4 border-blue-300 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <WaterSortPuzzle />
      </Suspense>
    </main>
  )
}


"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import "./MovieSpotlight.css"

const MovieSpotlight: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const resizeCanvas = () => {
      const parent = canvas.parentElement
      if (!parent) return

      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }

    const drawSpotlight = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2 + Math.sin(time / 3000) * canvas.width * 0.05
      const centerY = canvas.height / 2 + Math.cos(time / 4000) * canvas.height * 0.05

      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width * 0.8)

      gradient.addColorStop(0, "rgba(255, 255, 255, 0.15)")
      gradient.addColorStop(0.4, "rgba(255, 255, 255, 0.05)")
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    const animate = (time: number) => {
      drawSpotlight(time)
      animationFrameId = requestAnimationFrame(animate)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    animate(0)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return <canvas ref={canvasRef} className="movie-spotlight" />
}

export default MovieSpotlight

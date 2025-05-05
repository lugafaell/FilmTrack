import type React from "react"
import { motion } from "framer-motion"
import { FilmReelProps } from '../../types/types';
import "./FilmReel.css"

const FilmReel: React.FC<FilmReelProps> = ({ position }) => {
  const yPosition = position === "top" ? "-10px" : "calc(100% - 30px)"
  const opacity = 0.6
  
  return (
    <div className={`film-reel-container ${position}`} style={{ top: yPosition, opacity }}>
      <motion.div
        className="film-reel-track"
        animate={{
          x: "-100%"
        }}
        initial={{
          x: "0%"
        }}
        transition={{
          repeat: Infinity,
          repeatType: "loop",
          duration: 30,
          ease: "linear",
        }}
      >
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i} className="film-segment">
            <div className="film-hole">
              <div className="film-hole-inner"></div>
            </div>
            <div className="film-frame"></div>
          </div>
        ))}
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={`dup-${i}`} className="film-segment">
            <div className="film-hole">
              <div className="film-hole-inner"></div>
            </div>
            <div className="film-frame"></div>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default FilmReel
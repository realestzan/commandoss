"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface MessageLoadingProps {
    text?: string
    className?: string
    fontSize?: string
    fontFamily?: string
}

export default function MessageLoading({
    text = "",
    className = "",
}: MessageLoadingProps) {
    const numberOfLines = useMemo(() => {
        const averageCharsPerLine = 110
        return Math.max(Math.ceil(text.length / averageCharsPerLine), 1)
    }, [text])

    const lineProperties = useMemo(
        () =>
            Array.from({ length: numberOfLines }).map(() => ({
                duration: Math.random() * 1 + 1.5,
                shimmerDuration: Math.random() * 0.5 + 1.2,
                width: Math.random() * 10 + 90,
            })),
        [numberOfLines],
    )

    return (
        <div className={`space-y-2 ${className}`}>
            {/* Original text (invisible but maintains spacing) */}
            <div className="invisible h-0" aria-hidden="true">{text}</div>

            {/* Loading lines */}
            <div className="flex flex-col gap-2">
                {lineProperties.map((props, index) => (
                    <motion.div
                        key={index}
                        className={`relative bg-gradient-to-r from-emerald-500/80 via-emerald-500/30 to-emerald-400/30 
                            dark:from-emerald-500 dark:via-emerald-400/30 dark:to-emerald-300/30 
                            overflow-hidden rounded-md h-6`}
                        style={{
                            width: `${props.width}%`,
                        }}
                        initial={{ opacity: 0.5 }}
                        animate={{
                            opacity: [0.5, 0.3, 0.5],
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                        }}
                        transition={{
                            duration: props.duration,
                            ease: "easeInOut",
                            repeat: Number.POSITIVE_INFINITY,
                        }}
                    >
                        <motion.div
                            className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                            animate={{
                                x: ["-100%", "100%"],
                            }}
                            transition={{
                                duration: props.shimmerDuration,
                                ease: "easeInOut",
                                repeat: Number.POSITIVE_INFINITY,
                            }}
                            style={{
                                clipPath: "inset(0)",
                            }}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}


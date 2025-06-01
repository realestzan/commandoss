'use client'
import { itemVariants } from "@/app/(user)/chat/intro";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useState } from "react";

export default function ChatHistory() {

    const [searchQuery, setSearchQuery] = useState('')

    return (
        <div className="bg-background rounded-3xl p-4 opacity-50 hover:opacity-100 transition-opacity duration-300">

            {/* Recent Chats */}
            <div>
                <motion.h3 variants={itemVariants} className="text-xl font-semibold ">
                    Recent Chats
                </motion.h3>
                <Input
                    placeholder="Search conversations"
                    className="w-full mt-4 p-6 bg-primary/5 rounded-full"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="mt-2 space-y-2">
                    {[
                        "You spent $230 on dining this month — 15% above average.",
                        "Set a savings goal: $1000 for a new laptop by October.",
                    ].map((chat, index) => (
                        <motion.div
                            key={index}
                            variants={itemVariants}
                            className="bg-primary/5 p-4 rounded-3xl text-sm"
                        >
                            {chat}
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    )
}
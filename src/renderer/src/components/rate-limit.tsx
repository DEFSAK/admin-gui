import { secondsLeft, setSecondsLeft } from "@/main";
import { useAPI } from "./api-provider";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

const RateLimitBadge = ({ className }) => {
    const { rate_remaining, rate_limit } = useAPI();
    const percentage = rate_remaining / rate_limit;

    return (
        <div className={cn("p-2 mt-2 bg-chart-1/10 border-2 border-dashed rounded-sm rounded-r-none border-chart-1/50", className)}>
            <div className="flex flex-row gap-2 items-center">
                <span className="text-xs text-muted-foreground">Rate Limit</span>
                <motion.div
                    className="text-foreground text-xs rounded-md px-2 py-1"
                    whileHover={{
                        backgroundColor: percentage > 0.5 ? "rgb(76, 142, 248)" : "rgb(250, 92, 92)",
                    }}
                    animate={{
                        backgroundColor: percentage > 0.5 ? "rgb(59, 130, 246)" : "rgb(239, 68, 68)",
                    }}
                    transition={{
                        duration: 0.5,
                        ease: "easeInOut",
                    }}
                >
                    {rate_remaining}/{rate_limit}
                </motion.div>
            </div>
        </div>
    );
};

const RefreshBadge = ({ className }) => {
    return (
        <div className={cn("p-2 mt-2 bg-chart-1/10 border-2 border-dashed rounded-sm rounded-l-none border-chart-1/50", className)}>
            <div className="flex flex-row gap-2 items-center">
                <span className="text-xs text-muted-foreground">Refresh in</span>
                <motion.div
                    className="text-foreground text-xs rounded-md px-2 py-1"
                    whileHover={{ backgroundColor: "#60a5fa" }}
                    animate={{ backgroundColor: "#3b82f6" }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {secondsLeft}s
                </motion.div>
            </div>
        </div>
    );
}

function RateLimit() {
    const { last_refresh } = useAPI();

    useEffect(() => {
        const updateCountdown = () => {
            const elapsedTime = Date.now() - last_refresh;
            const timeLeft = Math.max(0, 60 - Math.floor(elapsedTime / 1000));
            setSecondsLeft(timeLeft);
        };

        updateCountdown();

        const intervalId = setInterval(updateCountdown, 1000);
        return () => clearInterval(intervalId);
    }, [last_refresh])

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1 }}
            className="flex flex-row"
        >
            <RateLimitBadge className="rounded-r-none" />
            <RefreshBadge className="rounded-l-none" />
        </motion.div>
    )
}

export default RateLimit;
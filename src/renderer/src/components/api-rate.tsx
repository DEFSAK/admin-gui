import { useAPI } from "./api-provider";
import { motion } from "framer-motion";
import { statusMap } from "@/lib/api";
import { cloneElement } from "react";
import { cn } from "@/lib/utils";

interface APIRateProps {
    condition: any | null;
    component: React.ReactElement | null;
    requestFailed: boolean;
    requestStatus: number;
}

function APIRate({ condition, component, requestFailed, requestStatus }: APIRateProps) {
    const rate_remaining = useAPI().rate_remaining;

    const conditionMet = () => {
        return condition !== null;
    }

    const AlertContainer = ({ variant, className, children }) => {
        const variants = {
            error: "bg-red-500/10 border-red-500/50",
            loading: "bg-gray-500/10 border-gray-500/50",
        }

        const selectedVariant = variants[variant] || variants.error;

        return (
            <motion.div
                className={cn("p-2 mt-2 border-2 border-dashed rounded-md", selectedVariant, className)}
            >
                {children}
            </motion.div>
        )
    }

    return (
        <>
            {conditionMet() ? (
                component && cloneElement(component)
            ) : rate_remaining === 0 ? (
                <AlertContainer variant="error" className="flex items-center justify-center">
                    <span className="text-red-400 text-center">
                        {statusMap[429]}
                    </span>
                </AlertContainer>
            ) : requestFailed ? (
                <AlertContainer variant="error" className="flex items-center justify-center">
                    <span className="text-red-400 text-center">
                        {statusMap[requestStatus.toString()]}
                    </span>
                </AlertContainer>
            ) : (
                <AlertContainer variant="loading" className="flex items-center justify-center">
                    <span className="text-gray-400 text-center">
                        Loading
                    </span>
                </AlertContainer>
            )}
        </>
    )
}

export default APIRate;
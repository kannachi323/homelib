import { useState } from "react";

export function useTaskQueue() {
    const [taskQueue, setTaskQueue] = useState<Record<string, () => void>>({});

    const addTask = (taskId: string, callback: () => void) => {
        setTaskQueue((prev) => ({
            ...prev,
            [taskId]: callback,
        }));
    };

    const removeTask = (taskId: string) => {
        setTaskQueue((prev) => {
            prev[taskId]?.();
            const newQueue = { ...prev };
            delete newQueue[taskId];
            return newQueue;
        });
    }

    return {addTask, removeTask, taskQueue};
}
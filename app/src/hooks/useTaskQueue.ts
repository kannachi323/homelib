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
        console.log(`Removing task: ${taskId}`);
        setTaskQueue((prev) => {
            const newQueue = { ...prev }; // copy first
            newQueue[taskId]?.();         // call the callback
            delete newQueue[taskId];      // then delete
            return newQueue;              // return the new object
        });
    };
    

    return {addTask, removeTask, taskQueue};
}
import React, { useEffect, useState } from "react";
import Column from "./Column";
import { getTasks, updateTaskStatus } from "../api/tasks";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

// تعریف اینترفیس برای یک تسک
interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
}

type TaskStatus = "To Do" | "In Progress" | "Done" | "Delete";

const Board: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    const response: Task[] = await getTasks();
    setTasks(response);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const taskId: string = active.id.toString();
    const newStatus: TaskStatus = over.id.toString() as TaskStatus;

    try {
      const updatedTask: Task = await updateTaskStatus(taskId, newStatus);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="board">
        {(["To Do", "In Progress", "Done", "Delete"] as TaskStatus[]).map(
          (status) => (
            <Column key={status} status={status} tasks={tasks} />
          )
        )}
      </div>
    </DndContext>
  );
};

export default Board;

import React from "react";
import { useDraggable } from "@dnd-kit/core";

interface Task {
  _id: string;
  title: string;
  description: string;
}

interface TaskCardProps {
  task: Task;
}

const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: task._id });

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
    </div>
  );
};

export default TaskCard;

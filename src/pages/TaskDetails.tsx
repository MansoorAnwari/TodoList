import { useParams } from "react-router-dom";
import { useTodo } from "../context/TodoContext";
import React from "react";

type TaskStatus = "To Do" | "In Progress" | "Done" | "Delete";

interface Todo {
  _id: string;
  title: string;
  description: string;
  position: number;
  status: TaskStatus;
}

const TaskDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { todos } = useTodo();
  const task = todos.find((todo) => todo._id === id);

  if (!task) return <p>تسک پیدا نشد!</p>;

  return (
    <div className="task-details">
      <h2>{task.title}</h2>
      <p>{task.description}</p>
      <p>وضعیت: {task.status}</p>
    </div>
  );
};

export default TaskDetails;

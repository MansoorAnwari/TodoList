import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";
import React from "react";

type TaskStatus = "To Do" | "In Progress" | "Done" | "Delete";

interface Todo {
  _id: string;
  title: string;
  position: number;
  status: TaskStatus;
}

interface ColumnProps {
  id: string;
  status: TaskStatus;
  todos: Todo[];
}

const Column: React.FC<ColumnProps> = ({ id, status, todos }) => {
  const { setNodeRef } = useDroppable({ id, data: { type: "column", status } });

  const sortedTodos = [...todos].sort((a, b) => a.position - b.position);

  return (
    <div ref={setNodeRef} className="column">
      <h2>{status}</h2>
      <SortableContext
        items={sortedTodos.map((t) => t._id)}
        strategy={verticalListSortingStrategy}
      >
        {sortedTodos.map((todo) => (
          <TodoItem key={todo._id} todo={todo} isDragging={false} />
        ))}
      </SortableContext>
    </div>
  );
};

export default Column;

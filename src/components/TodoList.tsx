import React from "react";
import { useTodo } from "../context/TodoContext";
import TodoItem from "./TodoItem";

interface Todo {
  _id: string;
  title: string;
}

const TodoList: React.FC = () => {
  const { todos } = useTodo();

  if (todos.length === 0) return <p>No tasks available</p>;

  return (
    <ul>
      {todos.map((todo: Todo) => (
        <TodoItem key={todo._id} todo={todo} isDragging={false} />
      ))}
    </ul>
  );
};

export default TodoList;

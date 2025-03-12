import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as Yup from "yup";

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

export type TaskStatus = "To Do" | "In Progress" | "Done" | "Delete";

export interface Todo {
  _id: string;
  title: string;
  position: number;
  status: TaskStatus;
  description?: string;
}

interface TodoContextType {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  loading: boolean;
  addTodo: (title: string, description: string) => Promise<Todo>;
  deleteTodo: (id: string) => Promise<void>;
  updateTodo: (id: string, updatedData: Partial<Todo>) => Promise<Todo>;
}

const TodoContext = createContext<TodoContextType | undefined>(undefined);

const todoSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .test(
      "no-whitespace",
      "Title cannot be empty",
      (value) => value.trim().length > 0
    ),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters")
    .test(
      "no-whitespace",
      "Description cannot be empty",
      (value) => value.trim().length > 0
    ),
});

export const TodoProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTodos = async () => {
    try {
      const { data } = await axios.get<Todo[]>(API_URL);
      setTodos(data.sort((a, b) => a.position - b.position));
    } catch (error) {
      console.error("Error fetching todos:", error);
    } finally {
      setLoading(false);
    }
  };

  const addTodo = async (title: string, description: string): Promise<Todo> => {
    try {
      await todoSchema.validate({ title, description });

      const { data } = await axios.post<Todo>(API_URL, {
        title: title.trim(),
        description: description.trim(),
        status: "To Do",
        position: todos.filter((t) => t.status === "To Do").length,
      });

      setTodos((prev) => [...prev, data]);
      return data;
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const errors: Record<string, string> = {};
        error.inner.forEach((err) => {
          if (err.path) errors[err.path] = err.message;
        });
        throw errors;
      }
      throw new Error("Error creating new task");
    }
  };

  const deleteTodo = async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos((prev) => prev.filter((todo) => todo._id !== id));
    } catch (error) {
      throw error;
    }
  };

  const updateTodo = async (
    id: string,
    updatedData: Partial<Todo>
  ): Promise<Todo> => {
    try {
      const { data } = await axios.put<Todo>(`${API_URL}/${id}`, updatedData);
      setTodos((prev) => prev.map((t) => (t._id === id ? data : t)));
      return data;
    } catch (error) {
      throw error;
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <TodoContext.Provider
      value={{
        todos,
        setTodos,
        loading,
        addTodo,
        deleteTodo,
        updateTodo,
      }}
    >
      {children}
    </TodoContext.Provider>
  );
};

export const useTodo = () => {
  const context = useContext(TodoContext);
  if (context === undefined) {
    throw new Error("useTodo must be used within a TodoProvider");
  }
  return context;
};

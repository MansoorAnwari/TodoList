import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTodo } from "../context/TodoContext";

// تعریف نوع هر تسک
interface Task {
  _id: string;
  title: string;
  description?: string;
}

// تعریف نوع ورودی‌های کامپوننت
interface TodoItemProps {
  todo: Task;
  isDragging: boolean;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo }) => {
  const { deleteTodo, updateTodo } = useTodo();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Task>(todo);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({ id: todo._id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? "none" : "transform 0.25s ease",
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1,
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await updateTodo(todo._id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      setIsDeleting(true);
      await deleteTodo(todo._id);
    } catch (error) {
      console.error("Deletion error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`todo-item ${isDragging ? "dragging" : ""}`}
      {...attributes}
      {...listeners}
    >
      <div
        className="mobile-handle"
        {...listeners}
        style={{ display: isEditing ? "none" : "flex" }}
      >
        <svg viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M9 14h2V7H9v7zm4 0h2V7h-2v7zM3 6v12h18V6H3z"
          />
        </svg>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="edit-form">
          <input
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Task title"
            required
          />
          <textarea
            value={formData.description || ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description"
            rows={4}
          />
          <div className="actions">
            <button
              type="submit"
              className={`btn save ${isSaving ? "loading" : ""}`}
              disabled={isSaving}
            >
              <span>Save</span>
              {isSaving && <div className="spinner" />}
            </button>
            <button
              type="button"
              className="btn cancel"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="content">
            <h3>{todo.title}</h3>
            {todo.description && <p>{todo.description}</p>}
          </div>
          <div className="actions">
            <button className="btn edit" onClick={() => setIsEditing(true)}>
              Edit
            </button>
            <button
              className={`btn delete ${isDeleting ? "loading" : ""}`}
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <span>Delete</span>
              {isDeleting && <div className="spinner" />}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default React.memo(TodoItem);

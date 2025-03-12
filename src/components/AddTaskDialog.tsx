import { useState } from "react";
import { useTodo } from "../context/TodoContext.tsx";
import * as Yup from "yup";
import React from "react";

interface AddTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TaskForm {
  title: string;
  description: string;
}

const taskSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title cannot exceed 50 characters")
    .test(
      "no-whitespace",
      "Title cannot be empty",
      (value) => value?.trim().length > 0
    ),
  description: Yup.string()
    .trim()
    .required("Description is required")
    .min(5, "Description must be at least 5 characters")
    .max(200, "Description cannot exceed 200 characters")
    .test(
      "no-whitespace",
      "Description cannot be empty",
      (value) => value?.trim().length > 0
    ),
});

const AddTaskDialog: React.FC<AddTaskDialogProps> = ({ isOpen, onClose }) => {
  const { addTodo } = useTodo();
  const [task, setTask] = useState<TaskForm>({ title: "", description: "" });
  const [errors, setErrors] = useState<Partial<TaskForm>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTask({ ...task, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await taskSchema.validate(task, { abortEarly: false });
      await addTodo(task.title.trim(), task.description.trim());
      setTask({ title: "", description: "" });
      onClose();
      setErrors({});
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        const validationErrors: Partial<TaskForm> = {};
        error.inner.forEach((err) => {
          if (err.path) validationErrors[err.path as keyof TaskForm] = err.message;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ title: "Error creating task" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay">
      <div className="dialog">
        <h2>Create New Task</h2>

        {errors.title && (
          <div className="error" style={{ color: "var(--danger)", marginBottom: "1rem" }}>
            {errors.title}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              name="title"
              value={task.title}
              onChange={handleChange}
              className={errors.title ? "invalid" : ""}
              placeholder="Task Title"
              disabled={isSubmitting}
              style={{ width: "100%" }}
            />
            {errors.title && (
              <div className="error" style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                {errors.title}
              </div>
            )}
          </div>

          <div className="form-group">
            <textarea
              name="description"
              value={task.description}
              onChange={handleChange}
              className={errors.description ? "invalid" : ""}
              placeholder="Task Description"
              rows={4}
              disabled={isSubmitting}
              style={{ width: "100%" }}
            />
            {errors.description && (
              <div className="error" style={{ color: "var(--danger)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
                {errors.description}
              </div>
            )}
          </div>

          <div className="dialog-actions">
            <button
              type="submit"
              className={`btn save ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
              style={{ minWidth: "120px" }}
            >
              <span>{isSubmitting ? "Creating..." : "Create Task"}</span>
              {isSubmitting && <div className="spinner" />}
            </button>

            <button type="button" className="btn cancel" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskDialog;

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTodo } from "../context/TodoContext";
import { useState } from "react";
import * as Yup from "yup";

const validationSchema = Yup.object({
    title: Yup.string()
        .required("عنوان الزامی است")
        .min(3, "حداقل ۳ کاراکتر"),
    description: Yup.string()
        .required("توضیحات الزامی است")
        .min(5, "حداقل ۵ کاراکتر")
});

const TodoItem = ({ todo }) => {
    const { handleDeleteTodo, handleUpdateTodo } = useTodo();
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(todo.title);
    const [newDescription, setNewDescription] = useState(todo.description);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const todoId = String(todo._id);

    const shouldHandleDrag = (event) => {
        return !event.target.closest('button');
    };

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: todoId,
        data: {
            type: "item",
            todo: {
                ...todo,
                _id: todoId
            }
        },
        activators: {
            onKeyDown: () => {},
            onMouseDown: (event) => {
                if (shouldHandleDrag(event)) listeners.onMouseDown(event);
            },
            onTouchStart: (event) => {
                if (shouldHandleDrag(event)) listeners.onTouchStart(event);
            }
        }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || "all 0.15s ease",
        zIndex: isDragging ? 1000 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await validationSchema.validate(
                { title: newTitle, description: newDescription },
                { abortEarly: false }
            );

            setIsLoading(true);
            await handleUpdateTodo(todoId, {
                title: newTitle,
                description: newDescription,
                status: todo.status
            });
            setIsEditing(false);
            setErrors({});
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach((err) => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error("Update error:", error);
                alert("خطا در بروزرسانی!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        e.preventDefault();

        try {
            setIsLoading(true);
            await handleDeleteTodo(todoId);
        } catch (error) {
            console.error("Delete error:", error);
            alert("خطای سرور: " + (error.response?.data?.message || "خطا در حذف!"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={`todo-item ${isDragging ? "dragging" : ""}`}
        >
            {isEditing ? (
                <div className="edit-form">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className={`form-input ${errors.title ? "invalid" : ""}`}
                        placeholder="عنوان"
                    />
                    {errors.title && <span className="error">{errors.title}</span>}

                    <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className={`form-textarea ${errors.description ? "invalid" : ""}`}
                        placeholder="توضیحات"
                        rows="3"
                    />
                    {errors.description && <span className="error">{errors.description}</span>}

                    <div className="form-actions">
                        <button
                            className="btn save"
                            onClick={handleSave}
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="spinner" /> : "ذخیره"}
                        </button>
                        <button
                            className="btn cancel"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsEditing(false);
                            }}
                        >
                            لغو
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="content">
                        <h3>{todo.title}</h3>
                        {todo.description && <p>{todo.description}</p>}
                    </div>
                    <div className="actions">
                        <button
                            className="btn edit"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsEditing(true);
                            }}
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="spinner" /> : "ویرایش"}
                        </button>
                        <button
                            className="btn delete"
                            onClick={handleDelete}
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="spinner" /> : "حذف"}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default TodoItem;
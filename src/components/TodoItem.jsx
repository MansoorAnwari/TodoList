import React, { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useTodo } from "../context/TodoContext";

const TodoItem = React.memo(({ todo, isDragging }) => {
    const { deleteTodo, updateTodo } = useTodo();
    const [isEditing, setIsEditing] = useState(false);
    const [newTitle, setNewTitle] = useState(todo.title);
    const [newDescription, setNewDescription] = useState(todo.description);
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({
        id: todo._id,
        data: { todo }
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition: transition || 'transform 0.1s ease', // کاهش زمان انیمیشن
        opacity: isDragging ? 0 : 1,
        zIndex: isDragging ? 9999 : 1,
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await updateTodo(todo._id, { title: newTitle, description: newDescription });
            setIsEditing(false);
        } catch (error) {
            setErrors(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`todo-item ${isDragging ? "dragging" : ""}`}
            {...attributes}
            {...(!isEditing ? listeners : {})}
        >
            <div className="mobile-handle" {...listeners}>
                <svg width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M9 14h2V7H9v7zm4 0h2V7h-2v7zM3 6v12h18V6H3z"/>
                </svg>
            </div>

            {isEditing ? (
                <form onSubmit={handleEditSubmit} className="edit-form">
                    <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        placeholder="عنوان تسک"
                        className="form-input"
                    />
                    <textarea
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        placeholder="توضیحات تسک"
                        className="form-textarea"
                    />
                    <div className="actions">
                        <button type="submit" className="btn save" disabled={isLoading}>
                            {isLoading ? <div className="spinner" /> : 'ذخیره'}
                        </button>
                        <button type="button" className="btn cancel" onClick={() => setIsEditing(false)}>
                            لغو
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
                        <button
                            className="btn edit"
                            onClick={() => setIsEditing(true)}
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="spinner" /> : 'ویرایش'}
                        </button>
                        <button
                            className="btn delete"
                            onClick={() => deleteTodo(todo._id)}
                            disabled={isLoading}
                        >
                            {isLoading ? <div className="spinner" /> : 'حذف'}
                        </button>
                    </div>
                </>
            )}
        </div>
    );
});

export default TodoItem;
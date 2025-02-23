import { useState } from "react";
import { useTodo } from "../context/TodoContext";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import Column from "../components/Column";
import AddTaskDialog from "../components/AddTaskDialog";
import TodoItem from "../components/TodoItem";

const Home = () => {
    const { todos, setTodos, handleAddTodo, handleUpdateTodo } = useTodo();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTodo, setActiveTodo] = useState(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 10,
                delay: 151,
                tolerance: 0
            },
            shouldHandleEvent: (event) => {
                return !event.target.closest('button');
            }
        }),
        useSensor(KeyboardSensor)
    );

    const handleDragEnd = async ({ active, over }) => {
        if (!over) return;

        const activeTodo = todos.find((t) => t._id === active.id);
        const overType = over.data?.current?.type;

        if (overType === "column") {
            try {
                await handleUpdateTodo(active.id, {
                    ...activeTodo,
                    status: over.id,
                });
            } catch (error) {
                console.error("Drag update failed:", error);
            }
        } else {
            const oldIndex = todos.findIndex((t) => t._id === active.id);
            const newIndex = todos.findIndex((t) => t._id === over.id);

            if (oldIndex !== newIndex) {
                const newTodos = arrayMove(todos, oldIndex, newIndex);
                setTodos(newTodos);
            }
        }
    };

    return (
        <div className="todo-container">
            <h1>مدیریت کارها</h1>

            <button
                className="btn add-btn"
                onClick={() => setIsDialogOpen(true)}
            >
                تسک جدید
            </button>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={({ active }) => {
                    setActiveTodo(active.data.current?.todo);
                }}
            >
                <div className="columns">
                    {["To Do", "In Progress", "Done"].map((status) => (
                        <Column
                            key={status}
                            status={status}
                            todos={todos.filter((t) => t.status === status)}
                        />
                    ))}
                </div>

                <DragOverlay adjustScale={false}>
                    {activeTodo && (
                        <TodoItem
                            todo={activeTodo}
                            style={{
                                transform: "scale(1.05)",
                                boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
                            }}
                        />
                    )}
                </DragOverlay>
            </DndContext>

            <AddTaskDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onAdd={handleAddTodo}
            />
        </div>
    );
};

export default Home;
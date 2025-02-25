import { useState, useCallback } from 'react';
import { DndContext, closestCorners, PointerSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useTodo } from '../context/TodoContext';
import Column from '../components/Column';
import TodoItem from '../components/TodoItem';
import AddTaskDialog from '../components/AddTaskDialog';

const Home = () => {
    const { todos, updateTodo, setTodos } = useTodo();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [activeTodo, setActiveTodo] = useState(null);

    // بهینه‌سازی تنظیمات سنسورها
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5, // کاهش فاصله فعال‌سازی درگ
            },
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 50, // کاهش تاخیر فعال‌سازی درگ
                tolerance: 10, // کاهش تلرانس
            },
        })
    );

    const handleDragStart = useCallback(({ active }) => {
        setActiveTodo(active.data.current?.todo);
    }, []);

    const handleDragEnd = useCallback(async ({ active, over }) => {
        try {
            if (!active || !over) return;

            // حالت 1: جابجایی درون یک ستون
            if (active.data.current?.todo?.status === over.data.current?.todo?.status) {
                const oldIndex = todos.findIndex(t => t._id === active.id);
                const newIndex = todos.findIndex(t => t._id === over.id);
                if (oldIndex === newIndex) return;

                const newTodos = arrayMove(todos, oldIndex, newIndex);
                setTodos(newTodos);
            }
            // حالت 2: انتقال بین ستون‌ها
            else {
                const activeTodo = active.data.current.todo;
                const newStatus = over.data.current?.type === "column"
                    ? over.id
                    : over.data.current?.todo.status;

                if (!newStatus) return;

                const newPosition = todos.filter(t => t.status === newStatus).length;

                const updatedTodo = {
                    ...activeTodo,
                    status: newStatus,
                    position: newPosition
                };

                await updateTodo(activeTodo._id, updatedTodo);
                setTodos(prev => prev.map(t =>
                    t._id === activeTodo._id ? updatedTodo : t
                ));
            }
        } catch (error) {
            console.error("خطا در جابجایی:", error);
            setTodos([...todos]);
        } finally {
            setActiveTodo(null);
        }
    }, [todos, updateTodo]);

    return (
        <div className="todo-container">
            <h1>مدیریت کارها</h1>

            <button className="btn add-btn" onClick={() => setIsDialogOpen(true)}>
                تسک جدید
            </button>

            <AddTaskDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
            />

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="columns">
                    {["To Do", "In Progress", "Done"].map(status => (
                        <Column
                            key={status}
                            id={status}
                            status={status}
                            todos={todos.filter(t => t.status === status)}
                        />
                    ))}
                </div>

                <DragOverlay adjustScale={false}>
                    {activeTodo && <TodoItem todo={activeTodo} isDragging />}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Home;
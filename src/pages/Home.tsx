import React, { useState, useCallback } from "react";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragOverlay,
  pointerWithin,
  useDndMonitor,
} from "@dnd-kit/core";
import { Todo, TaskStatus, useTodo } from "../context/TodoContext";
import Column from "../components/Column";
import TodoItem from "../components/TodoItem";
import AddTaskDialog from "../components/AddTaskDialog";

const Home: React.FC = () => {
  const { todos, setTodos, updateTodo } = useTodo();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2,
        tolerance: { x: 5, y: 5 },
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 5,
      },
    })
  );

  const handleDragEnd = useCallback(
    async ({ active, over }: { active: any; over: any }) => {
      if (!active || !over) return;

      const activeId = active.id;
      const overId = over.id;

      // If dropped on itself
      if (activeId === overId) return;

      // Get items
      const activeTodo = todos.find((t) => t._id === activeId);
      const overTodo = todos.find((t) => t._id === overId);

      // Determine target type
      const isSameColumn = activeTodo?.status === overTodo?.status;
      const isOverColumn = over.data.current?.type === "column";

      // Calculate new position
      let newStatus = activeTodo?.status ?? "";
      let newPosition = 0;

      if (isOverColumn) {
        // Dragging to new column
        newStatus = over.data.current.status;
        newPosition = todos.filter((t) => t.status === newStatus).length;
      } else {
        // Dragging over another item
        newStatus = overTodo?.status ?? "";
        const targetTodos = todos.filter((t) => t.status === newStatus);
        const overIndex = targetTodos.findIndex((t) => t._id === overId);
        newPosition = overIndex >= 0 ? overIndex : targetTodos.length;
      }

      // Create new array
      let newTodos = [...todos];

      // Remove old item
      newTodos = newTodos.filter((t) => t._id !== activeId);

      if (activeTodo) {
        newTodos.splice(newPosition, 0, {
          ...activeTodo,
          status: newStatus,
          position: newPosition,
        });
      }

      // Update all positions
      newTodos = newTodos.map((todo, index) => ({
        ...todo,
        position: index,
      }));

      setTodos(newTodos);

      try {
        await updateTodo(activeId, {
          status: newStatus,
          position: newPosition,
        });
      } catch (error) {
        console.error("Update error:", error);
        setTodos(todos);
      }
    },
    [todos, updateTodo]
  );

  const statuses: TaskStatus[] = ["To Do", "In Progress", "Done"];

  return (
    <div className="todo-container">
      <h1 className="main-title">Task Management</h1>

      <button className="btn add-btn" onClick={() => setIsDialogOpen(true)}>
        ＋ Add New Task
      </button>

      <AddTaskDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={({ active }) =>
          setActiveTodo(todos.find((t) => t._id === active.id) ?? null)
        }
        onDragEnd={handleDragEnd}
      >
        <div className="columns">
          {statuses.map((status) => (
            <Column
              key={status}
              id={status}
              status={status}
              todos={todos.filter((t) => t.status === status)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTodo && <TodoItem todo={activeTodo} isDragging={true} />}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Home;

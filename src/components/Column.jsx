import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";

const Column = ({ status, todos }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: status,
        data: { type: "column", status }
    });

    return (
        <div
            ref={setNodeRef}
            className={`column ${isOver ? "active-dropzone" : ""}`}
        >
            <h2>{status}</h2>
            <SortableContext
                items={todos.map(t => String(t._id))}
                strategy={verticalListSortingStrategy}
            >
                {todos.map(todo => (
                    <TodoItem key={String(todo._id)} todo={todo} />
                ))}
            </SortableContext>
        </div>
    );
};

export default Column;
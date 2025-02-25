import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";

const Column = ({ id, status, todos }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
        data: {
            type: "column",
            status,
        },
    });

    return (
        <div
            ref={setNodeRef}
            className={`column ${isOver ? "dropzone-active" : ""}`}
            data-status={status}
        >
            <h2>{status}</h2>
            <SortableContext items={todos.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                {todos.map((todo) => (
                    <TodoItem key={todo._id} todo={todo} />
                ))}
            </SortableContext>
        </div>
    );
};

export default Column;
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TodoItem from "./TodoItem";

const Column = ({ id, status, todos }) => {
    const { setNodeRef } = useDroppable({ id, data: { type: "column", status } });

    // مرتب‌سازی بر اساس موقعیت
    const sortedTodos = [...todos].sort((a, b) => a.position - b.position);

    return (
        <div ref={setNodeRef} className="column">
            <h2>{status}</h2>
            <SortableContext
                items={sortedTodos.map(t => t._id)}
                strategy={verticalListSortingStrategy}
            >
                {sortedTodos.map(todo => (
                    <TodoItem key={todo._id} todo={todo} />
                ))}
            </SortableContext>
        </div>
    );
};

export default Column;
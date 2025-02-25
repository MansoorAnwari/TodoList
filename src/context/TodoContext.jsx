import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as Yup from "yup";

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

const TodoContext = createContext();

const todoSchema = Yup.object().shape({
    title: Yup.string()
        .trim()
        .required("Title is required")
        .min(3, "Title must be at least 3 characters")
        .test('no-whitespace', 'Title cannot be empty', value => value.trim().length > 0),
    description: Yup.string()
        .trim()
        .required("Description is required")
        .min(5, "Description must be at least 5 characters")
        .test('no-whitespace', 'Description cannot be empty', value => value.trim().length > 0)
});

export const TodoProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodos = async () => {
        try {
            const { data } = await axios.get(API_URL);
            setTodos(data.sort((a, b) => a.position - b.position));
        } catch (error) {
            console.error("Error fetching todos:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (title, description) => {
        try {
            await todoSchema.validate({ title, description });

            const { data } = await axios.post(API_URL, {
                title: title.trim(),
                description: description.trim(),
                status: "To Do",
                position: todos.filter(t => t.status === "To Do").length
            });

            setTodos(prev => [...prev, data]);
            return data;
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const errors = {};
                error.inner.forEach(err => {
                    errors[err.path] = err.message;
                });
                throw errors;
            }
            throw new Error("Error creating new task");
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTodos(prev => prev.filter(todo => todo._id !== id));
        } catch (error) {
            throw error;
        }
    };

    const updateTodo = async (id, updatedData) => {
        try {
            const { data } = await axios.put(`${API_URL}/${id}`, updatedData);
            setTodos(prev =>
                prev.map(t => t._id === id ? data : t)
            );
            return data;
        } catch (error) {
            throw error;
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <TodoContext.Provider value={{
            todos,
            setTodos,
            loading,
            addTodo,
            deleteTodo,
            updateTodo
        }}>
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => useContext(TodoContext);
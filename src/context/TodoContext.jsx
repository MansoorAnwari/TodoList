import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);

    const fetchTodos = async () => {
        try {
            const { data } = await axios.get(API_URL);
            setTodos(data.map(todo => ({
                ...todo,
                _id: String(todo._id)
            })));
        } catch (error) {
            console.error("Fetch error:", error);
            alert("خطا در دریافت داده‌ها!");
        }
    };

    const createTodo = async (todo) => {
        try {
            const { data } = await axios.post(API_URL, todo);
            setTodos(prev => [...prev, { ...data, _id: String(data._id) }]);
            return data;
        } catch (error) {
            throw error.response?.data || error;
        }
    };

    const updateTodo = async (id, updated) => {
        try {
            const { data } = await axios.put(`${API_URL}/${id}`, updated);
            setTodos(prev =>
                prev.map(t => (t._id === id ? { ...t, ...updated } : t)
                ));
            return data;
        } catch (error) {
            console.error("Update error:", error);
            throw error;
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTodos(prev => prev.filter(t => t._id !== String(id)));
        } catch (error) {
            console.error("Delete error:", error);
            throw new Error(error.response?.data?.message || "خطا در حذف");
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <TodoContext.Provider
            value={{
                todos,
                setTodos,
                fetchTodos,
                handleAddTodo: createTodo,
                handleUpdateTodo: updateTodo,
                handleDeleteTodo: deleteTodo,
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => useContext(TodoContext);
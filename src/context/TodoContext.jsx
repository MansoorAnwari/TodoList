import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import * as Yup from 'yup';

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

const TodoContext = createContext();

// اعتبارسنجی داده‌ها با Yup
const todoSchema = Yup.object({
    title: Yup.string()
        .required("عنوان الزامی است")
        .min(3, "عنوان باید حداقل ۳ کاراکتر باشد")
        .test('not-blank', 'عنوان نمی‌تواند فقط فاصله باشد', value => value?.trim().length > 0),
    description: Yup.string()
        .required("توضیحات الزامی است")
        .min(5, "توضیحات باید حداقل ۵ کاراکتر باشد")
        .test('not-blank', 'توضیحات نمی‌تواند فقط فاصله باشد', value => value?.trim().length > 0)
});

export const TodoProvider = ({ children }) => {
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTodos = async (retry = 3) => {
        try {
            const { data } = await axios.get(API_URL);
            setTodos(data.sort((a, b) => a.position - b.position));
        } catch (error) {
            if (retry > 0) {
                await new Promise(resolve => setTimeout(resolve, 2000));
                return fetchTodos(retry - 1);
            }
            console.error("خطا در دریافت داده:", error);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (title, description) => {
        try {
            await todoSchema.validate({ title, description }, { abortEarly: false });

            const { data } = await axios.post(API_URL, {
                title: title.trim(),
                description: description.trim(),
                status: "To Do",
                position: Date.now()
            });
            setTodos(prev => [...prev, data]);
            return data;
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach(err => {
                    validationErrors[err.path] = err.message;
                });
                throw validationErrors;
            } else {
                console.error("خطا در ایجاد تسک:", error);
                throw new Error(error.response?.data?.error || "خطا در ایجاد تسک");
            }
        }
    };

    const deleteTodo = async (id) => {
        try {
            await axios.delete(`${API_URL}/${id}`);
            setTodos(prev => prev.filter(todo => todo._id !== id));
        } catch (error) {
            console.error("خطا در حذف تسک:", error);
            throw error;
        }
    };

    const updateTodo = async (id, updatedData) => {
        try {
            const { data } = await axios.put(`${API_URL}/${id}`, updatedData);
            setTodos(prev =>
                prev.map(todo =>
                    todo._id === id ? { ...todo, ...data } : todo
                ).sort((a, b) => a.position - b.position)
            );
            return data;
        } catch (error) {
            console.error("خطا در آپدیت:", error);
            throw error;
        }
    };

    useEffect(() => {
        fetchTodos();
    }, []);

    return (
        <TodoContext.Provider
            value={{
                todos,
                loading,
                addTodo,
                deleteTodo,
                updateTodo,
                setTodos
            }}
        >
            {children}
        </TodoContext.Provider>
    );
};

export const useTodo = () => useContext(TodoContext);
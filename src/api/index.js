
import axios from "axios";

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

export const getTodos = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

export const addTodo = async (newTask) => {
    const response = await axios.post(API_URL, newTask);
    return response.data;
};

export const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

// اصلاح شده برای پشتیبانی از تمام فیلدها
export const updateTodo = async (id, updatedData) => {
    const response = await axios.put(`${API_URL}/${id}`, updatedData);
    return response.data;
};
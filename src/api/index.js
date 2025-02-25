import axios from "axios";

const API_URL = "https://todo-api-livid.vercel.app/api/todos";

export const getTodos = async () => {
    const { data } = await axios.get(API_URL);
    return data;
};

export const addTodo = async (todo) => {
    const { data } = await axios.post(API_URL, todo);
    return data;
};

export const deleteTodo = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
};

export const updateTodo = async (id, updatedTodo) => {
    const { data } = await axios.put(`${API_URL}/${id}`, updatedTodo);
    return data;
};

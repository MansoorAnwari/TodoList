import axios from "axios";

const API_URL = "https://todo-api-livid.vercel.app/api/tasks";

interface Task {
  _id: string;
  title: string;
  description: string;
  status: "To Do" | "In Progress" | "Done" | "Delete";
}

// دریافت تمام tasks
export const getTasks = async (): Promise<Task[]> => {
  const { data } = await axios.get<Task[]>(API_URL);
  return data;
};

// افزودن یک task جدید
export const addTask = async (task: Omit<Task, "_id">): Promise<Task> => {
  const { data } = await axios.post<Task>(API_URL, task);
  return data;
};

// حذف task با استفاده از شناسه آن
export const deleteTask = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};

// به‌روزرسانی وضعیت یک task
export const updateTaskStatus = async (
  id: string,
  updatedTask: Partial<Omit<Task, "_id">>
): Promise<Task> => {
  const { data } = await axios.put<Task>(`${API_URL}/${id}`, updatedTask);
  return data;
};

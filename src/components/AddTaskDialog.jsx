import { useState, useEffect } from "react";
import * as Yup from "yup";

const validationSchema = Yup.object({
    title: Yup.string()
        .required("عنوان الزامی است")
        .min(3, "حداقل ۳ کاراکتر"),
    description: Yup.string()
        .required("توضیحات الزامی است")
        .min(5, "حداقل ۵ کاراکتر")
});

const AddTaskDialog = ({ isOpen, onClose, onAdd }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTitle("");
            setDescription("");
            setErrors({});
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await validationSchema.validate({ title, description }, { abortEarly: false });
            setIsLoading(true);
            await onAdd({ title, description, status: "To Do" });
            onClose();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const newErrors = {};
                error.inner.forEach(err => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
            } else {
                console.error("Add error:", error);
                alert("خطا در افزودن تسک!");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h2>افزودن تسک جدید</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>عنوان تسک</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`form-input ${errors.title ? "invalid" : ""}`}
                            placeholder="مثال: توسعه رابط کاربری"
                        />
                        {errors.title && <span className="error">{errors.title}</span>}
                    </div>

                    <div className="form-group">
                        <label>توضیحات</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`form-textarea ${errors.description ? "invalid" : ""}`}
                            placeholder="مثال: طراحی کامپوننت‌های اصلی با ری اکت"
                            rows="4"
                        />
                        {errors.description && <span className="error">{errors.description}</span>}
                    </div>

                    <div className="dialog-actions">
                        <button
                            type="button"
                            className="btn cancel"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            لغو
                        </button>
                        <button
                            type="submit"
                            className="btn save"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="spinner-container">
                                    <div className="spinner"></div>
                                </div>
                            ) : 'ذخیره'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskDialog;
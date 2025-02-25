import { useState } from 'react';
import { useTodo } from '../context/TodoContext';
import * as Yup from 'yup';

const validationSchema = Yup.object({
    title: Yup.string()
        .required('عنوان الزامی است')
        .min(3, 'حداقل ۳ کاراکتر')
        .test('not-blank', 'عنوان نمی‌تواند فقط فاصله باشد', value => value?.trim().length > 0),
    description: Yup.string()
        .required('توضیحات الزامی است')
        .min(5, 'حداقل ۵ کاراکتر')
        .test('not-blank', 'توضیحات نمی‌تواند فقط فاصله باشد', value => value?.trim().length > 0)
});

const AddTaskDialog = ({ isOpen, onClose }) => {
    const { addTodo } = useTodo();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await validationSchema.validate({ title, description }, { abortEarly: false });
            await addTodo(title, description);
            setTitle('');
            setDescription('');
            onClose();
        } catch (error) {
            if (error instanceof Yup.ValidationError) {
                const validationErrors = {};
                error.inner.forEach(err => {
                    validationErrors[err.path] = err.message;
                });
                setErrors(validationErrors);
            } else {
                alert(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="dialog-overlay">
            <div className="dialog">
                <h2>تسک جدید</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>عنوان:</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={errors.title ? 'invalid' : ''}
                        />
                        {errors.title && <div className="error">{errors.title}</div>}
                    </div>
                    <div className="form-group">
                        <label>توضیحات:</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={errors.description ? 'invalid' : ''}
                        />
                        {errors.description && <div className="error">{errors.description}</div>}
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
                            {isLoading ? <div className="spinner" /> : 'ایجاد تسک'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTaskDialog;
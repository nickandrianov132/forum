import { useMutation, useQuery } from "@apollo/client/react";
import { CREATE_CATEGORY } from "../../graphql/mutations/createCategory";
import { useEffect, useState, type SubmitEvent } from "react";
import { categorySchema, type CategoryFormData } from "../../utils/categorySchema";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router";
import SuccessPopup from "../../components/popups/SuccessPopup";
import { GET_CATEGORIES } from "../../graphql/querry/getCategories";
import { DELETE_CATEGORY } from "../../graphql/mutations/deleteCategory";
import ConfirmPopup from "../../components/popups/ConfirmPopup";



const CreateCategory = () => {
    const { user } = useAppSelector((store) => store.user)
    const [createCategory, {error, loading, data}] = useMutation(CREATE_CATEGORY);
    const { data: categories, loading: categoriesLoading, error: categoriesError } = useQuery(GET_CATEGORIES);
    const [deleteCategory] = useMutation(DELETE_CATEGORY);
    const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
    const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
            navigate("*");
        }
    },[])
    

    const handlerSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSuccess(false);
        setErrors({});
        const form = e.currentTarget; 
        const formData = new FormData(e.currentTarget);
        console.log(formData.get('name'));

        const rawData = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description'),
            isAdminOnly: formData.get('isAdminOnly') === 'on',
        }

        console.log(rawData);
        const result = categorySchema.safeParse(rawData);

        if (!result.success) {
            const fieldErrors: Partial<Record<keyof CategoryFormData, string>> = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as keyof CategoryFormData;
                fieldErrors[fieldName] = issue.message;
            });
            setErrors(fieldErrors);
            return
        }

        const validatedData: CategoryFormData = result.data;
        console.log("Valid data is ready to send:", validatedData);
        try {
            await createCategory({
                variables: {
                    ...validatedData
                },
                optimisticResponse: {
                    __typename: 'Mutation',
                    createCategory: {
                        __typename: 'Category',
                        id: `temp-id-${Date.now()}`,
                        name: validatedData.name,
                        slug: validatedData.slug,
                        description: validatedData.description,
                        isAdminOnly: validatedData.isAdminOnly,
                    },
                },
                // обновление кэша для реактивной отрисовки компонента с категориями LeftNavbar т.к. он подписан на обновления запроса GET_CATEGORIES в кэше
                update(cache, { data }) {
                    if (!data || !data.createCategory) return;

                    cache.modify({
                        fields: {
                            categories(existingCategoriesRefs = [], { toReference }) {
                                // с помощью toReference преобразуем сырой обьект в нормализованый (Reference):
                                const newCategoryRef = toReference(data.createCategory);
                                return [...existingCategoriesRefs, newCategoryRef];
                            },
                        },
                    });
                },
            });

            setIsSuccess(true);
            form.reset();
        } catch (error: any) {
            console.log(`Server Error: ${error.message}`);
        }
    }
    
    const handleDeleteClick = (catId: string) => {
        setCategoryToDelete(catId);
    }

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        try {
            await deleteCategory({
                variables: {
                    id: categoryToDelete
                },
                refetchQueries: [
                    {
                        query: GET_CATEGORIES,
                    }
                ]
            })  
    
        } catch (error: any) {
            console.error("Category delete Error:", error.message)
        } finally {
            setCategoryToDelete(null);
        }

    }


    if (categoriesError) return <p>Error: {categoriesError?.message}</p>
    if (categoriesLoading) return <p>Loading...</p>

    return (

        <div className="flex relative flex-col h-full w-full">
            {isSuccess &&
                <SuccessPopup message="New Category successfuly created!" buttonName="OK" setIsSuccess={setIsSuccess} />
            }
            <form className="login-form" onSubmit={handlerSubmit}>
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="name" className="form-label">Category Name:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="name"
                                type="text"
                                name="name"
                                autoComplete="off"
                                required
                            />
                        </div>
                        {errors.name && <p className="text-red-400 text-xs mt-1 ml-24">{errors.name}</p>}
                    </div>
                </div>   
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="slug" className="form-label">Category Slug:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="slug"
                                type="text"
                                name="slug"
                                autoComplete="off"
                                required
                            />
                        </div>
                        {errors.slug && <p className="text-red-400 text-xs mt-1 ml-24">{errors.slug}</p>}
                    </div>
                </div>   
                <div className="flex mb-5 items-center">
                    <div className="flex items-center">
                        <label htmlFor="description" className="form-label">Category Description:</label>
                        <div className="form-input-container">
                            <input
                                className="form-input-clean"
                                id="description"
                                type="text"
                                name="description"
                                autoComplete="off"
                            />
                        </div>
                        {/* {errors.login && <p className="text-red-400 text-xs mt-1 ml-24">{errors.login}</p>} */}
                    </div>
                </div>   
                <label className="flex items-center gap-3 cursor-pointer select-none group my-2">
                <div className="relative flex items-center justify-center">
                    <input
                    type="checkbox"
                    name="isAdminOnly"
                    className="peer appearance-none w-5 h-5 rounded border border-slate-600 bg-[#0b1120] checked:bg-cyan-500 checked:border-cyan-400 hover:border-cyan-400/70 transition-colors cursor-pointer"
                    />
                    <svg
                    className="w-3.5 h-3.5 text-slate-950 absolute pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    >
                    <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <span className="text-sm font-medium text-slate-300 group-hover:text-cyan-300 transition-colors">
                    Admin / Staff only{' '}
                    <span className="text-slate-500 font-normal">(restrict post creation)</span>
                </span>
                </label>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="admin-panel-btn"
                >{loading ? "Creating..." : "Create"}</button>
            </form>
            <h2 className="text-slate-200 mb-4">Categories:</h2>
            <div className="flex flex-wrap gap-2">
                {categories?.categories.map((cat) => (
                    <span 
                        key={cat.id}
                        className="relative cursor-pointer group inline-flex w-fit rounded-md px-5 py-3 border border-cyan-300/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 text-slate-200 hover:shadow-xl hover:shadow-sky-500/10 hover:border-cyan-400/50"
                    >{cat.name}
                        <svg 
                            xmlns="http://w3.org" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            strokeWidth="2" 
                            stroke="currentColor" 
                            className="absolute top-0 right-0 w-5 h-5 text-slate-300 hover:text-rose-500 transition-colors duration-200 cursor-pointer"
                            onClick={() => handleDeleteClick(cat.id)}
                            >
                            <circle cx="12" cy="12" r="9" />

                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L15 9M9 9l6 6" />
                            </svg>
                    </span>
                ))}
            </div>
            {categoryToDelete && (
                <ConfirmPopup 
                    message="All Posts, comments in this category will be deleted. Are you sure?"
                    onConfirm={handleDelete}
                    onCancel={() => setCategoryToDelete(null)}
                />
            )}
            {/* {banUserError &&
                <span
                    className="mt-1 ml-4 text-xs font-medium text-rose-500"
                >{banUserError.message}</span>
            } */}
        </div>
    );
}

export default CreateCategory;

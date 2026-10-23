import { useMutation } from "@apollo/client/react";
import { CREATE_CATEGORY } from "../../graphql/mutations/createCategory";
import { useEffect, useState, type SubmitEvent } from "react";
import { categorySchema, type CategoryFormData } from "../../utils/categorySchema";
import { useAppSelector } from "../../store/hooks";
import { useNavigate } from "react-router";



const CreateCategory = () => {
    const { user } = useAppSelector((store) => store.user)
    const [createCategory, {error, loading, data}] = useMutation(CREATE_CATEGORY);
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

        const formData = new FormData(e.currentTarget);
        console.log(formData.get('name'));

        const rawData = {
            name: formData.get('name'),
            slug: formData.get('slug'),
            description: formData.get('description')
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
                        description: validatedData.description
                    },
                },
                update(cache, { data }) {
                    if (!data || !data.createCategory) return;

                    cache.modify({
                        fields: {
                            categories(existingCategoriesRefs = [], { toReference }) {
                                const newCategoryRef = toReference(data.createCategory);
                                return [...existingCategoriesRefs, newCategoryRef];
                            },
                        },
                    });
                },
            });

            setIsSuccess(true);
        } catch (error: any) {
            console.log(`Server Error: ${error.message}`);
        }
    }

    return (

        <div className="flex flex-col h-full w-full">
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
                <button 
                    type="submit" 
                    disabled={loading}
                    className="inline-flex h-fit max-w-50 items-center justify-center rounded-md border border-cyan-500/30 bg-slate-950/40 bg-linear-to-b from-slate-900/50 to-slate-950/80 px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-cyan-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] backdrop-blur-md transition-all duration-300 ease-in-out hover:border-cyan-400 hover:text-white hover:shadow-[0_0_15px_rgba(6,182,212,0.4),inset_0_1px_2px_rgba(255,255,255,0.2)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500"
                >{loading ? "Creating..." : "Create"}</button>
            </form>
            {/* {banUserError &&
                <span
                    className="mt-1 ml-4 text-xs font-medium text-rose-500"
                >{banUserError.message}</span>
            } */}
        </div>
    );
}

export default CreateCategory;

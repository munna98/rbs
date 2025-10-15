import { useState, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Upload } from "lucide-react";
import type { MenuItem, Category } from "../../../types";

// ✅ Zod schema with coercion
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
});

// ✅ Separate input and output types to avoid resolver mismatch
type FormInput = z.input<typeof schema>; // what RHF receives
type FormOutput = z.output<typeof schema>; // what Zod returns (after coercion)

interface MenuItemModalProps {
  isOpen: boolean;
  item?: MenuItem;
  categories: Category[];
  onClose: () => void;
  onSubmit: (data: MenuItem | Omit<MenuItem, "id" | "available">) => void;
  isLoading?: boolean;
}

const MenuItemModal = ({
  isOpen,
  item,
  categories,
  onClose,
  onSubmit,
  isLoading = false,
}: MenuItemModalProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(
    item?.image ? `file://${item.image}` : null
  );
  const [imageBase64, setImageBase64] = useState<string | null>(null);

  // ✅ useForm typed with both input & output types
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: item?.name ?? "",
      categoryId: item?.categoryId ?? "",
      price: item?.price ?? 0,
    },
  });

  useEffect(() => {
    if (item) {
      setValue("name", item.name);
      setValue("categoryId", item.categoryId);
      setValue("price", item.price);
    }
  }, [item, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setImageBase64(base64);
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ Type-safe submission using coerced output (price:number)
  const handleFormSubmit: SubmitHandler<FormOutput> = (data) => {
    const submitData: MenuItem = {
      id: item?.id ?? crypto.randomUUID(),
      name: data.name,
      categoryId: data.categoryId,
      price: data.price,
      image: imageBase64 ?? item?.image,
      available: item?.available ?? true,
    };

    onSubmit(submitData);
    reset();
    setImagePreview(null);
    setImageBase64(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">
            {item ? "Edit Menu Item" : "Add Menu Item"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Image</label>
            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded"
                />
              ) : (
                <div className="text-gray-400">
                  <Upload className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">Click to upload image</p>
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              {...register("name")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Item name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              {...register("categoryId")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              {...register("price")}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isLoading ? "Saving..." : item ? "Update Item" : "Add Item"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MenuItemModal;

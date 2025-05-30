"use server";
import db from "@/utils//db";
import { redirect } from "next/navigation";
import { getAdminUser, getAuthUser } from "./get-user";
import { renderError } from "./render-error";
import { imageSchema, productSchema, reviewSchema } from "./schemas";
import { validateZodSchema } from "./validate-zod-schema";
import { deleteImage, uploadImage } from "./supabase";
import { revalidatePath } from "next/cache";

//* Fetches featured products from the database.
export const fetchFeaturedProducts = async () => {
  const products = await db.product.findMany({
    where: {
      featured: true,
    },
  });

  return products;
};

//* Fetches all products from the database with optional search functionality.
export const fetchAllProducts = async ({ search = "" }: { search: string }) => {
  return db.product.findMany({
    where: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { company: { contains: search, mode: "insensitive" } },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

//* Fetches a single product by its ID from the database.
export const fetchSingleProduct = async (productId: string) => {
  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) redirect("/products");

  return product;
};

//* Creates a new product in the database(from the admin panel).
export const createProductAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const file = formData.get("image") as File;
    //* Easier approach to validate the form data using Zod schema.
    // const validatedFields = productSchema.parse(rawData);
    //* If we need custom error messages, we use `safeParse` instead of `parse`.
    //* Here, we are using custom helper function `validateZodSchema` to validate the data.

    const validatedFields = validateZodSchema(productSchema, rawData);

    //* Don't pass the file directly, pass it as an object with the key `image`.
    //* If we pass it directly we will get an error: `image is not an instance of File`.
    const validatedFile = validateZodSchema(imageSchema, { image: file });
    const fullPath = await uploadImage(validatedFile.image);

    await db.product.create({
      data: {
        ...validatedFields,
        image: fullPath,
        clerkId: user.id,
      },
    });
  } catch (error) {
    return renderError(error);
  }
  redirect("/admin/products");
};

//* Fetches all products(from the admin panel).
export const fetchAdminProducts = async () => {
  await getAdminUser();

  const products = await db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return products;
};

//* Deletes a product from the database (admin panel only).
//* The `productId` comes from `prevState`, which is passed in from the form submission.
//* `prevState` represents the latest form state and is manually passed using `.bind()` when setting up the action.
//* After deleting, we call `revalidatePath()` to refresh the admin products page cache and update the UI.
//* We also delete the image from the Supabase storage.
export const deleteProductAction = async (prevState: { productId: string }) => {
  const { productId } = prevState;

  await getAdminUser();

  try {
    const product = await db.product.delete({
      where: {
        id: productId,
      },
    });

    await deleteImage(product.image);

    revalidatePath("/admin/products");

    return { message: "Product deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//* Fetches product details for the admin panel.
export const fetchAdminProductDetails = async (productId: string) => {
  await getAdminUser();

  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) redirect("/admin/products");

  return product;
};

//* Updates a product in the database (admin panel only).
//* After updating, we revalidate the path to refresh the product edit page cache and update the UI.
export const updateProductAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser();

  try {
    const productId = formData.get("id") as string;
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateZodSchema(productSchema, rawData);

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        ...validatedFields,
      },
    });

    revalidatePath(`/admin/products/${productId}/edit`);

    return { message: "Product updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//* Updates a product image in the database (admin panel only).
//* After updating, we delete the old image from Supabase storage and revalidate the path to refresh the product edit page cache.
export const updateProductImageAction = async (
  prevState: any,
  formData: FormData
) => {
  await getAdminUser();

  try {
    const image = formData.get("image") as File;
    const productId = formData.get("id") as string;
    const oldImageUrl = formData.get("url") as string;
    const validatedFile = validateZodSchema(imageSchema, { image });
    const fullPath = await uploadImage(validatedFile.image);

    await deleteImage(oldImageUrl);

    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        image: fullPath,
      },
    });

    revalidatePath(`/admin/products/${productId}/edit`);

    return { message: "Product image updated successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//* Fetches the favorite ID for a product by its ID for the authenticated user.
export const fetchFavoriteId = async ({ productId }: { productId: string }) => {
  const user = await getAuthUser();

  const favorite = await db.favorite.findFirst({
    where: {
      productId: productId,
      clerkId: user.id,
    },
    select: {
      id: true,
    },
  });

  return favorite?.id || null;
};

//* Toggles the favorite status of a product for the authenticated user.
//* If the product is already favorited, it removes it; otherwise, it adds it.
export const toggleFavoriteAction = async (prevState: {
  productId: string;
  favoriteId: string | null;
  pathName: string;
}) => {
  const user = await getAuthUser();
  const { productId, favoriteId, pathName } = prevState;

  const product = await db.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      name: true,
    },
  });

  try {
    if (favoriteId) {
      await db.favorite.delete({
        where: {
          id: favoriteId,
        },
      });
    } else {
      await db.favorite.create({
        data: {
          productId,
          clerkId: user.id,
        },
      });
    }

    revalidatePath(pathName);

    return {
      message: favoriteId
        ? `${product?.name} is removed from favorites`
        : `${product?.name} is added to favorites`,
    };
  } catch (error) {
    return renderError(error);
  }
};

//* Fetches all favorite products for the authenticated user.
export const fetchUserFavorites = async () => {
  const user = await getAuthUser();

  const favorites = await db.favorite.findMany({
    where: {
      clerkId: user.id,
    },
    include: {
      product: true, // Include product details in the response
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return favorites;
};

//* Creates a new review for a product by the authenticated user.
export const createReviewAction = async (
  prevState: any,
  formData: FormData
) => {
  const user = await getAuthUser();

  try {
    const rawData = Object.fromEntries(formData);
    const validatedFields = validateZodSchema(reviewSchema, rawData);

    await db.review.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
      },
    });

    revalidatePath(`/products/${validatedFields.productId}`);

    return { message: "Review submitted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//* Fetches all reviews for a specific product by its ID.
export const fetchProductReviews = async (productId: string) => {
  const reviews = await db.review.findMany({
    where: {
      productId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return reviews;
};

//* Fetches the average rating for a product by its ID.
export const fetchProductRating = async (productId: string) => {
  const result = await db.review.groupBy({
    by: ["productId"],
    _avg: {
      rating: true,
    },
    _count: {
      rating: true,
    },
    where: {
      productId,
    },
  });
  return {
    rating: result[0]?._avg.rating?.toFixed(1) ?? 0,
    count: result[0]?._count.rating ?? 0,
  };
};

//* Fetches all reviews made by the authenticated user.
export const fetchProductReviewsByUser = async () => {
  const user = await getAuthUser();

  const reviews = await db.review.findMany({
    where: {
      clerkId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      rating: true,
      comment: true,
      product: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });

  return reviews;
};

//* Deletes a review by its ID.
export const deleteReviewAction = async (prevState: { reviewId: string }) => {
  const { reviewId } = prevState;
  const user = await getAuthUser();

  try {
    await db.review.delete({
      where: {
        id: reviewId,
        clerkId: user.id, // Ensure the user is authorized to delete this review
      },
    });

    revalidatePath("/reviews");

    return { message: "Review deleted successfully" };
  } catch (error) {
    return renderError(error);
  }
};

//* Finds an existing review for a product by the authenticated user
//* (to restrict access to creating multiple reviews for the same product or prevent reviews from unsigned users).
export const findExistingReview = async (userId: string, productId: string) => {
  return db.review.findFirst({
    where: {
      clerkId: userId,
      productId: productId,
    },
  });
};

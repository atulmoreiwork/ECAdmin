import { IDocument } from "./document.model";

export interface IProduct
{
    productId: number;
    productName: string;
    urlSlug:string;
    categoryId: number;
    description: string;
    price:number;
    stockQuantity:number;
    status:string;
    productVariants: IProductVariant[];
    row: string;
    totalRowCount: string;
    flag: number;
}

export interface IProductVariant
{
    productVariantId: number;
    productId: number;
    color: string;
    size: string;
    price: number;
    stockQuantity: number;
    documents: IDocument[];
    uploadedImages: IVariantUploadImage[];
    deletedDocumentIds?: number[];
}
export interface IVariantUploadImage {
  file: File;
  preview: string;
}

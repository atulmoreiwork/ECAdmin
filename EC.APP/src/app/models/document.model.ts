
export interface IDocument 
{
    documentId: number;
    documentType: string;
    fileName: string;
    fileUrl: string;
    physicalFileUrl: string;
    associatedId: number;
    associatedType: string;
    isDeleted: boolean;
    flag: number;
    row: string;
    totalRowCount: string;
}
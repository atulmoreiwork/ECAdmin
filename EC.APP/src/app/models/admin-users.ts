
export interface IUsers {
    userId: number;
    roleId: number;
    roleName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;   
    phoneNumber: string;  
    status: string;  
    row: string;
    totalRowCount: string;
    flag: number;
}


export interface IRole {
    roleId: number;
    roleName: string;
    roleDescription: string;
    userCount: number;
    row: string;
    totalRowCount: string;
    flag: number;
}



export interface IPermissions
{
    adminDashBoardId: number;
    name: string;
    alias: string;
    isSelected: boolean;
}

export interface  permission {
    adminDashBoardId: number;
    name: string;  
    alias: string; 
    isSelected: boolean
}
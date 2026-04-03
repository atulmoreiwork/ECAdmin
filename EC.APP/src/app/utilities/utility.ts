interface User {
  userId: string;
  name: string;
  email: string;
}


export function getUserName(): string {
  const userData = localStorage.getItem("userClaimData");

  if (!userData) {
    return "";
  }

  try {
    const user: User = JSON.parse(userData);
    return user.name || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  }
}

export function getUserId(): string {
  const userData = localStorage.getItem("userClaimData"); 
  if (!userData) {
    return "";
  } 
  try {
    const user: User = JSON.parse(userData);
    return user.userId || "";
  } catch (error) {
    console.error("Error parsing user data:", error);
    return "";
  } 
}
export interface LoginResponseDto {
  userId: number;     
  fullName: string;    
  roles: string[];     
  userType: string;    
  token: string;
}

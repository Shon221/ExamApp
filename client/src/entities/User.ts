import type { UserRole } from './enums';
import { UserRole as UserRoleConst } from './enums';

export interface IUserData {
  id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
}

export class User {
  readonly id: string;
  email: string;
  password: string;
  fullName: string;
  role: UserRole;

  constructor(id: string, email: string, password: string, fullName: string, role: UserRole) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.role = role;
  }

  static fromData(data: IUserData): User {
    return new User(data.id, data.email, data.password, data.fullName, data.role);
  }

  toData(): IUserData {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      role: this.role,
    };
  }

  toPublicView(): Omit<IUserData, 'password'> {
    const { password: _, ...publicData } = this.toData();
    return publicData;
  }

  isTeacher(): boolean {
    return this.role === UserRoleConst.Teacher;
  }

  isStudent(): boolean {
    return this.role === UserRoleConst.Student;
  }
}

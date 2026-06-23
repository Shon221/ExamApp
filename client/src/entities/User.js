import { UserRole } from './enums';

export class User {
  constructor(id, email, password, fullName, role) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.fullName = fullName;
    this.role = role;
  }

  static fromData(data) {
    return new User(data.id, data.email, data.password, data.fullName, data.role);
  }

  toData() {
    return {
      id: this.id,
      email: this.email,
      password: this.password,
      fullName: this.fullName,
      role: this.role,
    };
  }

  toPublicView() {
    const { password: _, ...publicData } = this.toData();
    return publicData;
  }

  isTeacher() {
    return this.role === UserRole.Teacher;
  }

  isStudent() {
    return this.role === UserRole.Student;
  }
}

export class Login {
  email: string;
  password: string;

  toString() {
    return ('email = ' + this.email + '\n' +
      'password = ' + this.password + '\n');
  }
}

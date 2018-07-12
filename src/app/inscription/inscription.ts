export class Inscription {
  firstname: string;
  lastname: string;
  email: string;
  password: string;

  toString() {
    return ('firstname = ' + this.firstname + '\n' +
      'lastname = ' + this.lastname + '\n' +
      'email = ' + this.email + '\n' +
      'password = ' + this.password + '\n');
  }
}

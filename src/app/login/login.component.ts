import {
  Component,
  OnInit,
  ElementRef
} from '@angular/core';
import {
  FormBuilder, Validators,
  ValidatorFn, AbstractControl,
  FormGroup, FormControl
} from '@angular/forms';
import {Router} from '@angular/router';

import {Login} from './login';
import {CobizService} from '../cobiz.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html'
})

export class LoginComponent implements OnInit {
  public login = new Login();
  public errorServer = '';				// Affiche les erreurs provenant de l'API

  constructor(
    private cobizService: CobizService,
    private router: Router
  ) {
  }

  ngOnInit() {
  }

  // gere les boutons 'Continuer'
  onSubmit() {
    // console.log("LoginComponent onSubmit()");

    // Login du compte !
    this.cobizService.logIn(this.login)
      .then(response => {
          // console.log("LoginComponent logIn() response = " + response);
          this.errorServer = '';
          this.router.navigate(['/profil']);
        },
        error => {
          // console.log("LoginComponent logIn() error = " + error);
          this.errorServer = error;
        });
  }

}

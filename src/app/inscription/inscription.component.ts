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

import {
  Router,
  ActivatedRoute
} from '@angular/router';

import {Inscription} from './inscription';
import {CobizService} from '../cobiz.service';

const FIRST_DIV = 1;
const PWD_DIV = 2;
const LAST_DIV = 3;
const CONFIRM_DIV = 4;
const DELAI_RETRY_EMAIL = 62000;		// En Millisecondes
const DELAI_SHOW_CONFIRM = 5000;		//

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styles: ['.disabledbutton { opacity: 0.4;}']
})

export class InscriptionComponent implements OnInit {
  public inscription = new Inscription;
  public showDiv = FIRST_DIV;

  public bInscrit = false;        // Indique si l'inscription a ete effectue (= true)
  public bSendEmail = false;			// Indique si l'email a ete renvoyer
  public errorServer = '';				// Affiche les erreurs provenant de l'API
  public enableValid = false;			// Sert a faire en sorte que le bouton continuer soit clickable

  public pwdForm = new FormBuilder().group(
    {
      password: ['', [Validators.required]],
      confirmPwd: ['', Validators.required]
    },
    {validator: this.areEqual}
  );
  private timer;

  constructor(
    private cobizService: CobizService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.route.params.subscribe((params) => {
      // console.log("InscriptionComponent token = " + params.token);
      if (params.token !== undefined) {
        this.cobizService.confirmAccount(params.token)
          .then(response => {
              this.errorServer = '';
              this.showDiv = CONFIRM_DIV;
              this.timer = setTimeout(() => {
                this.router.navigate(['/login']);
              }, DELAI_SHOW_CONFIRM);
            },
            error => {
              this.errorServer = error;
            });
      }
    });

  }

  // gere les boutons 'Continuer'
  onSubmit() {
    // console.log("InscriptionComponent onSubmit()");
    if (this.showDiv === FIRST_DIV) {
      this.cobizService.checkEmail(this.inscription)
        .then(response => {
            // console.log("InscriptionComponent checkEmail() response = " + response);
            if (response === 'OK') {
              this.errorServer = '';
              this.showDiv = PWD_DIV;
            } else {
              this.errorServer = 'Cet email est déja enregistré !';
            }
          },
          error => {
            console.log('InscriptionComponent checkEmail() error = ' + error);
            this.errorServer = error;
          });
    } else if (this.showDiv === PWD_DIV) {
      // Verif confirm mot de passe ( si non gerer par HTML )
      // if ( !this.pwdForm.get('confirmPwd').getError("mismatch") ) {
      // Pour empecher le click intempestif sur le bouton Submit
      this.bInscrit = true;

      // Creation du compte !
      this.inscription.password = this.pwdForm.get('password').value;
      this.cobizService.createAccount(this.inscription)
        .then(response => {
            this.errorServer = '';
            this.showDiv = LAST_DIV;
          },
          error => {
            // console.log("InscriptionComponent onSubmit() error = " + error);
            this.errorServer = error;
          });
    } else {
      /*
          //	Pour empecher le click intempestif sur le bouton Submit (--> voir le delai = DELAI_RETRY_EMAIL)
          this.bSendEmail				= true;
          this.timer 					= setTimeout(() => {this.bSendEmail	= false}, DELAI_RETRY_EMAIL);
          //	On est sur LAST_DIV : On envoie l'email
          this.cobizService.sendConfirmEmail({"email":this.inscription.email, "password":this.inscription.password})
              .then(response => {
                  this.errorServer	= "";
              },
              error => {
                  //console.log("InscriptionComponent onSubmit() error = " + error);
                  this.errorServer	= error;
                  this.bSendEmail		= false;
                  clearTimeout(this.timer);
              });
          */
    }
  }

  // gere le boutons 'Retour'.
  onGoBack() {
    this.showDiv = FIRST_DIV;
  }

  // gere la modif de l'email
  changeEmail() {
    // console.log("InscriptionComponent changeEmail() = " + this.inscription.email );
    this.errorServer = '';
    this.bInscrit = false;
  }

  // gere le renvoie d'email
  reSendMail() {
    // Pour empecher le click intempestif sur le bouton Submit (--> voir le delai = DELAI_RETRY_EMAIL)
    this.bSendEmail = true;
    this.timer = setTimeout(() => {
      this.bSendEmail = false;
    }, DELAI_RETRY_EMAIL);
    // On est sur LAST_DIV : On envoie l'email
    this.cobizService.sendConfirmEmail({'email': this.inscription.email, 'password': this.inscription.password})
      .then(response => {
          this.errorServer = '';
        },
        error => {
          // console.log("InscriptionComponent onSubmit() error = " + error);
          this.errorServer = error;
          this.bSendEmail = false;
          clearTimeout(this.timer);
        });
  }

  // Gere la conformité des champs password entre eux.
  private areEqual(group: FormGroup): ValidatorFn {
    const confirmPwd = group.get('confirmPwd');
    const ret = group.get('password').value === confirmPwd.value ? null : {mismatch: true};

    // Affecte l'erreur a l'element.
    confirmPwd.setErrors(ret);

    // console.log("InscriptionComponent areEqual() = " + ( ret ? 'mismatch' : 'ok' ) );
    return (control: AbstractControl): { [key: string]: any } | null => {
      return ret;
    };
  }
}

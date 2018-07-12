import {
  Component,
  OnInit,
  Input,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormsModule
} from '@angular/forms';

import { NgProgress } from 'ngx-progressbar';

import { CobizService } from '../cobiz.service';

import { SearchSociete } from './searchSociete/searchSociete';
import { Societe } from './searchSociete/societe';
import {ReponsePartnerApi} from './searchSociete/reponsePartnerApi';
import {Activite} from './Module/Activité';
import {forEach} from '@angular/router/src/utils/collection';
import {SocieteApi} from './searchSociete/societeApi';
import {ActivitéApi} from './Module/ActivitéApi';

// Numero des panneaux que l'on va afficher
const PROFIL_1 = 1;
const PROFIL_2 = 2;
const PROFIL_3 = 3;

@Component({
  selector: 'app-profil',
  templateUrl: './profil.component.html',
  entryComponents: [SearchSociete],
  styles: ['.disabledbutton { pointer-events: none; opacity: 0.4;}']
})

export class ProfilComponent implements OnInit {
  @ViewChild(SearchSociete) child: SearchSociete;
  @Input() errorSoc;
  public show = PROFIL_2;
  public error = '';
  public societe = new Societe();
  public enableValid1 = false;			// Sert a faire en sorte que le bouton 'valider' soit clickable
  public enableValid2 = false;			// Sert a faire en sorte que le bouton 'valider' soit clickable
  public checkBoxProfil1 = false;		// Recupere la valeur de la checkBox
  public errorServer = '';				// Affiche les erreurs provenant de l'API
  public listActivite: Activite[];

  constructor (
    public fb: FormBuilder,
    private cobizService: CobizService,
    public ngprogress: NgProgress
  ) {
    this.child = new SearchSociete(fb, cobizService, ngprogress);
  }

  ngOnInit () {
    this.generatelist();
  }

  //  Reception d'une erreur provenant du composant 'enfant'
  public receptError (error) {
    this.error = error;
  }

  //  Lors de reception de la societe provenant du composant 'enfant'
  public receptSociete (societe: Societe) {
    if (societe) {
      // console.log("receptSociete  = " + societe.SIRET);
      this.societe = societe;
    } else {
      this.societe = new Societe();
    }

    // Pour MaJ bouton Valider
    this.verifyValid();
  }

  public generatelist () {
    this.cobizService.listactivite()
      .then(response => {
        console.log('listactivite Response() response = ', response);
        this.errorServer = '';
        this.listActivite = response;
        console.log('listactivite Response() response = ', this.listActivite);
      }, error => {
        console.log('listactivite listactivite() error = ' + error);
        this.errorServer = error;
      });

  }

  // Validation des infos
  public onValidate (profilNb: Number) {
    if (profilNb === PROFIL_1) {
      this.show = PROFIL_2;
    } else {
      this.show = PROFIL_3;
    }
  }

  // Lors d'un click sur la CheckBox
  public changeCB () {
    // console.log('ProfilComponent changeCB()', this.checkBoxProfil1);
    this.verifyValid();
  }

  // Verification si la page est complete
  private verifyValid () {
    // console.log("ProfilComponent verifyValid() SIRET = ", ( this.societe.SIRET && this.societe.SIRET.length > 0 ) ? this.societe.SIRET :
    // '' );
    this.enableValid1 = this.societe.SIRET && this.societe.SIRET.length > 0 && this.checkBoxProfil1 ? true : false;
    // console.log("ProfilComponent verifyValid() enableValid = ", this.enableValid1  );
  }
}

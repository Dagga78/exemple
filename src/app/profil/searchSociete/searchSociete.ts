import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChildren
}                           from '@angular/core';
import {
    FormBuilder,
    Validators,
    FormControl
}                           from '@angular/forms';

import {BehaviorSubject}    from 'rxjs/BehaviorSubject';
import {Observable}         from 'rxjs/Observable';
import {Subject}            from 'rxjs/Subject';


// Observable class extensions
import 'rxjs/add/observable/of';
// Observable operators
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/takeUntil';

import {Societe}            from './societe';
import {CobizService}       from '../../cobiz.service';
import {Departement}        from './departement';
import {ReponsePartnerApi}  from './reponsePartnerApi';

import {NgProgress}         from 'ngx-progressbar';

@Component({
    selector:    'searchSociete-cmp',
    templateUrl: './searchSociete.html',
    //styleUrls:    ['searchSociete.css']
})

export class SearchSociete implements OnInit {

    @Output() errorEvent: EventEmitter<String>  = new EventEmitter<string>();
    @Output() okEvent: EventEmitter<Societe>    = new EventEmitter<Societe>();
    public societesDisp: Societe[];
    public alertSociete                         = "";
    public myFocusTriggeringEventEmitter        = new EventEmitter<boolean>();      //  Pour le focus sur le champ societé
    public maxFieldCharacters                   = 128;
    public listDept                             = new Departement().departement;
    public adresseSoc                           = "";

    private societes: Societe[];
    private controlValidator                    = Validators.compose([Validators.required, Validators.maxLength(this.maxFieldCharacters)]);
    private isAllSocietyRetrieved               = false;            //  Indique si la requete FindPartner() a bien ramené toutes les societes
    private searchTerms                         = new Subject<{}>();
    private savDept                             = "";
    private savSoc                              = "";
    private listMots                            = "( LE | LA | LES | DE | DES | DU | MON | MA | MES | SON | SA | SES | TON | TA | TES |D'|L'|T'| SUR | DANS | OU | A | ET )";
    private suppInSearch                        = new RegExp( this.listMots + "|[*.\\-\/']", "g");        //  Pour filtrer les *, point, \, tirets / et la liste de mots ci dessus
    private reponsePartner: ReponsePartnerApi;
    private subscribeSociete;
    private subscription;
    private stopSubscription: Subject<boolean>;
    private villes                              = [];

    public searchSocieteForm = this.fb.group({
        dept: [''],
        societe: ['', this.controlValidator],
        siret: ['', this.controlValidator]
    });

    constructor(
        public fb: FormBuilder,
        private cobizService: CobizService,
        public ngProgress: NgProgress
    ){}  

    public ngOnInit(): void {
        //  Pour gerer les evenements de changements des valeurs dans les 2 champs du formulaire lancant la recherche
        this.searchSocieteForm.controls["dept"].valueChanges.subscribe(data => this.onValueChanged(1, data));
        this.doSubscribeSociete();
        this.doSubscription();
        this.disablescroll(null);       
    }

    //    Renvoie la societe selectionné, sinon affiche un message d'erreur
    public getSociete() {
        //console.log("searchSociete.getSociete()");
        this.errorEvent.emit("");
        let retour            = null;

        if (this.searchSocieteForm.valid) {
            retour            = this.searchSocieteForm.value;
            //console.log( "searchSociete.getSociete() formData.siret = ", formData.siret);
        }
        else if (!this.searchSocieteForm['siret'] || this.searchSocieteForm['siret'].length == 0) {
            //console.log( "getSociete() Erreur : Siret non remplie !");
            this.alertSociete = "Choisissez la société !";
        }
        else {
            this.errorEvent.emit("Une erreur de saisie dans le formulaire !");
        }

        return retour;
    }
        
    //  Pour lancer la recherche si changement du Dept ou de la societe
    public onValueChanged(type: number, data?: any) {
        //console.log( "onValueChanged() type = " + type + " data = " + data + " len = " + data.length);
        var bLance        = false;
        this.alertSociete = "";
        let saisie        = data.toUpperCase().replace(this.suppInSearch, " ");
        //console.log("onValueChanged() saisie = " + saisie );
        let lenSaisie     = saisie.length;
        let socLen        = this.savSoc.length;
        //    Minimum de lettre a saisir avant le lancement de la requete, suivant la saisie ou non du departement
        let minSaisie     = (this.savDept.length > 0 ? 1 : 2);

        if (type == 1 && this.savDept != data) {
            this.savDept  = data;
            //this.savSoc = this.searchSocieteForm.controls['societe'].value;
            //console.log("onValueChanged() this.savSoc = " + this.savSoc );
            let minSaisie = (this.savDept.length > 0 ? 1 : 2);
            bLance        = (this.savSoc.length > minSaisie);
            this.myFocusTriggeringEventEmitter.emit(true);
        }
        else if (type == 2 && lenSaisie > minSaisie && this.savSoc != saisie) {
            //    Raz du choix de la societe
            this.razChoiceSociete();

            //  On ne lance pas une requete findPartner() si on a deja tout dans la liste ( gere par datalist )
            //console.log("onValueChanged() data = " + data + " savSoc = " + this.savSoc + " soclen = " + socLen);
            if (this.societes && this.societes.length > 0 && this.isAllSocietyRetrieved && lenSaisie > socLen) {
                //  Traitement de la liste des societes a afficher
                var societesDisp = [];
                let suppInSearch = this.suppInSearch;
                this.societes.forEach(function (societe) {
                    let enseigne = societe.ENSEIGNE.toUpperCase().replace(suppInSearch, " ");
                    //console.log("onValueChanged() enseigneSub = " + enseigneSub );
                    if ( enseigne.indexOf(saisie) > -1 ) {
                        societesDisp.push(societe);
                    }
                });


                this.societesDisp = societesDisp;
                //console.log("onValueChanged() change processed : societesDisp.length = " + this.societesDisp.length);
            }
            else if (socLen == 0 || lenSaisie > socLen || saisie.substring(0, socLen) != this.savSoc) {
                this.savSoc    = saisie;
                bLance         = true;
            }
            else {
                //console.log("onValueChanged() change but not processed !");
            }
        }
        else {
            if (type == 2 && lenSaisie < (minSaisie + 1)) {
               //    Raz du choix de la societe
                this.razChoiceSociete();
                
                this.savSoc    = saisie;
                this.societes  = this.societesDisp = [];
                if (this.ngProgress.isStarted()) {
                    //console.log("onValueChanged() Stop query !");
                    this.ngProgress.done();
                    this.stopSubscription.next(true);
                    this.stopSubscription.unsubscribe();
                    this.doSubscription();
                }
            }
            else {
                this.societesDisp = this.societes;
            }

            //console.log("onValueChanged() no change !");
        }

        //  Demande une nouvelle recherche
        if (bLance) {
            //  RaZ le No de Siret
            this.searchSocieteForm.controls['siret'].setValue("");
            this.isAllSocietyRetrieved = false;

            var data : any;
            //    Si on n'a pas saisi un No de Siret
            if ( lenSaisie < 13 || isNaN( Number(this.savSoc)) ) {
                data = {'societe': this.savSoc, 'dept' :this.savDept};
            }
            else {
                data = {'siret': this.savSoc};
            }

             this.search(data);
        }

        this.errorEvent.emit("");
    }

    /*
     Fleche bas dans la saisie des societes : on se place sur la 1ere societe dans la liste
     Apres defilement haut ou bas dans la liste avec les fleches.
    */
    public onKeyArrow(event: any, elem: string, numElem: number, descending: boolean) {
        //console.log("onKeyArrow() event = " + event + " elem = " + elem );
        if (elem) {
            //  Recuperation de l'element HTML suivant ou precedent ( suivant 'decending') pour y mettre le focus
            let listElem = (<HTMLInputElement> document.getElementById(elem + (descending ? numElem + 1 : numElem - 1)));
            //console.log("onKeyArrow() listElem = " + listElem );
            if (listElem) {
                listElem.focus();
            }
        }
    }

    // Push a search term into the observable stream.
    private search(term: {}): void {
        //console.log( "Another search()");
        this.searchTerms.next(term);
        this.doProgress();
    }

    //    Raz Choix de la Societe
    private razChoiceSociete() {
         //  Envoi un evenement pour raz le choix de la societe
        if (this.adresseSoc != "" ) {
            this.okEvent.emit(null);
            this.adresseSoc = "";
            this.searchSocieteForm.controls['siret'].setValue("");
        }
    }
    //  L'utilisateur a selectionné une societe
    private assignASociete(societe: Societe) {
        //      let nomSociete              = societe.ENSEIGNE + " - " + societe.ADDR;
        let nomSociete         = societe.ENSEIGNE;
        this.searchSocieteForm.controls['siret'].setValue(societe.SIRET);

        //  Arrete l'ecoute sur l'input 'societe'
        this.subscribeSociete.unsubscribe();
        this.searchSocieteForm.controls['societe'].setValue(nomSociete);

        //  Envoi un evenement donnant la societe selectionné
        this.okEvent.emit(societe);

        //  Reprend l'ecoute
        this.doSubscribeSociete();

        //  Remet le Focus
        this.myFocusTriggeringEventEmitter.emit(true);

        //  Supprime l'affichage de la liste
        this.societesDisp              = [];
        this.isAllSocietyRetrieved     = false;

        //    Affiche l'adresse de la societe selectionnée
        this.adresseSoc                = societe.ADDR;
    }

    /*
        Arrete le scroll si fleche haut ou bas
    */    
    private disablescroll(event: any) {
        //console.log("disablescroll");
        var keys = {};
        window.addEventListener("keydown", function (e) {
            keys[e.keyCode] = true;
            switch (e.keyCode) {
                case 38: case 40: // Arrow keys up and down    // Space case 32: 
                    e.preventDefault(); break; 
                default: break; // do not block other keys
            }
        }, false);
    }

    //    Souscription à onValueChange() pour le champ 'societe'
    private doSubscribeSociete() {
        this.subscribeSociete = this.searchSocieteForm.controls["societe"].valueChanges.subscribe(data => this.onValueChanged(2, data));
    }

    //    Gestion de la souscription a la recherche de societes (par les Api)
    private doSubscription() {
        this.stopSubscription = new Subject<boolean>();
        this.searchTerms = new Subject<{}>();
        this.subscription = this.searchTerms
            .debounceTime(800)
            .distinctUntilChanged()
            .switchMap(term => term
                ? this.cobizService.findSociete(term)
                : Observable.of(JSON))
            .catch(error => {
                console.log("searchTerms catch Error " + error);
                this.errorEvent.emit(error);

                this.ngProgress.done();

                //  RaZ
                return Observable.of(JSON);
            })
            .takeUntil(this.stopSubscription)
            .subscribe(
            (jsonReponse) => {
                this.ngProgress.done();
                this.reponsePartner = new ReponsePartnerApi(jsonReponse);
                this.societes = this.reponsePartner.records;

                if (this.societes && !(typeof this.reponsePartner.nhits === 'undefined')) {
                    this.societesDisp = this.societes;
                    let nbSocietes = this.societes.length;
                    let nbHits = this.reponsePartner.nhits;
                    this.isAllSocietyRetrieved = (nbSocietes == nbHits ? true : false);
                    //console.log("searchTerms success ! nb societes = " + nbSocietes + " nbHits = " + nbHits);
                    //console.log("searchTerms success ! isAllSocietyRetrieved = " + this.isAllSocietyRetrieved );

                    if (nbSocietes == 0 && this.isAllSocietyRetrieved) {
                        this.alertSociete = "Aucune société trouvée !";
                        //this.searchSocieteForm.controls['societe'].setValue("");
                    }
                    else if (nbSocietes == 1 && this.isAllSocietyRetrieved) {
                        this.assignASociete(this.societes[0]);
                    }
                    else if (!this.isAllSocietyRetrieved) {
                        this.alertSociete = nbHits + " résultats... Précisez le nom de la société..." +
                            (this.savDept.length == 0 ? "  ou sélectionnez un département ..." : "");
                    }
                    else {
                        this.alertSociete = "";
                    }
                }
                else {
                    this.societesDisp = [];
                    this.alertSociete = "Erreur lors de la récuperation des sociétés !";
                }
            },
            (error) => {                                                    // error
                console.log("searchTerms Error !");
                this.ngProgress.done();
            },
            () => {                                                         // completed/always
                //console.log("searchTerms completed !");
                this.ngProgress.done();
                this.stopSubscription.unsubscribe();
                this.doSubscription();
            }
            );
    }

    //    Recherche une societe dans la liste qui a le No de Siret : 'siret'
    private findSocieteWithSiret(siret: string): Societe {
        var societe: Societe;
        if (this.societes && this.isNumeric(siret)) {
            var bTrouve = false;
            for (var i = 0; i < this.societes.length && !bTrouve; i++) {
                if (this.societes[i].SIRET == siret) {
                    bTrouve = true;
                    societe = this.societes[i];
                }
            }
        }
        return societe
    }

    //    Verif si 'input' est numeric. Retourne true si vrai.
    private isNumeric(input) {
        return (input - 0) == input && ('' + input).trim().length > 0;
    }

    //    Lance une Progress Barre
    private doProgress() {
        this.ngProgress.start();
        setTimeout(() => {
            this.ngProgress.done();
        }, 50000);
    }

}

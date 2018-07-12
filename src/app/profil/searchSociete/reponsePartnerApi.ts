import { Societe }           from './societe';
import { SocieteApi }        from './societeApi';

/*
    Recuperation des societes fourni par un appel a l' Api de data.opendatasoft.com
*/
export class ReponsePartnerApi {
    nhits: number;
    recordsApi: SocieteApi[];

    constructor (reponse:Array<JSON>) {
        this.recordsApi     = [];
        this.nhits          = reponse.length;

        if ( reponse.length > 0  && reponse[0] != null ) {
            var societe:SocieteApi;
            for (var i = 0; i < reponse.length; ++i) {
                var fields  = reponse[i];

                societe     = new SocieteApi(fields);
                this.recordsApi.push(societe);
            }
        }
    }

    public get records() : Societe[] {
        return this.recordsApi as Societe[];
    }
}

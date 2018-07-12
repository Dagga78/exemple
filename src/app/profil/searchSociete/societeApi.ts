import { Societe }      from './societe';

export class SocieteApi extends Societe {

    constructor( fields:Object) {
    	super ();
    	this.SIRET				= fields['siret'];
    	this.ENSEIGNE			= fields['nom'];
    	this.ADDR				= fields['adresse'] + ", " + fields['ville'];
    	this.DATE_CREATION		= fields['date_creation'];
    	this.EFFECTIF			= fields['effectif'];
    }

}

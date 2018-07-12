import {Activite} from './Activité';

export class ActivitéApi extends Activite {

  constructor(fields: Object) {
    super();
    this.name = fields['name'];
    this.value = fields['value'];
  }

}

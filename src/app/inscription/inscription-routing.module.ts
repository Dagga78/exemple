import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {InscriptionComponent} from './inscription.component';

const inscriptionRoutes: Routes = [
  {
    path: 'inscription',
    component: InscriptionComponent,
    children: []
  },
];

@NgModule({
  imports: [
    RouterModule.forChild(inscriptionRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class InscriptionRoutingModule {
}

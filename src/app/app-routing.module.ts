import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

import {AppComponent} from './app.component';
import {InscriptionComponent} from './inscription/inscription.component';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {ProfilComponent} from './profil/profil.component';

const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'profil', component: ProfilComponent},
  // { path: 'inscription',							 component: InscriptionComponent },
  {path: 'inscription/:token/confirm', component: InscriptionComponent},
  {path: '', component: HomeComponent}
  /*{ path: '**',                                           redirectTo: '', pathMatch: 'full' }*/
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {enableTracing: false})],
  exports: [RouterModule]
})

export class AppRoutingModule {
}

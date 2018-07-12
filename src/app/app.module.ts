import {
  NgModule,
  LOCALE_ID
} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpModule} from '@angular/http';
import {
  FormsModule,
  ReactiveFormsModule
} from '@angular/forms';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import {NgProgressModule} from 'ngx-progressbar';

import {AppRoutingModule} from './app-routing.module';
import {InscriptionRoutingModule} from './inscription/inscription-routing.module';

import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {InscriptionComponent} from './inscription/inscription.component';
import {LoginComponent} from './login/login.component';
import {ProfilComponent} from './profil/profil.component';

import {CobizService} from './cobiz.service';
import {Inscription} from './inscription/inscription';
import {SearchSociete} from './profil/searchSociete/searchSociete';

// the second parameter 'fr' is optional
registerLocaleData(localeFr, 'fr');

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    InscriptionComponent,
    LoginComponent,
    ProfilComponent,
    SearchSociete
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule,
    ReactiveFormsModule,
    NgProgressModule,
    AppRoutingModule,
    InscriptionRoutingModule
  ],
  providers: [
    {provide: LOCALE_ID, useValue: 'fr'},
    CobizService,
    Inscription
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}

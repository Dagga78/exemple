import {Injectable, isDevMode} from '@angular/core';
import {Headers, RequestOptions, ConnectionBackend} from '@angular/http';
import {Http} from '@angular/http';

import {Observable} from 'rxjs';

import {environment} from '../environments/environment';
import {Inscription} from './inscription/inscription';
import {Login} from './login/login';
import {promise} from 'selenium-webdriver';

@Injectable()
export class CobizService {
  private baseUrl;
  private options = new RequestOptions({
    headers: new Headers({
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    })
  });

  constructor(private http: Http) {
    console.log('Dev mode : ' + isDevMode());
    this.baseUrl = environment.baseUrlApi;
    console.log('baseUrl : ' + this.baseUrl);
  }

  // Retire l'authent des headers
  unsetAuthent() {
    this.options.headers.delete('Authorization');
  }

  // Login compte utilisateur
  logIn(formdata: Login): Promise<any> {
    // console.log('logIn() formdata : ' + formdata.toString());
    const url = `${this.baseUrl}authent/login`;
    return this.http
      .post(url, formdata, {headers: this.options.headers})
      .toPromise()
      .then(response => {
        // console.log('CobizService logIn() response : ', response);
        this.setAuthent(response.json().token);
        return;
      })
      .catch(this.handleError);
  }

  // Creation compte utilisateur
  checkEmail(formdata: Inscription): Promise<any> {
    // console.log('checkEmail() formdata : ' + formdata.toString());
    const url = `${this.baseUrl}authent/check`;
    return this.http
      .post(url, formdata, {headers: this.options.headers})
      .toPromise()
      .then(response => {
        return Promise.resolve('KO');
      })
      .catch((error: any) => {
        if (error.status === 404) {
          return Promise.resolve('OK');
        } else {
          this.handleError(error);
        }
      });
  }

  //    Creation compte utilisateur
  createAccount(formdata: Inscription): Promise<any> {
    // console.log('createAccount() formdata : ' + formdata.toString());
    const url = `${this.baseUrl}authent/init`;
    return this.http
      .post(url, formdata, {headers: this.options.headers})
      .toPromise()
      .then(response => {
        console.log('CobizService createAccount() response : ', response);
        return;
      })
      .catch(this.handleError);
  }

  //    Demande d'envoi d'email de confirmation
  sendConfirmEmail(formdata: any): Promise<any> {
    // console.log('sendConfirmEmail() formdata : ' + formdata);
    const url = `${this.baseUrl}email/inscription`;
    return this.http
      .post(url, formdata, {headers: this.options.headers})
      .toPromise()
      .then(response => {
        console.log('CobizService sendConfirmEmail() response : ', response);
        return;
      })
      .catch(this.handleError);
  }

  //    Confirmation d'inscription : le token est envoyé dans le mail d'inscription
  confirmAccount(token: string): Promise<any> {
    // console.log('confirmAccount() token : ' + token);
    const url = `${this.baseUrl}authent/init/${token}/confirm`;
    return this.http
      .get(url, {headers: this.options.headers})
      .toPromise()
      .then(response => {
        console.log('CobizService confirmAccount() response : ', response);
        return;
      })
      .catch(this.handleError);
  }

  //    Recherche une societe via ODS API
  findSociete(data: any): Promise<any> {
    // console.log('findSociete() data : ', data);
    const url = `${this.baseUrl}company/search?` + (data.siret ? `siret=${data.siret}` : `name=${data.societe}&dep=${data.dept}`);
    return this.http.get(url, this.options)
      .toPromise()
      .then(response => {
        const jsonResp = response.json();
        // console.log('findSociete() jsonResp : ', jsonResp);
        return jsonResp;
      })
      .catch(this.handleError);
  }

  //    Ajoute l'authent dans les headers
  private setAuthent(token: string) {
    // console.log('CobizService setAuthent() token : ', token);
    this.options.headers.append('Authorization', token);

  }

  // Recupération objet activite
  listactivite(): Promise<any> {
    const url = `${this.baseUrl}company/listactivities`;
    return this.http.get(url, this.options)
      .toPromise()
      .then(response => {
        const jsonResp = response.json();
        console.log('listactivite() jsonResp : ', jsonResp);
        return jsonResp;
      })
      .catch(this.handleError);
  }
  //    Gere la recuperation des message d'ereur provenant de l'API
  private handleError(error: any): Promise<any> {
    console.log('An error occurred : ', error);
    if (error.status >= 400 && error.status < 500 && error.status !== 405) {
      //  Recuperation du message d'erreur du serveur nodeJs
      return Promise.reject(JSON.parse(error._body).error.trim());
    } else if (error.status === 405) {
      return Promise.reject(JSON.parse(error._body).message.trim());
    } else {
      if (typeof error === 'string') {
        return Promise.reject(error);
      } else {
        return Promise.reject('Erreur technique, nous faisons notre possible pour corriger le problème !');
      }
    }
  }
}

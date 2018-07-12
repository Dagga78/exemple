import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterTestingModule} from '@angular/router/testing';

import {NgProgressModule} from 'ngx-progressbar';
import {CobizService} from '../cobiz.service';
import {SearchSociete} from './searchSociete/searchSociete';

import {ProfilComponent} from './profil.component';

describe('ProfilComponent', () => {
  let component: ProfilComponent;
  let fixture: ComponentFixture<ProfilComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilComponent, SearchSociete],
      imports: [FormsModule, ReactiveFormsModule, HttpModule, RouterTestingModule, NgProgressModule],
      providers: [CobizService]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

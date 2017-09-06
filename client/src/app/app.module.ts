import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppComponent } from './app.component';
import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { FooterComponent } from './footer/footer.component';
import { HomeComponent } from './home/home.component';
import { ApplicationRouting } from "./app.routing";
import { AlertModule } from 'ngx-bootstrap';
import { HeaderComponent } from './header/header.component';
import { NavigationComponent } from './navigation/navigation.component';
import { EmailVerificationService, PasswordResetService } from '../services/';
import { AccordionModule } from 'ngx-bootstrap/accordion';
import { PasswordResetComponent } from './password-reset/password-reset.component';

@NgModule({
  imports: [
    ApplicationRouting,
    BrowserAnimationsModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    AlertModule.forRoot(),
    AccordionModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    EmailVerificationComponent,
    FooterComponent,
    HomeComponent,
    HeaderComponent,
    NavigationComponent,
    PasswordResetComponent
  ],
  providers: [
    EmailVerificationService,
    PasswordResetService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

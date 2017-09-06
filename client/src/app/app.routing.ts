/*
 * Copyright (c) 2016 VMware, Inc. All Rights Reserved.
 * This software is released under MIT license.
 * The full license information can be found in LICENSE in the root directory of this project.
 */
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { Routes, RouterModule } from '@angular/router';

import { EmailVerificationComponent } from './email-verification/email-verification.component';
import { HomeComponent } from './home/home.component';
import { PasswordResetComponent } from "./password-reset/password-reset.component";


export const ApplicationRoutes: Routes = [
    // For testing this first line, you can have the base rout redirected to the component you're working on.
    {path: '', redirectTo: 'reset-password', pathMatch: 'full'},
    //{path: '', redirectTo: 'home', pathMatch: 'full'},
    {path: 'home', component: HomeComponent},
    {path: 'magazine', component: HomeComponent},
    {path: 'support', component: HomeComponent},
    {path: 'my-account', component: HomeComponent},
    {path: 'verify-email', component: EmailVerificationComponent},
    {path: 'reset-password', component: PasswordResetComponent}
];

export const ApplicationRouting: ModuleWithProviders = RouterModule.forRoot(ApplicationRoutes);

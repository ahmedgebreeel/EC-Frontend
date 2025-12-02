import { Routes } from '@angular/router';
import { Account } from './features/auth/account/account';

export const routes: Routes = [

    {
        path: 'register',
        loadComponent: () => import('./features/auth/register/register').then(m => m.Register)
    },
    {
        path: 'login',
        loadComponent: () => import('./features/auth/login/login').then(m => m.Login)
    },

    {
        path: 'Account',
        loadComponent: () => import('./features/auth/account/account').then(m => m.Account)
    },
    
    

];

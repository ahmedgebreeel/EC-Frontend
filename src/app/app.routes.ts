import { Routes } from '@angular/router';

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
        path: 'about',
        loadComponent: () => import('./features/about/about').then(m => m.About)
    },
    {
        path: 'contactus',
        loadComponent: () => import('./features/contact-us/contact-us').then(m => m.ContactUs)
    },
    
    

];

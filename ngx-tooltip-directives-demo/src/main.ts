

import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { provideAnimations } from '@angular/platform-browser/animations';


bootstrapApplication(AppComponent,
  {
    providers: [
      importProvidersFrom(),
      provideRouter(APP_ROUTES, withComponentInputBinding()),
      provideAnimations(),  
    ]
  })
  .catch(err => console.error(err));

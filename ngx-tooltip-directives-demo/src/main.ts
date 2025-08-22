

import { provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { APP_ROUTES } from './app/app.routes';
import { AppComponent } from './app/app.component';


bootstrapApplication(AppComponent,
  {
    providers: [
		provideRouter(APP_ROUTES, withComponentInputBinding()),
		provideZonelessChangeDetection(),
    ]
  })
  .catch(err => console.error(err));

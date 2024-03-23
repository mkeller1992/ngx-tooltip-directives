import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgxTooltipDirectivesModule } from '@ngx-tooltip-directives';
import { AngularDraggableModule } from 'angular2-draggable';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularDraggableModule,
    NgxTooltipDirectivesModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

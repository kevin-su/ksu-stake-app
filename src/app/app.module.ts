import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { BrowserModule } from '@angular/platform-browser';
import { MockApiInterceptor } from './services/mock-api-interceptor';
import { NgModule } from '@angular/core';
import { RouteReuseStrategy } from '@angular/router';

@NgModule({
  declarations: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: MockApiInterceptor, multi: true },
  ],
})
export class AppModule {}

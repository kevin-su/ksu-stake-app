import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { routes } from './app/app-routing.module';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MockApiInterceptor } from './app/services/mock-api-interceptor';

enableProdMode();

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: MockApiInterceptor, multi: true },
    importProvidersFrom(IonicModule.forRoot({})),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),
  ],
});

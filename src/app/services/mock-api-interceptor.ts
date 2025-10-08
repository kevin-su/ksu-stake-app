import * as mockData from './mock-data';

import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Observable, of } from 'rxjs';

import { Injectable } from '@angular/core';
import { Stock } from '../models/stock.model';
import { delay } from 'rxjs/operators';

@Injectable()
export class MockApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    const { url, method } = request;

    const randomizePrices = (stocks: Stock[]): Stock[] => {
      return stocks.map((stock) => {
        const change = Math.random() * 2 - 1;
        const newPrice = Math.max(0, stock.price + change);
        const changePercentage = (change / stock.price) * 100;
        return { ...stock, price: newPrice, change, changePercentage };
      });
    };

    if (url.endsWith('/api/top-tech-stocks') && method === 'GET') {
      return of(
        new HttpResponse({
          status: 200,
          body: randomizePrices(mockData.TOP_TECH_STOCKS),
        }),
      ).pipe(delay(100));
    }

    if (url.endsWith('/api/trending-stocks') && method === 'GET') {
      return of(
        new HttpResponse({
          status: 200,
          body: randomizePrices(mockData.TRENDING_STOCKS),
        }),
      ).pipe(delay(100));
    }

    if (url.endsWith('/api/user-profile-stocks') && method === 'GET') {
      return of(
        new HttpResponse({
          status: 200,
          body: randomizePrices(mockData.USER_PROFILE_STOCKS),
        }),
      ).pipe(delay(100));
    }

    if (url.endsWith('/api/buy') && method === 'POST') {
      const { stock, amount } = request.body as {
        stock: Stock;
        amount: number;
      };
      const userStock = mockData.USER_PROFILE_STOCKS.find(
        (s) => s.symbol === stock.symbol,
      );
      if (userStock) {
        userStock.amount = (userStock.amount || 0) + amount;
      } else {
        mockData.USER_PROFILE_STOCKS.push({ ...stock, amount });
      }
      return of(
        new HttpResponse({ status: 200, body: { success: true } }),
      ).pipe(delay(100));
    }

    if (url.endsWith('/api/sell') && method === 'POST') {
      const { stock, amount } = request.body as {
        stock: Stock;
        amount: number;
      };
      const userStockIndex = mockData.USER_PROFILE_STOCKS.findIndex(
        (s) => s.symbol === stock.symbol,
      );
      if (userStockIndex > -1) {
        const userStock = mockData.USER_PROFILE_STOCKS[userStockIndex];
        if (userStock.amount && userStock.amount > amount) {
          userStock.amount -= amount;
        } else {
          mockData.USER_PROFILE_STOCKS.splice(userStockIndex, 1);
        }
      }
      return of(
        new HttpResponse({ status: 200, body: { success: true } }),
      ).pipe(delay(100));
    }

    return next.handle(request);
  }
}

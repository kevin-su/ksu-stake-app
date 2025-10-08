import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Stock } from '../models/stock.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) { }

  getTopTechStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>('/api/top-tech-stocks');
  }

  getTrendingStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>('/api/trending-stocks');
  }

  getUserProfileStocks(): Observable<Stock[]> {
    return this.http.get<Stock[]>('/api/user-profile-stocks');
  }

  searchStocks(query: string): Observable<Stock[]> {
    return this.http.get<Stock[]>(`/api/search?q=${query}`).pipe(
      map(stocks => stocks.filter(stock =>
        stock.name.toLowerCase().includes(query.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(query.toLowerCase())
      ))
    );
  }

  buyStock(stock: Stock, amount: number): Observable<any> {
    return this.http.post('/api/buy', { stock, amount });
  }

  sellStock(stock: Stock, amount: number): Observable<any> {
    return this.http.post('/api/sell', { stock, amount });
  }
}


import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { map, switchMap } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Stock } from '../models/stock.model';
import { StockModalComponent } from '../components/stock-modal/stock-modal.component';
import { StockStore } from '../services/stock.store';

@Component({
  selector: 'app-discover',
  templateUrl: 'discover.page.html',
  styleUrls: ['discover.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CurrencyPipe, DecimalPipe],
})
export class DiscoverPage {
  private query$ = new BehaviorSubject<string>('');
  readonly searchResults$: Observable<Stock[]>;

  constructor(
    private stockStore: StockStore,
    private modalCtrl: ModalController,
  ) {
    const userProfileSymbols$ = this.stockStore.userProfileStockSymbols$;

    this.searchResults$ = this.query$.pipe(
      switchMap((query) => {
        if (!query) {
          return of([]);
        }
        return combineLatest([
          this.stockStore.allStocks$,
          userProfileSymbols$,
        ]).pipe(
          map(([stocks, symbols]) =>
            stocks
              .filter(
                (stock) =>
                  stock.name.toLowerCase().includes(query.toLowerCase()) ||
                  stock.symbol.toLowerCase().includes(query.toLowerCase()),
              )
              .map((stock) => ({
                ...stock,
                isInProfile: symbols.has(stock.symbol),
              })),
          ),
        );
      }),
    );
  }

  handleInput(event: any) {
    this.query$.next(event.target.value);
  }

  async openStockModal(action: 'Buy' | 'Sell', stock: Stock) {
    const modal = await this.modalCtrl.create({
      component: StockModalComponent,
      componentProps: {
        stock,
        action,
      },
    });
    return await modal.present();
  }
}

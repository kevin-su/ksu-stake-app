import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { IonicModule, ModalController } from '@ionic/angular';
import { Observable, combineLatest } from 'rxjs';

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Stock } from '../models/stock.model';
import { StockModalComponent } from '../components/stock-modal/stock-modal.component';
import { StockStore } from '../services/stock.store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-invest',
  templateUrl: 'invest.page.html',
  styleUrls: ['invest.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, CurrencyPipe, DecimalPipe],
})
export class InvestPage {
  readonly userProfileStocks$: Observable<Stock[]> =
    this.stockStore.userProfileStocks$;
  readonly trendingStocks$: Observable<Stock[]>;
  readonly totalEquity$: Observable<number>;

  constructor(
    private stockStore: StockStore,
    private modalCtrl: ModalController,
  ) {
    const userProfileSymbols$ = this.stockStore.userProfileStockSymbols$;

    this.trendingStocks$ = combineLatest([
      this.stockStore.trendingStocks$,
      userProfileSymbols$,
    ]).pipe(
      map(([stocks, symbols]) =>
        stocks.map((stock) => ({
          ...stock,
          isInProfile: symbols.has(stock.symbol),
        })),
      ),
    );

    this.totalEquity$ = this.userProfileStocks$.pipe(
      map((stocks) =>
        stocks.reduce(
          (acc, stock) => acc + stock.price * (stock.amount || 0),
          0,
        ),
      ),
    );
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

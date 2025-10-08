import { Component, Input, OnInit } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { Stock } from '../../models/stock.model';
import { StockStore } from '../../services/stock.store';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-stock-modal',
  templateUrl: './stock-modal.component.html',
  styleUrls: ['./stock-modal.component.scss'],
  standalone: true,
  imports: [IonicModule, FormsModule, CommonModule],
})
export class StockModalComponent implements OnInit {
  @Input() stock!: Stock;
  @Input() action: 'Buy' | 'Sell' = 'Buy';

  stock$!: Observable<Stock | undefined>;
  amount = 1;

  constructor(
    private modalCtrl: ModalController,
    private stockStore: StockStore,
  ) {}

  ngOnInit() {
    this.stock$ = this.stockStore.allStocks$.pipe(
      map((stocks) => stocks.find((s) => s.symbol === this.stock.symbol)),
    );
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  confirm() {
    if (this.stock) {
      if (this.action === 'Buy') {
        this.stockStore.buyStock({ stock: this.stock, amount: this.amount });
      } else {
        this.stockStore.sellStock({ stock: this.stock, amount: this.amount });
      }
    }
    this.dismiss();
  }
}
